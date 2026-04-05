# home/views.py

import json
import os
from django.http import JsonResponse

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from profiles.models import StudentProfile, StaffProfile
from .serializers import StaffDashboardProfileSerializer, StudentDashboardSerializer
from rest_framework.views import APIView, settings
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.conf import settings
import os

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
from django.db.models import Count




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


def hardware_auth_status(request):
    file_path = os.path.join(settings.BASE_DIR, "hardware_auth.json")

    if not os.path.exists(file_path):
        return JsonResponse({"status": "waiting"})

    try:
        with open(file_path, "r") as f:
            data = json.load(f)

        return JsonResponse(data)

    except Exception as e:
        print("Hardware auth read error:", str(e))
        return JsonResponse({"status": "error"})




def delete_hardware_auth(request):
    if os.path.exists("hardware_auth.json"):
        os.remove("hardware_auth.json")
    return JsonResponse({"status": "deleted"})

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
    


# =========================================================
# ✅ NEW VIEW FOR STAFF DASHBOARD (SINGLE API)
# =========================================================



class StaffDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):



        # =====================================================
        # 1️⃣ Profile Card Data
        # =====================================================
        try:
            staff_profile = StaffProfile.objects.get(user=request.user)
        except StaffProfile.DoesNotExist:
            return Response(
                {"detail": "Staff profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = StaffDashboardProfileSerializer(
            staff_profile,
            context={"request": request}
        )
        # =====================================================
        # 2️⃣ Stat Cards Data
        # =====================================================
        # =====================================================
        # 1️⃣ SUBJECTS ASSIGNED
        # attendance app → SubjectAssignment
        # =====================================================

        subject_assignments = SubjectAssignment.objects.filter(
            staff=staff_profile
        )

        subjects_assigned_count = subject_assignments.count()

        # =====================================================
        # 2️⃣ CLASSES TODAY
        # timetables app → Timetable (ONLY teacher + today)
        # =====================================================

        today_code = datetime.today().strftime("%a").upper()[:3]

        today_classes_count = Timetable.objects.filter(
            subject__teacher=staff_profile,
            day=today_code
        ).count()

        # =====================================================
        # 3️⃣ PENDING ENTRIES
        # attendance app → TeachingPlan
        # lecture_date < today
        # and NO Attendance record exists
        # =====================================================

        from datetime import date

        past_lectures = TeachingPlan.objects.filter(
            assignment__staff=staff_profile,
            lecture_date__lt=date.today()
        )

        pending_entries_count = 0

        for lecture in past_lectures:
            if not Attendance.objects.filter(
                teaching_plan=lecture
            ).exists():
                pending_entries_count += 1

        # =====================================================
        # 4️⃣ STATS ARRAY (FRONTEND FORMAT)
        # =====================================================

        stats = [
            {
                "label": "Subjects Assigned",
                "value": subjects_assigned_count,
                "icon": "BookOpen",
                "status": "success",
                "href": "/staff/attendance#subjects",
            },
            {
                "label": "Classes Today",
                "value": today_classes_count,
                "icon": "Calendar",
                "status": "success",
                "href": "/staff/timetable",
            },
            {
                "label": "Pending Entries",
                "value": pending_entries_count,
                "icon": "Clock",
                "status": "warning" if pending_entries_count > 0 else "success",
                "href": "/staff/attendance#subjects",
            },
            {
                # Countdown handled in frontend
                "label": "Next Lecture",
                "value": "countdown",
                "icon": "GraduationCap",
                "status": "success",
                "href": "/staff/timetable",
            },
        ]


        # =====================================================
        # 4️⃣ TODAY SCHEDULE (timetable ONLY)
        # =====================================================

        schedule_entries = Timetable.objects.filter(
            day=today_code
        ).select_related("subject", "timeslot").order_by(
            "timeslot__start_time"  # ✅ FIX ORDERING
        )

        today_schedule = []

        for entry in schedule_entries:

            timeslot = entry.timeslot

            # Show only:
            # - Break
            # - OR teacher = logged in user
            if not timeslot.is_break and (
                not entry.subject or entry.subject.teacher != staff_profile
            ):
                continue

            time_str = f"{timeslot.start_time.strftime('%H:%M')} - {timeslot.end_time.strftime('%H:%M')}"

            if timeslot.is_break:
                pass 
                '''commented out this code beacuese we are handling break in frontend and it was creating confusion in UI. 
                If you want to show break in backend then you can uncomment this code and remove the handling of break from frontend.'''
                # today_schedule.append({
                #     "id": f"break-{entry.id}",
                #     "subject": timeslot.break_label,
                #     "subjectCode": "",
                #     "class": "",
                #     "division": "",
                #     "time": time_str,
                #     "room": "",
                #     "attendanceStatus": "marked",  # ignored in schedule UI
                #     "totalStudents": 0,
                # })
            else:
                today_schedule.append({
                    "id": str(entry.id),
                    "subject": entry.subject.name,
                    "subjectCode": entry.subject.code,
                    "class": entry.subject.branch,
                    "division": "",
                    "time": time_str,
                    "room": entry.subject.classroom,
                    "attendanceStatus": "pending",
                    "totalStudents": 0,
                })

        # =====================================================
        # 5️⃣ TODAY CLASSES (attendance ONLY)
        # =====================================================

        today_lectures = TeachingPlan.objects.filter(
            assignment__staff=staff_profile,
            lecture_date=date.today()
        ).select_related("assignment__subject")

        today_classes = []

        for lecture in today_lectures:
            
            assignment = lecture.assignment
            subject = lecture.assignment.subject
            batch_id = lecture.assignment.batch_id
            assignment_uuid = str(assignment.assignment_id)
            lecture_id = lecture.id

            attendance_records = Attendance.objects.filter(
                teaching_plan=lecture
            )

            if attendance_records.exists():
                attendance_status = "marked"
                total_students = attendance_records.count()
                present_students = attendance_records.filter(
                    is_present=True
                ).count()
            else:
                attendance_status = "pending"
                total_students = 0
                present_students = None

            today_classes.append({
                "id": f"lecture-{lecture.id}",
                "assignmentId": assignment_uuid,
                "lectureId": lecture_id,
                "subject": subject.name,
                "subjectCode": subject.code,
                "class": batch_id,  # ✅ FIXED FULL BATCH-ID
                "division": "",
                "time": "",        # ✅ REMOVED (as requested)
                "room": "",        # ✅ REMOVED (as requested)
                "attendanceStatus": attendance_status,
                "totalStudents": total_students,
                "presentStudents": present_students,
            })

        

        # =====================================================
        # 6️⃣ RECENT MATERIALS (NEW SECTION ADDED)
        # =====================================================

        # ✅ Fetch only notices uploaded by this staff
        # uploaded_by stores staff full name
        staff_full_name = f"{staff_profile.first_name} {staff_profile.last_name}"

        recent_notices = Notice.objects.filter(
            uploaded_by=staff_full_name
        ).annotate(
            files_count=Count("files")
        ).order_by(
            "-created_at"
        )[:5]  # Limit to latest 5

        recent_materials = []

        for notice in recent_notices:
            recent_materials.append({
                "id": str(notice.id),
                "title": notice.title,
                "subjectName": notice.subject_name,
                "subjectCode": notice.subject_code,
                "targetClass": notice.batch_id,
                "uploadedAt": notice.created_at.strftime("%d %b %Y"),
                "filesCount": notice.files_count,
                "status": "published",  # Notice model has no draft field
            })

        # =====================================================
        # 6️⃣ STATS
        # =====================================================

        stats = [
            {
                "label": "Subjects Assigned",
                "value": subjects_assigned_count,
                "icon": "BookOpen",
                "status": "success",
                "href": "/staff/attendance#subjects",
            },
            {
                "label": "Classes Today",
                "value": today_classes_count,
                "icon": "Calendar",
                "status": "success",
                "href": "/staff/timetable",
            },
            {
                "label": "Pending Entries",
                "value": pending_entries_count,
                "icon": "Clock",
                "status": "warning" if pending_entries_count > 0 else "success",
                "href": "/staff/attendance#subjects",
            },
            {
                "label": "Next Lecture",
                "value": "countdown",
                "icon": "GraduationCap",
                "status": "success",
                "href": "/staff/timetable",
            },
        ]


        return Response({
            "profile": serializer.data,
            "stats": stats,
            "recentMaterials": recent_materials,
            "todaySchedule": today_schedule,
            "todayClasses": today_classes,
            "announcements": []
        })