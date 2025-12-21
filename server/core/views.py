from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated

from .serializers import (
    LoginSerializer, 
    GoogleLoginSerializer, 
    UserSerializer,
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

class LoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        tokens = get_tokens_for_user(user)
        return Response({
            'tokens': tokens,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = GoogleLoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        id_token = serializer.validated_data.get('id_token')
        
        google_data = validate_google_id_token(id_token)
        user = get_or_create_google_user(google_data)
        
        tokens = get_tokens_for_user(user)
        return Response({
            'tokens': tokens,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        send_password_reset_email(email)
        
        return Response(
            {"message": "If an account with this email exists, a password reset link has been sent."},
            status=status.HTTP_200_OK
        )

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        password = serializer.validated_data['new_password']
        
        user.set_password(password)
        user.save()
        
        return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
