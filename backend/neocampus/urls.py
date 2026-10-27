from django.contrib import admin
from django.urls import path, include, re_path
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from rest_framework_simplejwt.views import TokenRefreshView


def redirect_to_admin(request):
    return redirect('/admin/')


urlpatterns = [
    path('', redirect_to_admin),   # root → admin
    path("admin/", admin.site.urls),

    # JWT Token Refresh (used by axios interceptor)
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # authentication
    path("api/auth/", include("home.urls")),

    # Attendance
    path("api/attendance/", include("attendance.urls")),
    
    # profiles
    path("api/", include("profiles.urls")),

    # home   
    path("api/home/", include("home.urls")),

    # result analysis
    path("api/result-analysis/", include("resultanalysis.urls")),

    # results
    path("api/results/", include("results.urls")),

    # timetables
    path("api/", include("timetables.urls")),

    # chatbot
    path("api/chatbot/", include("chatbot.urls")),

    # noticeboard
    path('api/', include('noticeboard.urls')),

    # Django Debug Toolbar URLs - Sarang
    path("__debug__/", include("debug_toolbar.urls")), 
]


# ✅ SERVE MEDIA FILES IN DEVELOPMENT AND PRODUCTION (FOR DEMO/STANDALONE DEPLOYS)
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]