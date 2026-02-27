from collections import defaultdict
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework import status
from .models import Timetable, TimeSlot, Subject
from .serializers import TimeSlotSerializer
from attendance.models import (
    SubjectAssignment,
    TeachingPlan,
    Attendance
)
from profiles.models import StudentProfile






class TimetableView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        branch = request.query_params.get("branch")
        year = request.query_params.get("year")

        if not branch or not year:
            return Response(
                {"error": "branch and year are required parameters."},
                status=400
            )

        # ===============================
        # 🔹 Get Student Profile
        # ===============================
        student = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        batch_id = student.batch_id
        semester = student.semester

        # ===============================
        # 🔹 Get Timetable Subjects
        # ===============================
        subjects = Subject.objects.filter(
            branch=branch,
            year=year
        )

        entries = Timetable.objects.filter(
            subject__in=subjects
        ).select_related(
            "subject__teacher__user",
            "timeslot"
        )

        time_slots = TimeSlot.objects.all().order_by("start_time")

        # ===============================
        # 🔹 Teaching Plan Aggregation
        # ===============================
        assignments = SubjectAssignment.objects.filter(
            batch_id=batch_id,
            semester=semester,
            subject__code__in=subjects.values_list("code", flat=True)
        )

        # Planned lectures per subject
        planned_counts = (
            TeachingPlan.objects
            .filter(assignment__in=assignments)
            .values("assignment__subject__code")
            .annotate(total=Count("id"))
        )

        planned_map = {
            p["assignment__subject__code"]: p["total"]
            for p in planned_counts
        }

        # Completed lectures per subject
        completed_counts = (
            Attendance.objects
            .filter(
                student=student,
                is_present=True,
                teaching_plan__assignment__in=assignments
            )
            .values("teaching_plan__assignment__subject__code")
            .annotate(total=Count("id"))
        )

        completed_map = {
            c["teaching_plan__assignment__subject__code"]: c["total"]
            for c in completed_counts
        }

        # ===============================
        # 🔹 Build Schedule
        # ===============================
        schedule = defaultdict(dict)

        for entry in entries:
            day = entry.get_day_display()

            subject_code = entry.subject.code if entry.subject else None

            planned = planned_map.get(subject_code)
            completed = completed_map.get(subject_code, 0)

            # If no teaching plan → no capsule indicator
            if planned is None:
                lectures_planned = 0
                lectures_completed = 0
                lectures_remaining = 0
            else:
                lectures_planned = planned
                lectures_completed = completed
                lectures_remaining = planned - completed

            schedule[day][str(entry.timeslot.id)] = {
                "id": entry.id,
                "subjectCode": subject_code,
                "subjectName": entry.subject.name if entry.subject else None,
                "facultyName": (
                    entry.subject.teacher.user.get_full_name()
                    if entry.subject else None
                ),
                "classroom": entry.subject.classroom if entry.subject else None,
                "lecturesPlanned": lectures_planned,
                "lecturesCompleted": lectures_completed,
                "lecturesRemaining": lectures_remaining,
            }

        # ===============================
        # 🔹 Build Teaching Plan Section
        # ===============================
        teaching_plan_data = []

        for assignment in assignments:
            subject_code = assignment.subject.code
            planned = planned_map.get(subject_code)

            # Skip if no teaching plan
            if not planned:
                continue

            completed = completed_map.get(subject_code, 0)

            topics = TeachingPlan.objects.filter(
                assignment=assignment
            ).order_by("lecture_number")

            teaching_plan_data.append({
                "subjectCode": subject_code,
                "subjectName": assignment.subject.name,
                "facultyName": assignment.staff.user.get_full_name(),
                "lecturesPlanned": planned,
                "lecturesCompleted": completed,
                "lecturesRemaining": planned - completed,
                "topics": [
                    {
                        "name": t.topic,
                        "lectures": 1,
                        "completed": Attendance.objects.filter(
                            teaching_plan=t,
                            student=student,
                            is_present=True
                        ).exists()
                    }
                    for t in topics
                ]
            })

        return Response({
            "timeSlots": TimeSlotSerializer(time_slots, many=True).data,
            "schedule": schedule,
            "teachingPlans": teaching_plan_data
        })





class StudentTeachingPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # 🔹 Get logged-in student
        student = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        batch_id = student.batch_id
        semester = student.semester

        # 🔹 Get assignments for that student
        assignments = (
            SubjectAssignment.objects
            .filter(batch_id=batch_id, semester=semester)
            .select_related("subject", "staff__user")
        )

        data = []

        for assignment in assignments:

            # 🔹 Get all lectures (teaching plan)
            lectures = TeachingPlan.objects.filter(
                assignment=assignment
            ).order_by("lecture_number")

            total_lectures = lectures.count()

            # Skip subject if no teaching plan exists
            if total_lectures == 0:
                continue

            # 🔹 Count completed lectures
            completed_lectures = Attendance.objects.filter(
                teaching_plan__in=lectures,
                student=student,
                is_present=True
            ).count()

            topics = []

            for lecture in lectures:
                is_done = Attendance.objects.filter(
                    teaching_plan=lecture,
                    student=student,
                    is_present=True
                ).exists()

                topics.append({
                    "name": lecture.topic,
                    "lectures": 1,
                    "completed": is_done
                })

            data.append({
                "subjectCode": assignment.subject.code,
                "subjectName": assignment.subject.name,
                "facultyName": assignment.staff.user.get_full_name(),
                "lecturesPlanned": total_lectures,
                "lecturesCompleted": completed_lectures,
                "lecturesRemaining": total_lectures - completed_lectures,
                "topics": topics
            })

        return Response(data)
    



# ==========================================
# STAFF TIMETABLE VIEW ADDED
# ==========================================

class StaffTimetableView(APIView):
    """
    This API returns timetable data grouped by year.
    It does NOT modify existing student timetable logic.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # ==========================================
        # 🔹 Fetch all subjects (no filtering yet)
        # ==========================================
        subjects = Subject.objects.select_related(
            "teacher__user"
        )

        time_slots = TimeSlot.objects.all().order_by("start_time")

        response_data = {}

        YEAR_MAP = {
            "FE": "F.E.",
            "SE": "S.E.",
            "TE": "T.E.",
            "BE": "B.E.",
        }

        for year_code, frontend_year in YEAR_MAP.items():

            year_subjects = subjects.filter(year=year_code)

            entries = Timetable.objects.filter(
                subject__in=year_subjects
            ).select_related(
                "subject__teacher__user",
                "timeslot"
            )

            schedule = defaultdict(dict)

            for entry in entries:
                day = entry.get_day_display()

                schedule[day][str(entry.timeslot.id)] = {
                    "id": entry.id,
                    "subjectCode": entry.subject.code if entry.subject else None,
                    "subjectName": entry.subject.name if entry.subject else None,
                    "facultyName": (
                        entry.subject.teacher.user.get_full_name()
                        if entry.subject else None
                    ),
                    "classroom": entry.subject.classroom if entry.subject else None,
                    "lecturesPlanned": 0,  # ✅ Staff page does NOT need teaching plan
                    "lecturesCompleted": 0,
                    "lecturesRemaining": 0,
                }

            response_data[frontend_year] = {
                "timeSlots": TimeSlotSerializer(time_slots, many=True).data,
                "schedule": schedule,
            }

        return Response(response_data)
    


# ==========================================
# BULK UPDATE FOR HOD
# ==========================================
class StaffTimetableBulkUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, year_code):

        # ===============================
        # Check HOD Permission from JWT payload
        # ===============================
        token_payload = request.auth
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_403_FORBIDDEN)

        # If using custom user model with is_hod:
        if not token_payload or not token_payload.get("is_hod", False):
            return Response(
                {"error": "Only HOD can modify timetable"},
                status=status.HTTP_403_FORBIDDEN
            )

        YEAR_MAP = {
            "F.E.": "FE",
            "S.E.": "SE",
            "T.E.": "TE",
            "B.E.": "BE",
        }

        db_year = YEAR_MAP.get(year_code)

        if not db_year:
            return Response(
                {"error": "Invalid year"},
                status=status.HTTP_400_BAD_REQUEST
            )

        schedule = request.data.get("schedule")

        if not schedule:
            return Response(
                {"error": "Schedule data required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ===============================
        # 🔹 Atomic transaction
        # ===============================
        with transaction.atomic():

            subjects = Subject.objects.filter(year=db_year)

            # Delete existing timetable entries for that year
            Timetable.objects.filter(subject__in=subjects).delete()

            # Recreate
            for day, slots in schedule.items():

                day_code = day[:3].upper()  # MON, TUE...

                for slot_id, lecture in slots.items():

                    if not lecture:
                        continue

                    subject = Subject.objects.filter(
                        code=lecture["subjectCode"],
                        year=db_year
                    ).first()

                    timeslot = TimeSlot.objects.filter(id=slot_id).first()

                    if subject and timeslot:
                        Timetable.objects.create(
                            subject=subject,
                            timeslot=timeslot,
                            day=day_code
                        )

        return Response({"status": "updated"}, status=200)