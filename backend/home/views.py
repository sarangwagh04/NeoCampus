# home/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from profiles.models import StudentProfile, StaffProfile
from .serializers import StudentDashboardSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# ✅ NEW IMPORTS FOR STATS
from attendance.models import (
    TeachingPlan,
    Attendance,
    SubjectAssignment
)
from results.models import ResultEntry
from django.db.models import Max


# ✅ NEW IMPORTS FOR TODAY SCHEDULE
from timetables.models import Timetable, TimeSlot, Subject
from datetime import datetime, timedelta

# ✅ NEW IMPORT FOR RECENT MATERIALS
from noticeboard.models import Notice
from django.utils import timezone




class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['user_id'] = user.id
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser

        try:
            staff_profile = StaffProfile.objects.get(user=user)
            token["is_hod"] = staff_profile.is_hod
        except StaffProfile.DoesNotExist:
            token["is_hod"] = False

        return token


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer



class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:
            profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {"detail": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = StudentDashboardSerializer(
            profile,
            context={"request": request}
        )

        # ============================
        # 1️⃣ ATTENDANCE CALCULATION
        # ============================

        batch_id = profile.batch_id
        semester = int(profile.semester)

        # Total lectures = total attendance entries of this student
        total_lectures = Attendance.objects.filter(
            student=profile
        ).count()

        # Total present lectures
        present_lectures = Attendance.objects.filter(
            student=profile,
            is_present=True
        ).count()

        attendance_percentage = (
            round((present_lectures / total_lectures) * 100)
            if total_lectures > 0 else 0
        )

        # ============================
        # 2️⃣ SUBJECT COUNT
        # ============================

        subject_count = SubjectAssignment.objects.filter(
            batch_id=batch_id,
            semester=semester
        ).count()

        # ============================
        # 3️⃣ CURRENT SGPA
        # ============================

        latest_result = ResultEntry.objects.filter(
            student=request.user,
            batch_id=batch_id
        ).order_by("-id").first()

        current_sgpa = latest_result.sgpa if latest_result else 0

        # ============================
        # 4️⃣ RANK CALCULATION
        # ============================

        all_students = ResultEntry.objects.filter(
            batch_id=batch_id
        ).values("student").annotate(
            max_sgpa=Max("sgpa")
        ).order_by("-max_sgpa")

        rank = 0
        for index, student in enumerate(all_students, start=1):
            if student["student"] == request.user.id:
                rank = index
                break

        # ============================
        # FINAL RESPONSE
        # ============================

        return Response({
            "profile": serializer.data,
            "stats": {
                "attendance_percentage": attendance_percentage,
                "subjects_enrolled": subject_count,
                "current_sgpa": current_sgpa,
                "rank": rank
            }
        })
    


# =========================================================
# ✅ NEW VIEW ADDED FOR TODAY SCHEDULE
# =========================================================

class TodayScheduleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        student = StudentProfile.objects.get(user=request.user)

        branch = student.branch
        semester = int(student.semester)

        # 🔹 Map semester to year
        if semester in [1, 2]:
            year = "FE"
        elif semester in [3, 4]:
            year = "SE"
        elif semester in [5, 6]:
            year = "TE"
        elif semester in [7, 8]:
            year = "BE"
        else:
            return Response({"error": "Invalid semester"}, status=400)

        # 🔹 Get current day
        today_code = datetime.today().strftime("%a").upper()[:3]

        subjects = Subject.objects.filter(
            branch=branch,
            year=year
        )

        entries = Timetable.objects.filter(
            subject__in=subjects,
            day=today_code
        ).select_related(
            "subject__teacher__user",
            "timeslot"
        ).order_by("timeslot__start_time")

        schedule = []

        for entry in entries:

            timeslot = entry.timeslot

            if timeslot.is_break:
                schedule.append({
                    "type": "Break",
                    "subject": timeslot.break_label,
                    "faculty": "",
                    "room": "",
                    "start_time": timeslot.start_time,
                    "end_time": timeslot.end_time,
                })
            else:
                schedule.append({
                    "type": "Lecture",
                    "subject": entry.subject.name,
                    "faculty": entry.subject.teacher.user.get_full_name(),
                    "room": entry.subject.classroom,
                    "start_time": timeslot.start_time,
                    "end_time": timeslot.end_time,
                })

        return Response(schedule)
    

    


# =========================================================
# ✅ NEW VIEW FOR RECENT MATERIALS
# =========================================================

class RecentMaterialsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        student = StudentProfile.objects.get(user=request.user)
        batch_id = student.batch_id

        seven_days_ago = timezone.now() - timedelta(days=7)

        # ✅ Filter only last 7 days
        notices = Notice.objects.filter(
            created_at__gte=seven_days_ago
        ).order_by("-created_at")

        data = []

        for notice in notices:

            # ✅ Only include:
            # - public notices
            # - or notices matching student's batch
            if not notice.is_public and notice.batch_id != batch_id:
                continue

            data.append({
                "id": notice.id,
                "title": notice.title,
                "subjectName": notice.subject_name,
                "subjectCode": notice.subject_code,
                "uploadedBy": notice.uploaded_by,
                "uploadedAt": notice.created_at,
                "filesCount": notice.files.count(),
                "hasReferenceLink": notice.links.exists(),
            })

        return Response(data)