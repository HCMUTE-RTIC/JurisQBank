from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from core.models.exams import Contest

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