from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from core.models import User, Unit

class ProfileUpdateTests(APITestCase):
    def setUp(self):
        # Create a Unit
        self.unit = Unit.objects.create(name="Class 10A1", code="10A1")
        
        # Create a User
        self.user = User.objects.create_user(
            email='testuser@example.com', 
            password='password123',
            full_name='Old Name'
        )
        
        # URL for profile update
        self.url = reverse('user-me')

    def test_update_profile_success(self):
        """
        Ensure checking user provided valid fullname and unit updates profile successfully.
        """
        self.client.force_authenticate(user=self.user)
        
        data = {
            'full_name': 'New Name',
            'unit': self.unit.id
        }
        
        response = self.client.patch(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'New Name')
        self.assertEqual(response.data['unit'], self.unit.id)
        
        # Check DB update
        self.user.refresh_from_db()
        self.assertEqual(self.user.full_name, 'New Name')
        self.assertEqual(self.user.unit, self.unit)

    def test_update_profile_missing_unit(self):
        """
        Ensure updating profile without unit (sending null) fails.
        """
        self.client.force_authenticate(user=self.user)
        
        data = {
            'full_name': 'New Name',
            'unit': None  # Invalid, unit is required
        }
        
        response = self.client.patch(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Check error message (based on serializer Custom Validation)
        self.assertIn('unit', response.data)

    def test_update_profile_unauthenticated(self):
        """
        Ensure unauthenticated user cannot update profile.
        """
        data = {
            'full_name': 'New Name',
            'unit': self.unit.id
        }
        
        response = self.client.patch(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
