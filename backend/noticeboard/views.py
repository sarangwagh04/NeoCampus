# noticeboard/views.py

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
# from django.contrib.auth.models import User
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Notice
from .serializers import NoticeSerializer
from timetables.models import Subject
from profiles.models import StaffProfile, StudentProfile
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

        serializer.save(
            uploaded_by=f"{staff.first_name} {staff.last_name}",
            subject_name=subject_name,
            subject_code=subject_code,
            batch_id=batch_id,
            is_public=is_public
        )


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