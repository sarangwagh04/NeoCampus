from django.urls import path
from .views import ResultAnalysisAPIView, ai_extract_analysis, ai_tryout_analysis

urlpatterns = [
    path("analyze/", ResultAnalysisAPIView.as_view()), #Tradinal Result Analysis
    path("ai-tryout/", ai_tryout_analysis), #AI Tryout
    path("ai-extract/", ai_extract_analysis), #AI Full Processor

]
