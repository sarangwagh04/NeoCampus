from django.db import models
from profiles.models import StaffProfile, StudentProfile
import uuid


# ===========================
# SUBJECT MODEL
# ===========================
class Subject(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    branch = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


# ===========================
# SUBJECT ASSIGNMENT MODEL
# ===========================
class SubjectAssignment(models.Model):
    # Global unique ID for linking teaching plan, attendance, etc.
    assignment_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE)
    batch_id = models.CharField(max_length=20)
    semester = models.PositiveIntegerField(default=1)  # Needed for sem-wise cycle
    assigned_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Only ONE staff can teach a subject for one batch in one semester
        unique_together = ('subject', 'batch_id', 'semester')

        # Postgres optimized indexes
        indexes = [
            models.Index(fields=['subject', 'batch_id', 'semester']),
            models.Index(fields=['assignment_id']),
            models.Index(fields=['staff']),
        ]

    def __str__(self):
        return f"{self.subject.code} → {self.staff.user.get_full_name()} (Batch {self.batch_id}, Sem {self.semester})"


# ===========================
# TEACHING PLAN MODEL
# ===========================
class TeachingPlan(models.Model):
    assignment = models.ForeignKey(
        SubjectAssignment,
        on_delete=models.CASCADE,
        related_name="teaching_plan"
    )

    lecture_number = models.PositiveIntegerField()
    topic = models.CharField(max_length=255)
    lecture_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('assignment', 'lecture_number')
        ordering = ['lecture_number']
        indexes = [
            models.Index(fields=['assignment']),
            models.Index(fields=['lecture_number']),
        ]

    def __str__(self):
        return f"{self.assignment.subject.code} - Lecture {self.lecture_number}"


# ===========================
# ATTENDANCE MODEL
# ===========================
class Attendance(models.Model):
    teaching_plan = models.ForeignKey(
        TeachingPlan,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)

    is_present = models.BooleanField(default=False)
    marked_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('teaching_plan', 'student')
        indexes = [
            models.Index(fields=['teaching_plan']),
            models.Index(fields=['student']),
        ]

    def __str__(self):
        return f"{self.student.user.get_full_name()} → {self.teaching_plan.lecture_number} ({'Present' if self.is_present else 'Absent'})"
