from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Contest, ContestCode
from .serializers_contest import ContestSerializer, ContestCodeSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'ADMIN'

class ContestViewSet(viewsets.ModelViewSet):
    queryset = Contest.objects.all().order_by('-created_at')
    serializer_class = ContestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'is_practice', 'created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_time']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='generate-code')
    def generate_code(self, request, pk=None):
        """
        Generate a unique access code for this contest (for private contests).
        """
        contest = self.get_object()
        # Only owner or admin can generate code
        if request.user != contest.created_by and request.user.role != 'ADMIN':
             return Response({"detail": "Permission denied."}, status=403)
             
        import uuid
        code = str(uuid.uuid4())[:8].upper() # Simple 8 char code
        
        contest_code = ContestCode.objects.create(
            contest=contest,
            code=code
        )
        
        return Response(ContestCodeSerializer(contest_code).data)

class ContestCodeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    View to check/list codes? Mostly for admin or internal use.
    """
    queryset = ContestCode.objects.all()
    serializer_class = ContestCodeSerializer
    permission_classes = [permissions.IsAdminUser]
