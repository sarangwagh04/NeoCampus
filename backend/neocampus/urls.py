from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static




def redirect_to_admin(request):
    return redirect('/admin/')


urlpatterns = [
    path('', redirect_to_admin),   # root → admin
    path("admin/", admin.site.urls),

    #authentication
    path("api/auth/", include("home.urls")),

    #Attendance
    path("api/attendance/", include("attendance.urls")),
    
    #profiles
    path("api/", include("profiles.urls")),

    #home   
    path("api/home/", include("home.urls")),

    #result analysis
    path("api/result-analysis/", include("resultanalysis.urls")),

    #results
    path("api/results/", include("results.urls")),

    #timetables
    path("api/", include("timetables.urls")),

    #chatbot
    path("api/chatbot/", include("chatbot.urls")),

    #noticeboard
    path('api/', include('noticeboard.urls')),






    # Django Debug Toolbar URLs - Sarang
    path("__debug__/", include("debug_toolbar.urls")), 
]


# ✅ SERVE MEDIA FILES IN DEVELOPMENT
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )