# home/urls.py
from django.urls import path
from .views import LoginView, RecentMaterialsView, StudentDashboardView, TodayScheduleView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"), #user logiging in
    path("student-dashboard/", StudentDashboardView.as_view(), name="student-dashboard"), #fetching student profile card
    path("today-schedule/", TodayScheduleView.as_view(), name="today-schedule"), #fetching today's schedule for student dashboard
    path("recent-materials/", RecentMaterialsView.as_view(), name="recent-materials"), #fetching recent materials for student dashboard

    
]
