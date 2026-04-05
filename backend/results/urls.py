from django.urls import path
from .views import BatchPerformanceView, ResultPublishView, ResultUploadCreateView, StudentBacklogView, StudentProfileDetailView, StudentResultSummaryView, StudentSemesterResultView

urlpatterns = [
    #three endpoints are for results Staff. 
    path("upload/", ResultUploadCreateView.as_view(), name="result-upload-preview"), #Context: Upload result file and preview
    path("publish/<int:upload_id>/", ResultPublishView.as_view(), name="result-publish"), #Publish results after preview
    path("performance/", BatchPerformanceView.as_view()), #Get batch performance data for charts and analysis

    
    # Below endpoints are for students to view their results
    path("student/summary/", StudentResultSummaryView.as_view()), #Get result summary cards
    path("student/results/", StudentSemesterResultView.as_view(),), #sujectwise table result
    path("student/profile/", StudentProfileDetailView.as_view()), #Get student profile info for marksheet PDF
    path("student/backlogs/", StudentBacklogView.as_view()), #Get backlog details for students


]