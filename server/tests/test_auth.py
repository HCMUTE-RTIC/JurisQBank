from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch

User = get_user_model()

class AuthTests(APITestCase):

    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpassword123',
            'full_name': 'Test User'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.login_url = reverse('login')
        self.google_login_url = reverse('google-login')
        self.password_reset_url = reverse('password-reset-request')

    def test_login_success(self):
        data = {
            'email': 'test@example.com',
            'password': 'testpassword123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

    def test_login_failure_invalid_credentials(self):
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST) # Or 401 depending on your implementation, usually 400 for ValidationError or 401 for AuthenticationFailed

    @patch('core.services.id_token.verify_oauth2_token')
    def test_google_login_success(self, mock_verify):
        # Mock Google response
        mock_verify.return_value = {
            'iss': 'accounts.google.com',
            'email': 'google_user@example.com',
            'name': 'Google User'
        }

        data = {'id_token': 'dummy_valid_token'}
        response = self.client.post(self.google_login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], 'google_user@example.com')
        # Check if user is created in DB
        self.assertTrue(User.objects.filter(email='google_user@example.com').exists())

    @patch('core.services.id_token.verify_oauth2_token')
    def test_google_login_failure_invalid_token(self, mock_verify):
        # Mock verify to raise exception
        mock_verify.side_effect = ValueError('Invalid token')

        data = {'id_token': 'invalid_token'}
        response = self.client.post(self.google_login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED) # Assuming AuthenticationFailed maps to 401/403

    @patch('core.services.send_mail')
    def test_password_reset_request(self, mock_send_mail):
        data = {'email': 'test@example.com'}
        response = self.client.post(self.password_reset_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_send_mail.assert_called_once() 
