from rest_framework import serializers
from .models import Application
from users.serializers import UserSerializer
from jobs.serializers import JobSerializer
import json


class ApplicationSerializer(serializers.ModelSerializer):
    candidate_info = UserSerializer(source='candidate', read_only=True)
    job_info = JobSerializer(source='job', read_only=True)
    agent_log_parsed = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id', 'candidate', 'candidate_info', 'job', 'job_info',
            'resume', 'cover_letter', 'status',
            'extracted_skills', 'experience_summary',
            'match_score', 'ai_feedback', 'agent_log', 'agent_log_parsed',
            'applied_at', 'updated_at'
        ]
        read_only_fields = [
            'candidate', 'extracted_skills', 'experience_summary',
            'match_score', 'ai_feedback', 'agent_log', 'applied_at', 'updated_at'
        ]

    def get_agent_log_parsed(self, obj):
        try:
            return json.loads(obj.agent_log)
        except Exception:
            return []


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['job', 'resume', 'cover_letter']
