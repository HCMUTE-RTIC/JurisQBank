from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ContestQuestionViewSet,
    ContestStartExamView,
    LoginView, 
    GoogleLoginView,
    QuestionViewSet, 
    UserMeView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ContestListCreateView,
    ContestUpdateView
    
)
#URL question
router = DefaultRouter()
router.register(r'questions', QuestionViewSet)
router.register(r'contest-questions', ContestQuestionViewSet)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/google/', GoogleLoginView.as_view(), name='google-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UserMeView.as_view(), name='user-me'),
    
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    #URL contest
    path('contests/', ContestListCreateView.as_view(), name='contest-list-create'),
    path('contests/<uuid:contest_id>/', ContestUpdateView.as_view(), name='contest-update'),
    path('contests/<uuid:contest_id>/start-exam/', ContestStartExamView.as_view(), name='contest-start-exam'),
]

urlpatterns += router.urls