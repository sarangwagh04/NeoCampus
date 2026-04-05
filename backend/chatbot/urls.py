from django.urls import path
from .views import ChatbotAskView, CollegeUpdatePostView

urlpatterns = [
    path("ask/", ChatbotAskView.as_view(), name="chatbot-ask"),
    path("post-update/", CollegeUpdatePostView.as_view(), name="chatbot-post-update"),

]