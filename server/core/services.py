from django.conf import settings
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.exceptions import AuthenticationFailed

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()

def validate_google_id_token(token: str) -> dict:
    """
    Validates a Google ID token and returns the user info.
    """
    try:
        id_info = id_token.verify_oauth2_token(token, requests.Request())
        if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        return id_info
    except Exception as e:
        raise AuthenticationFailed(f"The token is invalid or expired. {e}")

def get_or_create_google_user(google_user_data: dict):
    email = google_user_data.get('email')
    full_name = google_user_data.get('name', '')
    
    if not email:
        raise AuthenticationFailed('Email not found in Google token.')

    try:
        user = User.objects.get(email=email)
        # Implicitly allow linking if user exists
    except User.DoesNotExist:
        user = User.objects.create_user(
            email=email,
            password=None,
            full_name=full_name,
            auth_provider='google',
            is_active=True
        )
    
    return user

def send_password_reset_email(email):
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Avoid leaking user existence
        return

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    # In production, this URL should come from settings (e.g. FRONTEND_URL)
    reset_url = f"http://localhost:3000/auth/reset-password?uid={uid}&token={token}"
    
    subject = "Password Reset Request - JurisQBank"
    message = f"Hello,\n\nYou requested a password reset. Please click the link below to reset your password:\n\n{reset_url}\n\nIf you did not request this, please ignore this email."
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@jurisqbank.com',
        [email],
        fail_silently=False,
    )
