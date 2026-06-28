from django.core.management.base import BaseCommand
import random
from attendance.models import SubjectAssignment, TeachingPlan, Attendance
from profiles.models import StudentProfile


class Command(BaseCommand):
    help = "Seed attendance data for students across subject assignments"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear all existing attendance records before seeding",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted_count, _ = Attendance.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(f"[CLEARED] Cleared {deleted_count} existing attendance record(s)")
            )

        assignments = SubjectAssignment.objects.select_related("subject").all()

        if not assignments.exists():
            self.stdout.write(self.style.ERROR("[ERROR] No subject assignments found!"))
            return

        total_attendance_created = 0

        for assignment in assignments:
            subject_code = assignment.subject.code
            
            # Fetch teaching plans (lectures) for this assignment, ordered by lecture_number
            lectures = list(TeachingPlan.objects.filter(assignment=assignment).order_by('lecture_number'))
            
            if not lectures:
                self.stdout.write(
                    self.style.WARNING(f"[WARN] No teaching plan found for {subject_code} - skipping")
                )
                continue

            # Fetch students for this batch and semester
            # Student profiles might use CSD_2022 while assignment uses CSD-2022
            student_batch_id = assignment.batch_id.replace("-", "_")
            students = list(StudentProfile.objects.filter(
                batch_id=student_batch_id,
                semester=assignment.semester
            ))

            if not students:
                self.stdout.write(
                    self.style.WARNING(f"[WARN] No students found for batch {student_batch_id}, sem {assignment.semester} - skipping")
                )
                continue

            # Decide randomly how many lectures are completed for this subject
            # Options: 100% (all lectures), 75% (15 lectures), 50% (10 lectures), 25% (5 lectures)
            completion_fraction = random.choice([1.0, 0.75, 0.5, 0.25])
            num_lectures_conducted = int(len(lectures) * completion_fraction)

            if num_lectures_conducted == 0:
                continue

            conducted_lectures = lectures[:num_lectures_conducted]
            
            attendance_to_create = []
            
            for lecture in conducted_lectures:
                for student in students:
                    # Randomly mark present or absent (e.g., 80% chance of being present)
                    is_present = random.random() < 0.80
                    
                    attendance_to_create.append(
                        Attendance(
                            teaching_plan=lecture,
                            student=student,
                            is_present=is_present
                        )
                    )
            
            if attendance_to_create:
                # Use ignore_conflicts=True to avoid IntegrityError if a record already exists
                Attendance.objects.bulk_create(attendance_to_create, ignore_conflicts=True)
                total_attendance_created += len(attendance_to_create)
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f"[OK] {subject_code} ({assignment.subject.name}): "
                        f"Marked attendance for {len(students)} students across {num_lectures_conducted} lectures."
                    )
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"[DONE] Total attendance records created: {total_attendance_created}"
            )
        )
