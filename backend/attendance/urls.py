from django.urls import path
from . import views

#new
from .views import LectureAttendanceListView, StudentOverallAttendanceView, StudentStatsView
from .views import (
    SubjectListCreateView,
    SubjectToggleStatusView,
    SubjectDeleteView,
    StaffListView,
    SubjectAssignmentListCreateView,
    SubjectAssignmentDeleteView,
    BatchListView,
    TeachingPlanView,
    MySubjectAssignmentsView,
    AssignmentStudentsView,
    AttendanceSaveView,
    AttendancePercentageView,
    AttendanceOverviewView,
    AttendanceCorrectionView,
    AttendanceReportView,
    StudentAttendanceHistoryView,
)


app_name = 'attendance'

urlpatterns = [
    path("student/stats/", StudentStatsView.as_view()),

    #New
    # Dashboard
    # path('', views.attendance_dashboard, name='attendance_dashboard'),

    # HOD Subject Management
    path('api/create-subject/', views.create_subject, name='create_subject_api'),
    path('assign-subject/', views.assign_subject, name='assign_subject'),

    # Teaching Plan (UUID-based)
    # path('teaching-plan/<uuid:assignment_id>/', views.staff_teaching_plan_view, name='staff_teaching_plan'),
    path('teaching-plan/<uuid:assignment_id>/save/', views.save_teaching_plan, name='save_teaching_plan'),


    # Attendance Marking
    # path('mark/<uuid:assignment_id>/', views.attendance_marking_view, name='attendance_marking'),
    # path('mark/<uuid:assignment_id>/save/', views.attendance_marking_save, name='attendance_marking_save'),



    # Attendance Correction
    path('correction/<uuid:assignment_id>/<int:student_id>/', views.attendance_correction_view, name='attendance_correction'),
    path('correction/<uuid:assignment_id>/<int:student_id>/save/', views.attendance_correction_save, name='attendance_correction_save'),


    # HOD Attendance Record Generation
    path("report/", AttendanceReportView.as_view()),





    path("subjects/", SubjectListCreateView.as_view()),
    path("subjects/<int:subject_id>/toggle/", SubjectToggleStatusView.as_view()),
    path("subjects/<int:subject_id>/delete/", SubjectDeleteView.as_view()),
    path('staff/', StaffListView.as_view()),
    path('assignments/', SubjectAssignmentListCreateView.as_view()),
    path('assignments/<uuid:assignment_id>/', SubjectAssignmentDeleteView.as_view()),
    path('assignments/<uuid:assignment_id>/teaching-plan/', TeachingPlanView.as_view()),
    path('assignments/my/', MySubjectAssignmentsView.as_view()),
    path("assignments/<uuid:assignment_id>/students/", AssignmentStudentsView.as_view()),
    path("assignments/<uuid:assignment_id>/<int:lecture_id>/attendance/", AttendanceSaveView.as_view()),
    path("assignments/<uuid:assignment_id>/attendance-percentage/", AttendancePercentageView.as_view()),
    path("assignments/<uuid:assignment_id>/attendance-overview/", AttendanceOverviewView.as_view()),
    path('batches/', BatchListView.as_view()),                                                                                            #Load batches for dropdown in teaching plan form and in result upload form
    path("assignments/<uuid:assignment_id>/<int:lecture_id>/students/<int:student_id>/attendance/", AttendanceCorrectionView.as_view()),  #correction endpoint
    path("assignments/<uuid:assignment_id>/students/<int:student_id>/attendance-history/", StudentAttendanceHistoryView.as_view()),       #correction endpoint (optimized)
    path("assignments/<uuid:assignment_id>/<int:lecture_id>/attendance-list/", LectureAttendanceListView.as_view()),                      #for corection on lectures complited page
    path("student/overall/", StudentOverallAttendanceView.as_view()),                                                                     #student attendance page
    


]
