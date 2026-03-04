# home/urls.py
from django.urls import path
from .views import LoginView, RecentMaterialsView, StaffDashboardView, StudentDashboardView, TodayScheduleView, delete_hardware_auth, hardware_auth_status

urlpatterns = [
    path("hardware-auth-status/", hardware_auth_status), #checking if hardware auth json file exists or not
    path("login/", LoginView.as_view(), name="login"), #user logiging in
    path("delete-hardware-auth/", delete_hardware_auth), #deleting hardware auth json file when user login
    path("student-dashboard/", StudentDashboardView.as_view(), name="student-dashboard"), #fetching student profile card
    path("today-schedule/", TodayScheduleView.as_view(), name="today-schedule"), #fetching today's schedule for student dashboard
    path("recent-materials/", RecentMaterialsView.as_view(), name="recent-materials"), #fetching recent materials for student dashboard
    path("staff-dashboard/", StaffDashboardView.as_view(), name="staff-dashboard"), #fetching staff profile card  for staff dashboard

    
]
