# noticeboard/views.py

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
# from django.contrib.auth.models import User
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Notice, PushSubscription
from .serializers import NoticeSerializer
from timetables.models import Subject
from profiles.models import StaffProfile, StudentProfile
from .utils import send_push_notification
from rest_framework import serializers
from django.db.models import Q






class NoticeListCreateView(generics.ListCreateAPIView):
    queryset = Notice.objects.all().order_by('-created_at')
    serializer_class = NoticeSerializer

    # ✅ REQUIRED FOR FILE UPLOAD
    parser_classes = (MultiPartParser, FormParser)


class NoticeDetailView(generics.RetrieveAPIView):
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer



# =====================================================
# CREATE + LIST NOTICES
# =====================================================

class NoticeListCreateView(generics.ListCreateAPIView):
    serializer_class = NoticeSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # ===============================
        # STUDENT VIEW
        # ===============================
        if hasattr(user, "student_profile"):
            student = user.student_profile

            return Notice.objects.filter(
                Q(is_public=True) |
                Q(batch_id=student.batch_id)
            ).order_by("-created_at")

        # ===============================
        # STAFF VIEW
        # ===============================
        if hasattr(user, "staff_profile"):
            staff = user.staff_profile

            return Notice.objects.filter(
                uploaded_by=f"{staff.first_name} {staff.last_name}"
            ).order_by("-created_at")

        return Notice.objects.none()

    def perform_create(self, serializer):
        staff = self.request.user.staff_profile
        subject_id = self.request.data.get("subject_id")
        is_public = self.request.data.get("is_public") == "true"

        subject_name = None
        subject_code = None
        batch_id = None

        if not is_public and subject_id:
            subject = Subject.objects.get(id=subject_id, teacher=staff)
            subject_name = subject.name
            subject_code = subject.code
            batch_id = self.request.data.get("batch_id")

        notice = serializer.save(
            uploaded_by=f"{staff.first_name} {staff.last_name}",
            subject_name=subject_name,
            subject_code=subject_code,
            batch_id=batch_id,
            is_public=is_public
        )

        try:
            payload = {
                "title": "New Notice Published" if is_public else f"New Notice: {subject_name}",
                "body": notice.title,
                "url": "/noticeboard"
            }
            if is_public:
                # Send to all users except the staff who created it (optional optimization)
                subs = PushSubscription.objects.exclude(user=self.request.user)
            else:
                student_user_ids = StudentProfile.objects.filter(batch_id=batch_id).values_list('user_id', flat=True)
                subs = PushSubscription.objects.filter(user_id__in=student_user_ids)
                
            for sub in subs:
                send_push_notification(sub, payload)
        except Exception as e:
            print(f"Failed to queue push notifications: {str(e)}")


# =====================================================
# RETRIEVE SINGLE NOTICE
# =====================================================

class NoticeDetailView(generics.RetrieveAPIView):
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer
    permission_classes = [permissions.IsAuthenticated]


# =====================================================
# GET SUBJECTS FOR LOGGED-IN STAFF
# =====================================================

class StaffSubjectListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        try:
            staff = request.user.staff_profile
        except StaffProfile.DoesNotExist:
            return Response({"error": "Staff profile not found"}, status=400)

        subjects = Subject.objects.filter(teacher=staff)

        data = [
            {
                "id": subject.id,
                "name": subject.name,
                "code": subject.code
            }
            for subject in subjects
        ]

        return Response(data)


# =====================================================
# GET BATCHES BASED ON STAFF BRANCH
# =====================================================

class StaffBatchListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        try:
            staff = request.user.staff_profile
        except StaffProfile.DoesNotExist:
            return Response({"error": "Staff profile not found"}, status=400)

        # ✅ Get distinct batch IDs of students in same branch
        batches = (
            StudentProfile.objects
            .filter(branch=staff.branch)
            .exclude(batch_id__isnull=True)
            .values_list("batch_id", flat=True)
            .distinct()
        )

        return Response(list(batches))

# =====================================================
# SAVE PUSH SUBSCRIPTION
# =====================================================
class SaveSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        endpoint = request.data.get('endpoint')
        keys = request.data.get('keys', {})
        p256dh = keys.get('p256dh')
        auth = keys.get('auth')

        if not endpoint or not p256dh or not auth:
            return Response({'error': 'Invalid subscription data'}, status=400)

        sub, created = PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                'user': request.user,
                'p256dh': p256dh,
                'auth': auth
            }
        )
        return Response({'success': True}, status=201 if created else 200)