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
            "thumbnail_url": "https://d1hjkbq40fs2x4.cloudfront.net/2016-01-31/files/1045-2.jpg",
            "start_time": "2026-01-10T14:52:47.445Z",
            "end_time": "2026-01-10T14:52:47.445Z",
            "duration_minutes": 60,
            "passing_score": 5.0,
            "max_attempts": 2147483647,
            "is_practice": True,
            "status": "DRAFT",
            "settings": {}
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
        self.assertTrue(Contest.objects.get().is_practice)

    def test_get_contest_list(self):
        """
        Ensure authenticated user can View list of contests.
        """
        self.client.force_authenticate(user=self.user)
        
        # Create 2 contests
        Contest.objects.create(
            title="Contest 1", 
            created_by=self.user,
            description="Description 1",
            duration_minutes=30,
            status="PUBLISHED"
        )
        Contest.objects.create(
            title="Contest 2", 
            created_by=self.user,
            description="Description 2",
            duration_minutes=90,
            status="DRAFT"
        )
        
        response = self.client.get(self.list_create_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        # Verify order/content if necessary
        titles = [c['title'] for c in response.data]
        self.assertIn("Contest 1", titles)
        self.assertIn("Contest 2", titles)

    def test_retrieve_contest_detail(self):
        """
        Ensure authenticated user can retrieve a single contest.
        """
        self.client.force_authenticate(user=self.user)
        
        contest = Contest.objects.create(
            title="Detail Contest", 
            created_by=self.user,
            description="Detail Description",
            duration_minutes=45
        )
        detail_url = reverse('contest-update', args=[contest.id]) # Assuming detail uses the same url pattern name structure or we check urls.py. 
        # Usually detail is separate or same as update/delete (generic RetrieveUpdateDestroyAPIView).
        # The user has 'contest-update', let's check if there is a 'contest-detail' or if 'contest-update' handles GET.
        # But typically ViewSets use 'contest-detail'. 
        
        # Let's double check the url names. 
        # In setUp, self.list_create_url = reverse('contest-list-create')
        # In test_update, update_url = reverse('contest-update', args=[contest.id])
        
        # If it's a standard viewset or crud views, GET on detail url should work.
        # I'll use 'contest-update' for now assuming it maps to the detail endpoint (RetrieveUpdateDestroyAPIView)
        # If failing, I will check urls.py.
        
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Detail Contest")
        self.assertEqual(response.data['description'], "Detail Description")

    def test_update_contest_success(self):
        """
        Ensure authenticated user can update a contest.
        """
        self.client.force_authenticate(user=self.user)
        
        contest = Contest.objects.create(
            title="Old Title", 
            created_by=self.user,
            duration_minutes=60,
            status="DRAFT"
        )
        update_url = reverse('contest-update', args=[contest.id])
        
        updated_data = {
            'title': 'New Title',
            'description': 'Updated Description',
            'duration_minutes': 120,
            'status': 'PUBLISHED'
        }
        
        response = self.client.put(update_url, updated_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        contest.refresh_from_db()
        self.assertEqual(contest.title, 'New Title')
        self.assertEqual(contest.description, 'Updated Description')
        self.assertEqual(contest.duration_minutes, 120)
        self.assertEqual(contest.status, 'PUBLISHED')

    def test_delete_contest(self):
        """
        Ensure authenticated user can delete a contest.
        """
        self.client.force_authenticate(user=self.user)
        
        contest = Contest.objects.create(title="To Delete", created_by=self.user)
        delete_url = reverse('contest-update', args=[contest.id])
        
        response = self.client.delete(delete_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Contest.objects.count(), 0)

    def test_create_contest_unauthenticated(self):
        """
        Ensure unauthenticated user cannot create a contest.
        """
        response = self.client.post(self.list_create_url, self.contest_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
