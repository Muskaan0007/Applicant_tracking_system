from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.CharField(source='recruiter.username', read_only=True)
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'recruiter', 'recruiter_name', 'title', 'company',
            'location', 'description', 'requirements', 'skills_required',
            'salary_min', 'salary_max', 'status', 'created_at',
            'updated_at', 'application_count'
        ]
        read_only_fields = ['recruiter', 'created_at', 'updated_at']

    def get_application_count(self, obj):
        return obj.applications.count()
