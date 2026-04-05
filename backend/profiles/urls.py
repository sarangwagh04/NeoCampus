# profiles/urls.py

from django.urls import path
from .views import StudentProfileView, StaffProfileView

urlpatterns = [
    path("student/profile/", StudentProfileView.as_view(), name="student-profile"), #For students to view/update their profile
    path("staff/profile/", StaffProfileView.as_view(), name="staff-profile"), #For staff to view their profile
]