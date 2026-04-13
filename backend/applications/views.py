from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .models import Application
from .serializers import ApplicationSerializer, ApplicationCreateSerializer
from services.agent import run_resume_agent


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def apply_to_job(request):
    """Candidate applies to a job and uploads resume — triggers AI agent."""
    if request.user.role != 'candidate':
        return Response({'error': 'Only candidates can apply.'}, status=403)

    serializer = ApplicationCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    job = serializer.validated_data['job']

    if Application.objects.filter(candidate=request.user, job=job).exists():
        return Response({'error': 'You have already applied to this job.'}, status=400)

    application = serializer.save(candidate=request.user)

    # Run AI agent (use Celery in production for async)
    try:
        run_resume_agent(application)
    except Exception as e:
        print(f"[Agent Error] {e}")

    return Response(ApplicationSerializer(application).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_applications(request):
    """Candidate: view their own applications."""
    if request.user.role != 'candidate':
        return Response({'error': 'Only candidates can view this.'}, status=403)
    apps = Application.objects.filter(
        candidate=request.user
    ).select_related('job', 'job__recruiter')
    return Response(ApplicationSerializer(apps, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_applicants(request, job_id):
    """Recruiter: all applicants for a job, sorted by AI score."""
    if request.user.role != 'recruiter':
        return Response({'error': 'Only recruiters can view applicants.'}, status=403)

    apps = Application.objects.filter(
        job_id=job_id,
        job__recruiter=request.user
    ).select_related('candidate', 'job').order_by('-match_score')

    return Response(ApplicationSerializer(apps, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_application_status(request, pk):
    """Recruiter: update an application status."""
    if request.user.role != 'recruiter':
        return Response({'error': 'Only recruiters can update status.'}, status=403)

    try:
        app = Application.objects.get(pk=pk, job__recruiter=request.user)
    except Application.DoesNotExist:
        return Response({'error': 'Application not found.'}, status=404)

    new_status = request.data.get('status')
    valid = [s[0] for s in Application.STATUS_CHOICES]
    if new_status not in valid:
        return Response({'error': f'Invalid status. Choose from: {valid}'}, status=400)

    app.status = new_status
    app.save()
    return Response(ApplicationSerializer(app).data)
