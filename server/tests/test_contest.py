from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from core.models import User, Contest

class ContestCRUDTests(APITestCase):
    def setUp(self):
        # Create a User
        self.user = User.objects.create_user(
            email='testuser@example.com', 
            password='password123',
            full_name='Test User'
        )
        
        # Contest Data
        self.contest_data = {
            'title': 'Test Contest',
            'description': 'A test contest description',
            'duration_minutes': 60,
            'passing_score': 5.0,
            'status': 'DRAFT'
        }
        
        self.list_create_url = reverse('contest-list-create')

    def test_create_contest_success(self):
        """
        Ensure authenticated user can create a contest.
        """
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(self.list_create_url, self.contest_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Contest.objects.count(), 1)
        self.assertEqual(Contest.objects.get().title, 'Test Contest')
        self.assertEqual(Contest.objects.get().created_by, self.user)

    def test_get_contest_list(self):
        """
        Ensure authenticated user can View list of contests.
        """
        self.client.force_authenticate(user=self.user)
        
        # Create 2 contests
        Contest.objects.create(title="Contest 1", created_by=self.user)
        Contest.objects.create(title="Contest 2", created_by=self.user)
        
        response = self.client.get(self.list_create_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_update_contest_success(self):
        """
        Ensure authenticated user can update a contest.
        """
        self.client.force_authenticate(user=self.user)
        
        contest = Contest.objects.create(title="Old Title", created_by=self.user)
        update_url = reverse('contest-update', args=[contest.id])
        
        updated_data = {
            'title': 'New Title',
            'description': 'Updated Description'
        }
        
        response = self.client.put(update_url, updated_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        contest.refresh_from_db()
        self.assertEqual(contest.title, 'New Title')
        self.assertEqual(contest.description, 'Updated Description')

    def test_create_contest_unauthenticated(self):
        """
        Ensure unauthenticated user cannot create a contest.
        """
        response = self.client.post(self.list_create_url, self.contest_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
