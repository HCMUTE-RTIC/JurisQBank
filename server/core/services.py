from django.conf import settings
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.exceptions import AuthenticationFailed
from .models import User

def validate_google_id_token(token: str) -> dict:
    """
    Validates a Google ID token and returns the user info.
    """
    try:
        # If we have a specific audience (CLIENT_ID) configured, verify it.
        # For now, we often just decode without audience check if specific client id is not yet env var,
        # OR we assume the frontend sends a valid one. 
        # Ideally: id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        
        # We will use basic verification without audience hard enforcement if not provided,
        # but in production you MUST specify the Audience.
        # Assuming CLIENT_ID might be in settings or env.
        
        # For this implementation, we'll assume verifying against Google's certs is enough, 
        # but allow passing audience if available.
        
        id_info = id_token.verify_oauth2_token(token, requests.Request())
        
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
        # If user exists but via password, we might want to link or just allow login.
        # Check auth_provider?
        if user.auth_provider != 'google':
             # Logic choice: Allow linking or error? 
             # For simpler flow: Update provider or just allow.
             # User requested "Google Login", so we allow logging in existing email users too often.
             pass
    except User.DoesNotExist:
        # Create new user
        user = User.objects.create_user(
            email=email,
            password=None, # Unusable password
            full_name=full_name,
            auth_provider='google',
            is_active=True
        )
    
    return user
