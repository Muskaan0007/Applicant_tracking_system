from django.urls import path
from . import views

urlpatterns = [
    path('apply/', views.apply_to_job, name='apply'),
    path('mine/', views.my_applications, name='my-applications'),
    path('job/<int:job_id>/', views.job_applicants, name='job-applicants'),
    path('<int:pk>/status/', views.update_application_status, name='update-status'),
]
