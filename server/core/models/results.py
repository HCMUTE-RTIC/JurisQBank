from django.db import models
from .users import User, Unit
from .exams import Contest, Question
import uuid

class ExamAttempt(models.Model):
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    duration_seconds = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')
    current_answers = models.JSONField(default=dict, blank=True)
    is_valid = models.BooleanField(default=True)

    class Meta:
        db_table = 'exam_attempts'

class ExamResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name='results')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_options = models.JSONField(null=True, blank=True)
    is_correct = models.BooleanField(null=True)
    point_earned = models.DecimalField(max_digits=5, decimal_places=2, null=True)

    class Meta:
        db_table = 'exam_results'

class Certificate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE)
    issued_at = models.DateTimeField(auto_now_add=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    certificate_code = models.CharField(max_length=255, unique=True, null=True)
    file_url = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'certificates'

class Leaderboard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, blank=True)
    total_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_time_seconds = models.IntegerField(default=0)
    rank = models.IntegerField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leaderboard'
        unique_together = ('contest', 'user')
        indexes = [
            models.Index(fields=['contest', '-total_score', 'total_time_seconds']),
            models.Index(fields=['contest', 'unit']),
        ]
