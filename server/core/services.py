import random
import string
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.core.cache import cache
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.exceptions import AuthenticationFailed
from .models import User

def validate_google_id_token(token: str) -> dict:
    """
    Validates a Google ID token and returns the user info.
    """
    try:
        # Verify with Audience (Client ID) if available
        audience = getattr(settings, 'GOOGLE_CLIENT_ID', None)
        id_info = id_token.verify_oauth2_token(token, requests.Request(), audience=audience)
        
        # Verify issuer
        if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        return id_info
    except Exception as e:
        raise AuthenticationFailed(f"The token is invalid or expired. {e}")

def get_or_create_google_user(google_user_data: dict) -> User:
    User = get_user_model()
    email = google_user_data.get('email')
    full_name = google_user_data.get('name', '')
    
    if not email:
        raise AuthenticationFailed('Email not found in Google token.')

    # Check if user exists
    try:
        user = User.objects.get(email=email)
        # We allow linking to existing accounts
        if user.auth_provider != 'google':
             user.auth_provider = 'google'
             user.google_id = google_user_data.get('sub')
             user.save()
    except User.DoesNotExist:
        # Create new user
        user = User.objects.create_user(
            email=email,
            password=None,
            full_name=full_name,
            auth_provider='google',
            is_active=True
        )
    
    return user

def send_password_reset_code(email: str):
    """
    Generates a code, saves it in Redis, and sends it via email.
    """
    User = get_user_model()
    if not User.objects.filter(email=email).exists():
        # Security: Do not reveal user existence, but for now we just return.
        # Ideally, send a generic email saying "if you have an account..."
        return

    # Generate 6-digit code
    code = ''.join(random.choices(string.digits, k=6))
    
    # Store in cache (Redis) for 15 minutes (900 seconds)
    cache_key = f"password_reset_code:{email}"
    cache.set(cache_key, code, timeout=900)
    
    # Send email
    subject = "JurisQBank - Password Reset Code"
    message = f"Your password reset code is: {code}\nThis code will expire in 15 minutes."
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
    except Exception as e:
        # Log error in production
        print(f"Error sending email: {e}")
        raise e

def verify_reset_code_and_set_password(email: str, code: str, new_password: str):
    cache_key = f"password_reset_code:{email}"
    cached_code = cache.get(cache_key)
    
    if not cached_code or cached_code != code:
        raise AuthenticationFailed("Invalid or expired reset code.")
    
    User = get_user_model()
    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        # Invalidate code
        cache.delete(cache_key)
    except User.DoesNotExist:
        raise AuthenticationFailed("User not found.")
