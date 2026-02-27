from django.urls import path
#new
from .views import CustomTokenView
from .views import AdminRedirectView


urlpatterns = [
    path("login/", CustomTokenView.as_view(), name="login"),
    path("admin-redirect/", AdminRedirectView.as_view()),
]
