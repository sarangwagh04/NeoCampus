from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_http_methods
from django.utils.dateparse import parse_date
from django.db import IntegrityError
from profiles.models import StaffProfile, StudentProfile
from .models import Subject, SubjectAssignment, TeachingPlan
from django.db.models import Count, Q


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404


# ===========================
# MODELS
# ===========================

from profiles.models import StaffProfile, StudentProfile
from .models import (
    Subject,
    SubjectAssignment,
    TeachingPlan,
    Attendance
)

# ===========================
# SERIALIZERS
# ===========================

from .serializers import (
    SubjectSerializer,
    SubjectAssignmentSerializer,
    StaffMiniSerializer,
    TeachingPlanSerializer
)

# ==============================================================
# STUDENT DASHBOARD – OVERALL ATTENDANCE STATS
# ==============================================================

class StudentStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student_profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {"detail": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        batch_id = student_profile.batch_id
        semester = int(student_profile.semester)

        total_lectures = TeachingPlan.objects.filter(
            assignment__batch_id=batch_id,
            assignment__semester=semester
        ).count()

        present_lectures = Attendance.objects.filter(
            student=student_profile,
            is_present=True
        ).count()

        attendance_percentage = (
            round((present_lectures / total_lectures) * 100)
            if total_lectures > 0 else 0
        )

        subject_count = SubjectAssignment.objects.filter(
            batch_id=batch_id,
            semester=semester
        ).count()

        return Response({
            "attendance_percentage": attendance_percentage,
            "subjects_enrolled": subject_count,
        })

# ==============================================================
# SUBJECT MANAGEMENT (STAFF / HOD)
# ==============================================================

class SubjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_staff_profile(self, user):
        try:
            return StaffProfile.objects.get(user=user)
        except StaffProfile.DoesNotExist:
            return None

    def get(self, request):
        staff_profile = self.get_staff_profile(request.user)
        if not staff_profile:
            return Response(
                {"detail": "Only staff can access subjects"},
                status=status.HTTP_403_FORBIDDEN
            )

        subjects = Subject.objects.filter(branch=staff_profile.branch)
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    def post(self, request):
        staff_profile = self.get_staff_profile(request.user)
        if not staff_profile:
            return Response(
                {"detail": "Only staff can create subjects"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            # ✅ IMPORTANT FIX: Branch is auto-set from logged-in staff
            serializer.save(branch=staff_profile.branch)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubjectToggleStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, subject_id):
        subject = get_object_or_404(Subject, id=subject_id)
        subject.is_active = not subject.is_active
        subject.save()
        return Response({"status": "updated"})


class SubjectDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, subject_id):
        subject = get_object_or_404(Subject, id=subject_id)
        subject.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ==============================================================
# STAFF LIST (BRANCH FILTERED – FOR ASSIGNMENT)
# ==============================================================

class StaffListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hod = get_object_or_404(StaffProfile, user=request.user)
        staff = StaffProfile.objects.filter(branch=hod.branch)
        serializer = StaffMiniSerializer(staff, many=True)
        return Response(serializer.data)

# ==============================================================
# SUBJECT ASSIGNMENTS
# ==============================================================

class SubjectAssignmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        staff = get_object_or_404(StaffProfile, user=request.user)

        assignments = (
            SubjectAssignment.objects
            .filter(subject__branch=staff.branch)
            .select_related('subject', 'staff')
        )

        serializer = SubjectAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SubjectAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SubjectAssignmentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, assignment_id):
        assignment = get_object_or_404(
            SubjectAssignment,
            assignment_id=assignment_id
        )
        assignment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ==============================================================
# BATCH LIST (FROM STUDENTS – BRANCH FILTERED)
# ==============================================================

class BatchListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        staff = get_object_or_404(StaffProfile, user=request.user)

        batches = (
            StudentProfile.objects
            .filter(branch=staff.branch)
            .values_list('batch_id', flat=True)
            .distinct()
        )

        return Response([
            {"id": batch, "name": batch}
            for batch in batches if batch
        ])

# ==============================================================
# TEACHING PLAN (ASSIGNMENT BASED)
# ==============================================================

class TeachingPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        plans = TeachingPlan.objects.filter(
            assignment__assignment_id=assignment_id
        ).order_by('lecture_number')

        data = []
        for p in plans:
            data.append({
                "id": p.id,
                "lecture_number": p.lecture_number,
                "topic": p.topic,
                "lecture_date": p.lecture_date,
                "is_completed": Attendance.objects.filter(
                    teaching_plan=p
                ).exists()
            })

        return Response(data)

    def post(self, request, assignment_id):
        assignment = get_object_or_404(
            SubjectAssignment,
            assignment_id=assignment_id
        )

        serializer = TeachingPlanSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save(assignment=assignment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, assignment_id):
        assignment = get_object_or_404(
            SubjectAssignment,
            assignment_id=assignment_id
        )

        TeachingPlan.objects.filter(assignment=assignment).delete()

        serializer = TeachingPlanSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save(assignment=assignment)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MySubjectAssignmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        staff = get_object_or_404(StaffProfile, user=request.user)

        assignments = (
            SubjectAssignment.objects
            .filter(staff=staff)
            .select_related('subject', 'staff')
        )

        serializer = SubjectAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)



class AssignmentStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        assignment = get_object_or_404(
            SubjectAssignment,
            assignment_id=assignment_id
        )

        students = StudentProfile.objects.filter(
            batch_id=assignment.batch_id,
            semester=assignment.semester
        )

        return Response([
            {
                "id": s.id,
                "username": s.user.username,
                "name": f"{s.first_name} {s.last_name}"
            }
            for s in students
        ])


class AttendanceSaveView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id, lecture_id):
        lecture = get_object_or_404(
            TeachingPlan,
            id=lecture_id,
            assignment__assignment_id=assignment_id
        )

        records = Attendance.objects.filter(
            teaching_plan=lecture
        )

        return Response([
            {
                "student_id": r.student.id,
                "is_present": r.is_present
            }
            for r in records
        ])

    def post(self, request, assignment_id, lecture_id):
        lecture = get_object_or_404(
            TeachingPlan,
            id=lecture_id,
            assignment__assignment_id=assignment_id
        )

        Attendance.objects.filter(teaching_plan=lecture).delete()

        for r in request.data:
            Attendance.objects.create(
                teaching_plan=lecture,
                student_id=r["studentId"],
                is_present=r["isPresent"]
            )

        return Response({"status": "saved"})

# ========================================================================
# Attendance % calculation for each student & Subject (Staff Dashboard)
# ========================================================================

from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

class AttendancePercentageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        assignment = get_object_or_404(
            SubjectAssignment,
            assignment_id=assignment_id
        )

        students = StudentProfile.objects.filter(
            batch_id=assignment.batch_id,
            semester=assignment.semester
        )

        data = []

        for student in students:

            # ✅ Total lectures for assignment
            total_lectures = Attendance.objects.filter(
                teaching_plan__assignment=assignment,
                student=student
            ).count()

            # ✅ Present lectures
            attended_lectures = Attendance.objects.filter(
                teaching_plan__assignment=assignment,
                student=student,
                is_present=True
            ).count()

            percentage = (
                round((attended_lectures / total_lectures) * 100, 2)
                if total_lectures > 0 else 0
            )

            data.append({
                "student_id": student.id,
                "attended_lectures": attended_lectures,
                "total_lectures": total_lectures,
                "percentage": percentage
            })

        return Response(data)





# ==============================================================
# ATTENDANCE OVERVIEW (LECTURES COMPLETED)
# ==============================================================

class AttendanceOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id):
        assignment = get_object_or_404(
            SubjectAssignment,
            assignment_id=assignment_id
        )

        # 1️⃣ Get total students count
        students_count = StudentProfile.objects.filter(
            batch_id=assignment.batch_id,
            semester=assignment.semester
        ).count()

        # 2️⃣ Get lectures with aggregated present count
        lectures = (
            TeachingPlan.objects
            .filter(assignment=assignment)
            .annotate(
                present_count=Count(
                    "attendance_records",
                    filter=Q(attendance_records__is_present=True)
                )
            )
            .order_by("lecture_number")
        )

        # 3️⃣ Build response
        data = [
            {
                "lecture_number": lecture.lecture_number,
                "topic": lecture.topic,
                "date": lecture.lecture_date,
                "present_count": lecture.present_count,
                "total_count": students_count,
            }
            for lecture in lectures
        ]

        return Response(data)
    


# ==============================================================  
# ATTENDANCE CORRECTION  (On Attendance marking page)
# ==============================================================

