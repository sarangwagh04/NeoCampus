# noticeboard/urls.py

from django.urls import path
from .views import NoticeListCreateView, NoticeDetailView, StaffBatchListView, StaffSubjectListView, SaveSubscriptionView

urlpatterns = [
    # ==============================
    # NOTICE CRUD
    # ==============================
    path('notices/', NoticeListCreateView.as_view(), name='notice-list-create'),
    path('notices/<int:pk>/', NoticeDetailView.as_view(), name='notice-detail'),

    # ==============================
    # SUPPORTING ENDPOINTS
    # ==============================
    path('notices/subjects/', StaffSubjectListView.as_view(), name='staff-subjects'), #this will return subjects list in context form
    path('notices/batches/', StaffBatchListView.as_view(), name='staff-batches'), #this will return batches list in context form
    
    # ==============================
    # PUSH NOTIFICATIONS
    # ==============================
    path('notices/save-subscription/', SaveSubscriptionView.as_view(), name='save-subscription'),
]
