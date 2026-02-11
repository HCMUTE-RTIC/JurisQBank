from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from core.models.exams import Contest
from core.models.exams import Question
from core.models.exams import  ContestQuestion
import random


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'avatar_url', 'unit', 'created_at']
        read_only_fields = ['id', 'role', 'created_at']

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['full_name', 'avatar_url', 'unit']
    
    def validate_unit(self, value):
        if value is None:
            raise serializers.ValidationError("Unit/Class is required.")
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')
        
        attrs['user'] = user
        return attrs

class GoogleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True)

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # We don't want to reveal if a user exists or not, so we just return the value.
        # Ideally, you might check format.
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        uid = attrs.get('uid')
        token = attrs.get('token')
        password = attrs.get('new_password')

        try:
            uid = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise ValidationError('Invalid UID.')

        if not default_token_generator.check_token(user, token):
            raise ValidationError('Invalid or expired token.')

        attrs['user'] = user
        return attrs

#contest
class ContestSerializer(serializers.ModelSerializer):
    class Meta:
        model=Contest
        fields = [
            'id', 'title','description','thumbnail_url','start_time','end_time','duration_minutes','passing_score',
            'max_attempts','is_practice','status','settings','created_by','created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

#question
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

    def validate_options(self, value):
        """
        Kiểm tra cấu trúc JSONB đầu vào
        Kỳ vọng: List các object bao gồm {id, text, is_correct}
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("Options phải là một danh sách (List).")
        
        if len(value) < 2:
            raise serializers.ValidationError("Câu hỏi phải có ít nhất 2 lựa chọn.")

        has_correct_answer = False
        
        for item in value:
            
            if 'id' not in item or 'text' not in item:
                raise serializers.ValidationError("Mỗi option phải có key 'id' và 'text'.")
            
          
            if item.get('is_correct') is True:
                has_correct_answer = True

       
        if not has_correct_answer:
            raise serializers.ValidationError("Phải có ít nhất một đáp án đúng (is_correct: true).")

        return value
 #ContestQuestion
class ContestQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContestQuestion
        fields = ['id', 'contest', 'question', 'point', 'order']
        def validate_point(self, value):
           if value <= 0:
               raise serializers.ValidationError("Điểm số phải lớn hơn 0.")
           return value
# exam cho user      
class ExamPaperSerializer(serializers.ModelSerializer):
 
    question_id = serializers.ReadOnlyField(source='question.id')
    content = serializers.ReadOnlyField(source='question.content')
    question_type = serializers.ReadOnlyField(source='question.question_type')
    options = serializers.SerializerMethodField()

    class Meta:
        model = ContestQuestion
        # Chỉ trả về những thông tin cần thiết để làm bài
        fields = ['id', 'question_id', 'content', 'question_type', 'point', 'options']

    def get_options(self, obj):
        # Lấy danh sách options gốc từ bảng Question
        original_options = obj.question.options 
        
        # Nếu options không phải list (ví dụ null), trả về list rỗng
        if not isinstance(original_options, list):
            return []

        # Tạo list mới, chỉ giữ lại 'id' và 'text', LOẠI BỎ 'is_correct'
        safe_options = [
            {"id": opt.get("id"), "text": opt.get("text")} 
            for opt in original_options
        ]
        
        # (Tuỳ chọn) Trộn ngẫu nhiên thứ tự các đáp án A, B, C, D luôn
        random.shuffle(safe_options)
        
        return safe_options

        fields = [
            'id', 'content', 'question_type', 'difficulty', 
            'topic', 'options', 'created_by', 'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']
