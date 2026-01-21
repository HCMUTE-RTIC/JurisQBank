import random
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from core.models.exams import Contest
from core.serializers import ContestSerializer
from core.models.exams import Question
from core.serializers import QuestionSerializer
from rest_framework import viewsets, permissions, filters
from core.models.exams import ContestQuestion
from core.serializers import ContestQuestionSerializer, ExamPaperSerializer
from rest_framework.decorators import action 

from .serializers import (
    LoginSerializer, 
    GoogleLoginSerializer, 
    UserSerializer,
    UserUpdateSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from .services import validate_google_id_token, get_or_create_google_user, send_password_reset_email

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class LoginView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        tokens = get_tokens_for_user(user)
        return Response({
            'tokens': tokens,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class GoogleLoginView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = GoogleLoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        id_token = serializer.validated_data.get('id_token')
        
        google_data = validate_google_id_token(id_token)
        user = get_or_create_google_user(google_data)
        
        tokens = get_tokens_for_user(user)
        return Response({
            'tokens': tokens,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class UserMeView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get(self, request):
        return Response(self.get_serializer(request.user).data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

class PasswordResetRequestView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        send_password_reset_email(email)
        
        return Response(
            {"message": "If an account with this email exists, a password reset link has been sent."},
            status=status.HTTP_200_OK
        )

class PasswordResetConfirmView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        password = serializer.validated_data['new_password']
        
        user.set_password(password)
        user.save()
        
        return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)

#GET + POST /contests
class ContestListCreateView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ContestSerializer

    def get(self, request):
        contests = Contest.objects.all().order_by('-created_at')
        serializer = self.get_serializer(contests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
#PUT /contests/{id}/
class ContestUpdateView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ContestSerializer

    def put(self, request, contest_id):
        try:
            contest = Contest.objects.get(id=contest_id)
        except Contest.DoesNotExist:
            return Response(
                {"detail": "Contest not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(
            contest,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

class ContestStartExamView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExamPaperSerializer # Khai báo để Swagger nhận diện

    def get(self, request, contest_id):
        """
        Lấy danh sách câu hỏi, trộn ngẫu nhiên và che đáp án.
        """
        # 1. Query lấy câu hỏi thuộc contest_id này
        questions = list(ContestQuestion.objects.filter(contest_id=contest_id).select_related('question'))

        if not questions:
            return Response(
                {"detail": "Đề thi này chưa có câu hỏi nào."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Trộn câu hỏi (Shuffle)
        random.shuffle(questions)

        # 3. Serialize dữ liệu (Che đáp án)
        serializer = self.get_serializer(questions, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
#CRUD QUESTION   
class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer
    # Chỉ Admin hoặc người tạo mới được sửa
    permission_classes = [permissions.IsAuthenticated] 
    
    # Hỗ trợ filter/search để Admin dễ quản lý
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['content', 'topic'] # Cho phép tìm theo nội dung câu hỏi hoặc chủ đề
    ordering_fields = ['difficulty', 'created_at']

    def perform_create(self, serializer):
        # Tự động gán người tạo là user đang login (vì model có field created_by)
        serializer.save(created_by=self.request.user)

#CRUD CONTEST-QUESTION
class ContestQuestionViewSet(viewsets.ModelViewSet):
    queryset = ContestQuestion.objects.all()
    serializer_class = ContestQuestionSerializer





