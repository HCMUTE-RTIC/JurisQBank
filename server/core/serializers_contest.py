from rest_framework import serializers
from .models import Contest, ContestCode, User

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'avatar_url']

class ContestSerializer(serializers.ModelSerializer):
    created_by = UserSimpleSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Contest
        fields = [
            'id', 'title', 'description', 'thumbnail_url', 
            'start_time', 'end_time', 'duration_minutes', 
            'passing_score', 'max_attempts', 'is_practice', 
            'status', 'status_display', 'settings', 
            'created_by', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def create(self, validated_data):
        # Automatically assign the creator
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)

class ContestCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContestCode
        fields = ['id', 'contest', 'code', 'is_active', 'expires_at']
        read_only_fields = ['id']
