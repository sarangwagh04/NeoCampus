from django.urls import path
from .views import StaffTimetableBulkUpdateView, StaffTimetableView, StudentTeachingPlanView, TimetableView

urlpatterns = [
    path("timetable/", TimetableView.as_view(), name="timetable"), #Student timetable view
    path("student-teaching-plan/", StudentTeachingPlanView.as_view(), name="student-teaching-plan"), #Student teaching plan view
    path("staff-timetable/", StaffTimetableView.as_view(), name="staff-timetable"), #Staff timetable view
    path("staff-timetable/<str:year_code>/", StaffTimetableBulkUpdateView.as_view()), #Staff timetable bulk update view for HOD

]