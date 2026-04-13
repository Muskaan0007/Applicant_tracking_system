from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Job
from .serializers import JobSerializer


def is_recruiter(user):
    return user.role == 'recruiter'


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def job_list(request):
    if request.method == 'GET':
        jobs = Job.objects.filter(status='open')
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if not request.user.is_authenticated or not is_recruiter(request.user):
            return Response({'error': 'Only recruiters can post jobs.'}, status=403)
        serializer = JobSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(recruiter=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def job_detail(request, pk):
    try:
        job = Job.objects.get(pk=pk)
    except Job.DoesNotExist:
        return Response({'error': 'Job not found.'}, status=404)

    if request.method == 'GET':
        return Response(JobSerializer(job).data)

    if request.method == 'PUT':
        if job.recruiter != request.user:
            return Response({'error': 'Not authorized.'}, status=403)
        serializer = JobSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == 'DELETE':
        if job.recruiter != request.user:
            return Response({'error': 'Not authorized.'}, status=403)
        job.delete()
        return Response({'message': 'Job deleted.'}, status=204)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_jobs(request):
    if not is_recruiter(request.user):
        return Response({'error': 'Only recruiters can access this.'}, status=403)
    jobs = Job.objects.filter(recruiter=request.user)
    return Response(JobSerializer(jobs, many=True).data)
