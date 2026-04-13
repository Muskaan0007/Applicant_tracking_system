from django.db import models
from django.conf import settings
from jobs.models import Job


class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewing', 'Reviewing'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('hired', 'Hired'),
    ]

    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    resume = models.FileField(upload_to='resumes/')
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # AI-parsed fields
    extracted_skills = models.TextField(blank=True, default='')
    experience_summary = models.TextField(blank=True, default='')
    match_score = models.FloatField(null=True, blank=True)
    ai_feedback = models.TextField(blank=True, default='')

    # Agent conversation log stored as JSON string
    agent_log = models.TextField(blank=True, default='[]')

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('candidate', 'job')
        ordering = ['-match_score', '-applied_at']

    def __str__(self):
        return f"{self.candidate.username} -> {self.job.title}"