class AttendanceCorrectionView(APIView):
    permission_classes = [IsAuthenticated]

    # ✅ NEW: GET attendance status for single student + lecture
    def get(self, request, assignment_id, lecture_id, student_id):
        assignment = get_object_or_404(
            SubjectAssignment,
            assignment_id=assignment_id
        )

        lecture = get_object_or_404(
            TeachingPlan,
            id=lecture_id,
            assignment=assignment
        )

        record = Attendance.objects.filter(
            teaching_plan=lecture,
            student_id=student_id
        ).first()

        return Response({
            "is_present": record.is_present if record else False
        })


    # ✅ EXISTING: POST correction
    def post(self, request, assignment_id, lecture_id, student_id):
        assignment = get_object_or_404(
            SubjectAssignment,
            assignment_id=assignment_id
        )

        lecture = get_object_or_404(
            TeachingPlan,
            id=lecture_id,
            assignment=assignment
        )

        record, _ = Attendance.objects.get_or_create(
            teaching_plan=lecture,
            student_id=student_id
        )

        record.is_present = request.data.get("is_present", False)
        record.save()

        return Response({"status": "updated"})



# ==============================================================
# STUDENT ATTENDANCE HISTORY (FOR CORRECTION MODAL)
# ==============================================================

class StudentAttendanceHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id, student_id):

        assignment = get_object_or_404(
            SubjectAssignment,
            assignment_id=assignment_id
        )

        lectures = TeachingPlan.objects.filter(
            assignment=assignment
        )

        data = []

        for lecture in lectures:
            record = Attendance.objects.filter(
                teaching_plan=lecture,
                student_id=student_id
            ).first()

            data.append({
                "lecture_id": lecture.id,
                "is_present": record.is_present if record else False
            })

        return Response(data)



# ==============================================================
# ATTENDANCE CORRECTION  (On Lectures Completed view)
# ==============================================================

class LectureAttendanceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id, lecture_id):

        assignment = get_object_or_404(
            SubjectAssignment,
            assignment_id=assignment_id
        )

        lecture = get_object_or_404(
            TeachingPlan,
            id=lecture_id,
            assignment=assignment
        )

        records = Attendance.objects.filter(
            teaching_plan=lecture
        )

        data = []

        for record in records:
            data.append({
                "student_id": record.student.id,
                "is_present": record.is_present
            })

        return Response(data)




# ==============================================================
# GENERATE HOD ATTENDANCE REPORT (PERCENTAGE FILTER ONLY)
# ==============================================================

class AttendanceReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        branch = request.data.get("branch")
        min_percentage = request.data.get("min_percentage")
        max_percentage = request.data.get("max_percentage")

        if not branch:
            return Response({"error": "Branch is required"}, status=400)

        assignments = SubjectAssignment.objects.filter(
            subject__branch=branch
        ).select_related("subject")

        students = StudentProfile.objects.filter(
            branch=branch
        ).select_related("user")

        result = []

        for student in students:
            subject_data = []
            total_attended = 0
            total_lectures = 0

            for assignment in assignments:
                lectures = TeachingPlan.objects.filter(
                    assignment=assignment
                )

                total = lectures.count()

                if total == 0:
                    continue

                attended = Attendance.objects.filter(
                    teaching_plan__in=lectures,
                    student=student,
                    is_present=True
                ).count()

                percentage = round((attended / total) * 100, 2)

                total_attended += attended
                total_lectures += total

                subject_data.append({
                    "code": assignment.subject.code,
                    "attended": attended,
                    "total": total,
                    "percentage": percentage,
                })

            if total_lectures == 0:
                continue

            overall_percentage = round(
                (total_attended / total_lectures) * 100, 2
            )

            # Apply percentage filter safely
            if min_percentage is not None:
                if overall_percentage < int(min_percentage):
                    continue

            if max_percentage is not None:
                if overall_percentage > int(max_percentage):
                    continue

            result.append({
                "rollNumber": student.user.username,
                "name": student.user.get_full_name(),
                "branch": branch,
                "semester": student.semester,
                "subjects": subject_data,
                "totalAttended": total_attended,
                "totalLectures": total_lectures,
                "overallPercentage": overall_percentage,
            })

        return Response(result)





# ==============================================================
# STUDENT OVERALL ATTENDANCE -attendance page
# ==============================================================

class StudentOverallAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get logged-in student profile
        student_profile = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        # Get all assignments for this student batch + semester
        assignments = SubjectAssignment.objects.filter(
            batch_id=student_profile.batch_id,
            semester=student_profile.semester
        ).select_related("subject")

        subjects_data = []
        total_attended = 0
        total_lectures = 0

        for assignment in assignments:

            total = Attendance.objects.filter(
                teaching_plan__assignment=assignment,
                student=student_profile
            ).count()

            attended = Attendance.objects.filter(
                teaching_plan__assignment=assignment,
                student=student_profile,
                is_present=True
            ).count()

            percentage = (
                round((attended / total) * 100, 2)
                if total > 0 else 0
            )

            total_attended += attended
            total_lectures += total

            subjects_data.append({
                "code": assignment.subject.code,
                "name": assignment.subject.name,
                "attended": attended,
                "total": total,
                "percentage": percentage
            })

        overall_percentage = (
            round((total_attended / total_lectures) * 100, 2)
            if total_lectures > 0 else 0
        )

        return Response({
            "overallPercentage": overall_percentage,
            "subjects": subjects_data
        })



































# ==============================================================
#Old code
# ==============================================================

# ==============================================================
# SAVE / UPDATE TEACHING PLAN
# ==============================================================
@csrf_exempt
@require_http_methods(["POST"])
@login_required
def save_teaching_plan(request, assignment_id):
    """Create or update teaching plan for a subject."""
    staff = StaffProfile.objects.get(user=request.user)
    assignment = get_object_or_404(
        SubjectAssignment,
        assignment_id=assignment_id,
        staff=staff
    )

    total_lectures = int(request.POST.get("total_lectures", 0))

    # Remove old plan before inserting updated list
    TeachingPlan.objects.filter(assignment=assignment).delete()

    # Insert new plan rows
    for i in range(1, total_lectures + 1):
        topic = request.POST.get(f"topic_{i}")
        date_str = request.POST.get(f"date_{i}")
        lecture_date = parse_date(date_str)

        TeachingPlan.objects.create(
            assignment=assignment,
            lecture_number=i,
            topic=topic,
            lecture_date=lecture_date,
        )

    return JsonResponse({"success": True, "message": "Teaching plan saved successfully!"})


# ==============================================================
# AJAX API: CREATE SUBJECT (HOD ONLY)
# ==============================================================
@csrf_exempt
@require_POST
@login_required
def create_subject(request):
    """Allows only HOD to create new subjects."""
    staff = StaffProfile.objects.filter(user=request.user).first()

    if not staff:
        return JsonResponse({"success": False, "error": "Staff profile not found."}, status=404)

    if not staff.is_hod:
        return JsonResponse({"success": False, "error": "Only HODs may create subjects."}, status=403)

    name = request.POST.get("name", "").strip()
    code = request.POST.get("code", "").strip()

    if not name or not code:
        return JsonResponse({"success": False, "error": "Name and code are required."}, status=400)

    if Subject.objects.filter(code__iexact=code, branch=staff.branch).exists():
        return JsonResponse({"success": False, "error": "Subject code already exists."}, status=400)

    subject = Subject.objects.create(
        name=name,
        code=code,
        branch=staff.branch,
        is_active=True,
    )

    return JsonResponse({
        "success": True,
        "message": f"Subject '{subject.name}' created successfully!",
        "subject": {
            "id": subject.id,
            "name": subject.name,
            "code": subject.code,
            "branch": subject.branch,
            "is_active": subject.is_active,
        },
    })


