from django.urls import path
from .views import ResultAnalysisAPIView, ai_tryout_analysis

urlpatterns = [
    path("analyze/", ResultAnalysisAPIView.as_view()),
    path("ai-tryout/", ai_tryout_analysis),
]
