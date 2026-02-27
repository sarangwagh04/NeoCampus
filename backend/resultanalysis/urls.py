from django.urls import path
from .views import ResultAnalysisAPIView

urlpatterns = [
    path("analyze/", ResultAnalysisAPIView.as_view()),
]