# ==============================================================
# AJAX API: ASSIGN SUBJECT TO STAFF + BATCH
# ==============================================================
@login_required
@require_POST
def assign_subject(request):
    """HOD assigns a subject to a staff member for a specific batch."""
    hod = StaffProfile.objects.filter(user=request.user).first()

    if not hod:
        return JsonResponse({"success": False, "message": "Staff profile not found."})

    if not hod.is_hod:
        return JsonResponse({"success": False, "message": "Not authorized."})

    subject_id = request.POST.get("subject")
    staff_user_id = request.POST.get("staff")
    batch_id = request.POST.get("batch")
    semester = request.POST.get("semester", 1)

    if not all([subject_id, staff_user_id, batch_id]):
        return JsonResponse({"success": False, "message": "All fields are required."})

    try:
        subject = Subject.objects.get(id=subject_id, branch=hod.branch)
        staff = StaffProfile.objects.get(user__id=staff_user_id, branch=hod.branch)
    except Subject.DoesNotExist:
        return JsonResponse({"success": False, "message": "Invalid subject selected."})
    except StaffProfile.DoesNotExist:
        return JsonResponse({"success": False, "message": "Invalid staff selected."})

    try:
        assignment, created = SubjectAssignment.objects.get_or_create(
            subject=subject,
            batch_id=batch_id,
            semester=semester,
            defaults={"staff": staff},
        )

        if not created:
            return JsonResponse({
                "success": False,
                "message": "This subject is already assigned for this batch and semester."
            })

        return JsonResponse({
            "success": True,
            "message": f"Assigned '{subject.name}' to {staff.user.get_full_name()} for Batch {batch_id}, Sem {semester}.",
            "assignment_id": str(assignment.assignment_id)
        })

    except IntegrityError:
        return JsonResponse({
            "success": False,
            "message": "A duplicate assignment already exists."
        })



# ==============================================================
# SAVE ATTENDANCE
# ==============================================================
@csrf_exempt
@require_POST
@login_required
def attendance_marking_save(request, assignment_id):
    """Save attendance for current lecture."""
    staff = StaffProfile.objects.get(user=request.user)
    assignment = get_object_or_404(
        SubjectAssignment, assignment_id=assignment_id, staff=staff
    )

    lecture_number = request.POST.get("lecture_number")
    lecture = get_object_or_404(
        TeachingPlan, assignment=assignment, lecture_number=lecture_number
    )

    # Parse default present toggle
    default_present = request.POST.get("default_present") == "true"

    # Fetch students
    students = StudentProfile.objects.filter(
        batch_id=assignment.batch_id
    )

    # Clear existing records for this lecture (if re-marking)
    Attendance.objects.filter(teaching_plan=lecture).delete()

    # Save attendance
    for s in students:
        # Checkbox value exists only if override was applied
        override = request.POST.get(f"student_{s.user.id}")
        if override is None:
            # No override selected → use DEFAULT
            is_present = default_present
        else:
            # Override checkbox present → mark PRESENT
            is_present = True

        Attendance.objects.create(
            teaching_plan=lecture,
            student=s,
            is_present=is_present
        )

    return JsonResponse({"success": True, "message": "Attendance saved successfully!"})




# ==============================================================
# LOAD CORRECTION DATA
# ==============================================================
@login_required
def attendance_correction_view(request, assignment_id, student_id):
    """Fetch attendance history for a specific student."""
    staff = StaffProfile.objects.get(user=request.user)
    assignment = get_object_or_404(
        SubjectAssignment, assignment_id=assignment_id, staff=staff
    )

    student = get_object_or_404(StudentProfile, user_id=student_id)

    # All lectures in this subject
    lectures = TeachingPlan.objects.filter(assignment=assignment).order_by("lecture_number")

    data = []
    for lec in lectures:
        record = Attendance.objects.filter(teaching_plan=lec, student=student).first()

        data.append({
            "lecture_number": lec.lecture_number,
            "topic": lec.topic,
            "date": lec.lecture_date.strftime("%Y-%m-%d"),
            "present": record.is_present if record else None,
        })

    return JsonResponse({"success": True, "student": student.user.get_full_name(), "data": data})



# ==============================================================
# SAVE CORRECTION DATA
# ==============================================================
@csrf_exempt
@require_POST
@login_required
def attendance_correction_save(request, assignment_id, student_id):
    """Update attendance for all lectures of a specific student."""
    staff = StaffProfile.objects.get(user=request.user)
    assignment = get_object_or_404(
        SubjectAssignment, assignment_id=assignment_id, staff=staff
    )

    student = get_object_or_404(StudentProfile, user_id=student_id)

    lectures = TeachingPlan.objects.filter(assignment=assignment)

    for lec in lectures:
        key = f"lec_{lec.lecture_number}"
        present_val = request.POST.get(key)

        if present_val is None:
            continue

        is_present = present_val == "1"

        # Create or update attendance
        record, created = Attendance.objects.update_or_create(
            teaching_plan=lec,
            student=student,
            defaults={"is_present": is_present}
        )

    return JsonResponse({"success": True, "message": "Attendance corrected successfully!"})


