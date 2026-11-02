# home/services/demo_seeder.py
import json
import logging
import os
import pickle
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo
from PIL import Image

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from accounts.models import StudentUpload
from attendance.models import (
    Attendance,
    Subject as AttendanceSubject,
    SubjectAssignment,
    TeachingPlan,
)
from chatbot.models import Chunk, UploadedDocument
from home.models import DemoResetLog
from noticeboard.models import Notice, NoticeFile, NoticeLink
from profiles.models import StaffProfile, StudentProfile
from results.models import ResultEntry, ResultUpload
from timetables.models import Subject as TimetableSubject, TimeSlot, Timetable

logger = logging.getLogger(__name__)
User = get_user_model()


def should_reset_for_midnight(
    last_reset_time=None,
    reset_tz_name: str = "Asia/Kolkata",
    reset_hour: int = 0,
    reset_minute: int = 0
) -> bool:
    """
    Checks if the daily 12:00 AM (midnight) reset cutoff has been crossed
    since the last successful reset.
    """
    try:
        tz = ZoneInfo(reset_tz_name)
    except Exception:
        tz = ZoneInfo("Asia/Kolkata")

    now = timezone.now()
    if timezone.is_naive(now):
        now = timezone.make_aware(now, timezone.utc)
    now = now.astimezone(tz)

    if not last_reset_time:
        return True

    if timezone.is_naive(last_reset_time):
        last_reset_time = timezone.make_aware(last_reset_time, timezone.utc)
    last_reset_local = last_reset_time.astimezone(tz)

    today_reset_point = now.replace(
        hour=reset_hour,
        minute=reset_minute,
        second=0,
        microsecond=0
    )

    if now >= today_reset_point:
        return last_reset_local < today_reset_point
    else:
        yesterday_reset_point = today_reset_point - timedelta(days=1)
        return last_reset_local < yesterday_reset_point


def get_next_scheduled_reset(
    reset_tz_name: str = "Asia/Kolkata",
    reset_hour: int = 0,
    reset_minute: int = 0
) -> dict:
    """
    Returns next scheduled midnight reset datetime, timezone name, and seconds remaining.
    """
    try:
        tz = ZoneInfo(reset_tz_name)
    except Exception:
        tz = ZoneInfo("Asia/Kolkata")

    now = timezone.now()
    if timezone.is_naive(now):
        now = timezone.make_aware(now, timezone.utc)
    now = now.astimezone(tz)

    today_reset_point = now.replace(
        hour=reset_hour,
        minute=reset_minute,
        second=0,
        microsecond=0
    )

    if now < today_reset_point:
        next_reset = today_reset_point
    else:
        next_reset = today_reset_point + timedelta(days=1)

    seconds_remaining = max(0, int((next_reset - now).total_seconds()))

    return {
        "next_reset_iso": next_reset.isoformat(),
        "timezone": reset_tz_name,
        "reset_time": f"{reset_hour:02d}:{reset_minute:02d} ({'Midnight / 12:00 AM' if reset_hour == 0 else f'{reset_hour}:{reset_minute:02d}'})",
        "seconds_remaining": seconds_remaining,
    }


def _create_minimal_pdf(file_path: str, title: str):
    """Generates a small valid PDF file on disk for realistic document downloads."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    if os.path.exists(file_path):
        return
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
        b"xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \n"
        b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n"
    )
    with open(file_path, "wb") as f:
        f.write(pdf_content)


def _create_avatar_image(file_path: str, color_rgb: tuple):
    """Generates a clean square avatar PNG for student and staff profile display."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    if os.path.exists(file_path):
        return
    img = Image.new("RGB", (200, 200), color=color_rgb)
    img.save(file_path, format="PNG")


def _create_excel_ledger(file_path: str, batch_id: str, rows: list):
    """Generates a valid Excel ledger (.xlsx) on disk using openpyxl."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    try:
        import openpyxl
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = f"Results_{batch_id}"
        headers = [
            "Seat No", "Student Name", "Username", "Batch", "Subject Code",
            "Subject Name", "ISE (30)", "ESE (70)", "Total (100)", "Grade", "Credits", "SGPA"
        ]
        ws.append(headers)
        for r in rows:
            ws.append(r)
        wb.save(file_path)
    except Exception as e:
        logger.warning(f"Could not generate Excel ledger: {e}")
        with open(file_path, "w") as f:
            f.write(f"NeoCampus Results Ledger for {batch_id}\n")


def reset_and_seed_demo_data(triggered_by: str = "auto") -> dict:
    """
    Cleans all ephemeral data created by users during demo runs and seeds
    a rich, deterministic, production-grade baseline dataset for all NeoCampus features:
    - User Profiles & Dashboards (Student, Staff, HOD, Admin)
    - Full Academic Attendance (6 Subjects, Assignments, 72 Teaching Plans, Student Attendance Logs)
    - Weekly Timetables (Monday - Sunday for both B.E. and T.E. classes)
    - Academic Results, Marksheets & Backlog Tracking (CSD-2022 & CSD-2023)
    - Noticeboard & Downloadable Study Materials (with actual PDF documents on disk)
    - AI Chatbot RAG Knowledge Base (3 Documents with 15 Indexed Chunks)
    - Student Accounts & Batch Upload History
    """
    with transaction.atomic():
        logger.info(f"Initiating demo database reset and seed (triggered by {triggered_by})...")

        # -----------------------------------------------------------------
        # STEP 1: RESOLVE CANONICAL DEMO USERS
        # -----------------------------------------------------------------
        # 1. Primary Student: student1 (Suhas Navale)
        student_user = User.objects.filter(
            Q(username="student1") | Q(username="student@neocampus.com") | Q(email="student@neocampus.com")
        ).first()
        if not student_user:
            student_user = User(username="student1")
        student_user.username = "student1"
        student_user.email = "student@neocampus.com"
        student_user.first_name = "Suhas"
        student_user.last_name = "Navale"
        student_user.is_staff = False
        student_user.is_superuser = False
        student_user.is_active = True
        student_user.set_password("student123")
        student_user.save()

        # 2. Primary Staff: staff1 (Prof. Pooja Pawar)
        staff_user = User.objects.filter(
            Q(username="staff1") | Q(username="staff@neocampus.com") | Q(email="staff@neocampus.com")
        ).first()
        if not staff_user:
            staff_user = User(username="staff1")
        staff_user.username = "staff1"
        staff_user.email = "staff@neocampus.com"
        staff_user.first_name = "Pooja"
        staff_user.last_name = "Pawar"
        staff_user.is_staff = True
        staff_user.is_superuser = False
        staff_user.is_active = True
        staff_user.set_password("staff123")
        staff_user.save()

        # 3. Head of Department: staff_hod (Dr. Rahul Tambe)
        hod_user = User.objects.filter(
            Q(username="staff_hod") | Q(username="hod@neocampus.com") | Q(email="hod@neocampus.com")
        ).first()
        if not hod_user:
            hod_user = User(username="staff_hod")
        hod_user.username = "staff_hod"
        hod_user.email = "hod@neocampus.com"
        hod_user.first_name = "Rahul"
        hod_user.last_name = "Tambe"
        hod_user.is_staff = True
        hod_user.is_superuser = False
        hod_user.is_active = True
        hod_user.set_password("staff123")
        hod_user.save()

        # 4. Super Administrator: admin
        admin_user = User.objects.filter(
            Q(username="admin") | Q(email="admin@neocampus.com")
        ).first()
        if not admin_user:
            admin_user = User(username="admin")
        admin_user.username = "admin"
        admin_user.email = "admin@neocampus.com"
        admin_user.first_name = "NeoCampus"
        admin_user.last_name = "Administrator"
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.set_password("admin123")
        admin_user.save()

        # 5. Author account (sarangwagh)
        sarang_user = User.objects.filter(username="sarangwagh").first()
        if sarang_user:
            sarang_user.is_staff = True
            sarang_user.is_superuser = True
            sarang_user.save()

        # -----------------------------------------------------------------
        # STEP 2: CLEAN UP EPHEMERAL RECORDS FROM PREVIOUS DEMO SESSIONS
        # -----------------------------------------------------------------
        Attendance.objects.all().delete()
        TeachingPlan.objects.all().delete()
        SubjectAssignment.objects.all().delete()
        AttendanceSubject.objects.all().delete()

        Timetable.objects.all().delete()
        TimetableSubject.objects.all().delete()
        TimeSlot.objects.all().delete()

        ResultEntry.objects.all().delete()
        ResultUpload.objects.all().delete()

        NoticeLink.objects.all().delete()
        NoticeFile.objects.all().delete()
        Notice.objects.all().delete()

        Chunk.objects.all().delete()
        UploadedDocument.objects.all().delete()

        StudentUpload.objects.all().delete()

        # Invalidate stale active user sessions
        try:
            from django.contrib.sessions.models import Session
            Session.objects.all().delete()
        except Exception:
            pass

        # Clean dynamic test users created during previous demos
        preserved_user_ids = {student_user.id, staff_user.id, hod_user.id, admin_user.id}
        if sarang_user:
            preserved_user_ids.add(sarang_user.id)

        # Preserve any superusers created in admin
        for su in User.objects.filter(is_superuser=True):
            preserved_user_ids.add(su.id)

        # Preserve cohort student users (Batch 2022 and Batch 2023)
        cohort_usernames = ["student2", "student3", "student4", "student5", "student6", "student7"]
        for cu in User.objects.filter(username__in=cohort_usernames):
            preserved_user_ids.add(cu.id)

        User.objects.exclude(id__in=preserved_user_ids).delete()

        seeded_counts = {}

        # -----------------------------------------------------------------
        # STEP 3: USER PROFILES WITH AVATARS & HARDWARE KEYS
        # -----------------------------------------------------------------
        # Generate avatars
        student_avatar_path = os.path.join(settings.MEDIA_ROOT, "profile_pictures", "student_suhas.png")
        staff_avatar_path = os.path.join(settings.MEDIA_ROOT, "profile_pictures", "staff_pooja.png")
        hod_avatar_path = os.path.join(settings.MEDIA_ROOT, "profile_pictures", "staff_rahul.png")
        _create_avatar_image(student_avatar_path, (59, 130, 246))   # Blue
        _create_avatar_image(staff_avatar_path, (16, 185, 129))     # Emerald
        _create_avatar_image(hod_avatar_path, (245, 158, 11))       # Amber

        student_profile, _ = StudentProfile.objects.update_or_create(
            user=student_user,
            defaults={
                "first_name": "Suhas",
                "middle_name": "K.",
                "last_name": "Navale",
                "gender": "Male",
                "dob": date(2003, 5, 15),
                "profile_picture": "profile_pictures/student_suhas.png",
                "branch": "CSD",
                "semester": "8",
                "admission_year": "2022",
                "role": "Student",
                "batch_id": "CSD-2022",
                "mobile_number": "8180849725",
                "address": "Campus Hostel Block B, Room 204",
                "parents_name": "Kiran Navale",
                "parents_mobile_number": "9822012345",
                "hardware_public_key": "MCowBQYDK2VwAyEAdEm03WqP49pY1xZ4k5+NeocampusStudentEd25519Key=",
            },
        )

        staff_profile, _ = StaffProfile.objects.update_or_create(
            user=staff_user,
            defaults={
                "first_name": "Pooja",
                "middle_name": "S.",
                "last_name": "Pawar",
                "gender": "Female",
                "dob": date(1990, 8, 20),
                "profile_picture": "profile_pictures/staff_pooja.png",
                "branch": "CSD",
                "is_hod": False,
                "designation": "Assistant Professor",
                "qualifications": "M.Tech (Computer Science & Engineering)",
                "joined_year": "2019",
                "role": "Staff",
                "mobile_number": "8180849726",
                "address": "Faculty Quarters, Sector 4, University Campus",
                "emergency_name": "Suresh Pawar",
                "emergency_mobile_number": "9822054321",
                "emergency_relation": "Spouse",
                "is_active": True,
                "hardware_public_key": "MCowBQYDK2VwAyEAxK30P89vZ5wT1yU7+NeocampusStaffEd25519Key=",
            },
        )

        hod_profile, _ = StaffProfile.objects.update_or_create(
            user=hod_user,
            defaults={
                "first_name": "Rahul",
                "middle_name": "M.",
                "last_name": "Tambe",
                "gender": "Male",
                "dob": date(1982, 3, 12),
                "profile_picture": "profile_pictures/staff_rahul.png",
                "branch": "CSD",
                "is_hod": True,
                "designation": "Professor & Head of Department",
                "qualifications": "Ph.D. (Computer Science & Design)",
                "joined_year": "2012",
                "role": "Staff",
                "mobile_number": "8180849721",
                "address": "Staff Enclave, University Campus",
                "emergency_name": "Sunita Tambe",
                "emergency_mobile_number": "9822067890",
                "emergency_relation": "Spouse",
                "is_active": True,
            },
        )

        # Cohort Students across two batches for multi-batch analytics
        cohort_spec = [
            # Batch 1: CSD-2022 (Semester 8, Final Year B.E.)
            ("student2", "Aditya", "Sharma", "Male", "aditya.sharma@neocampus.com", "8180849731", "CSD-2022", "8", "2022"),
            ("student3", "Neha", "Patil", "Female", "neha.patil@neocampus.com", "8180849732", "CSD-2022", "8", "2022"),
            ("student4", "Rohan", "Deshmukh", "Male", "rohan.deshmukh@neocampus.com", "8180849733", "CSD-2022", "8", "2022"),
            # Batch 2: CSD-2023 (Semester 6, Third Year T.E.)
            ("student5", "Priya", "Joshi", "Female", "priya.joshi@neocampus.com", "8180849734", "CSD-2023", "6", "2023"),
            ("student6", "Amit", "Kulkarni", "Male", "amit.kulkarni@neocampus.com", "8180849735", "CSD-2023", "6", "2023"),
            ("student7", "Anjali", "Shinde", "Female", "anjali.shinde@neocampus.com", "8180849736", "CSD-2023", "6", "2023"),
        ]

        cohort_profiles = []
        for u_name, f_name, l_name, gender, email, phone, b_id, sem, adm_yr in cohort_spec:
            c_user, _ = User.objects.update_or_create(
                username=u_name,
                defaults={
                    "email": email,
                    "first_name": f_name,
                    "last_name": l_name,
                    "is_staff": False,
                    "is_superuser": False,
                    "is_active": True,
                },
            )
            c_user.set_password("student123")
            c_user.save()

            c_prof, _ = StudentProfile.objects.update_or_create(
                user=c_user,
                defaults={
                    "first_name": f_name,
                    "last_name": l_name,
                    "gender": gender,
                    "dob": date(2003 if adm_yr == "2022" else 2004, 7, 21),
                    "branch": "CSD",
                    "semester": sem,
                    "admission_year": adm_yr,
                    "role": "Student",
                    "batch_id": b_id,
                    "mobile_number": phone,
                    "address": f"Campus Hostel Block {'A' if gender == 'Male' else 'C'}",
                    "parents_name": f"{f_name}'s Guardian",
                    "parents_mobile_number": "9822099999",
                },
            )
            cohort_profiles.append(c_prof)

        seeded_counts["users"] = 4 + len(cohort_spec)

        # -----------------------------------------------------------------
        # STEP 4: ATTENDANCE APP (6 SUBJECTS, ASSIGNMENTS, 72 PLANS, LOGS)
        # -----------------------------------------------------------------
        subjects_spec = [
            # Batch CSD-2022 (Semester 8 - B.E.)
            ("CSD801", "Artificial Intelligence & Deep Learning", staff_profile, "CSD-2022", 8),
            ("CSD802", "Cloud Computing & DevOps", staff_profile, "CSD-2022", 8),
            ("CSD803", "Information & Cyber Security", hod_profile, "CSD-2022", 8),
            ("CSD804", "Mobile & Pervasive Computing", hod_profile, "CSD-2022", 8),
            # Batch CSD-2023 (Semester 6 - T.E.)
            ("CSD601", "Database Management Systems & NoSQL", staff_profile, "CSD-2023", 6),
            ("CSD602", "Computer Networks & Cloud Architecture", hod_profile, "CSD-2023", 6),
        ]

        today = timezone.now().date()
        total_attendance_records = 0
        total_teaching_plans = 0

        # Map profiles by batch
        batch_students_map = {
            "CSD-2022": [student_profile] + cohort_profiles[:3],  # student1, student2, student3, student4
            "CSD-2023": cohort_profiles[3:],                     # student5, student6, student7
        }

        for code, name, teacher, b_id, sem in subjects_spec:
            att_subject = AttendanceSubject.objects.create(
                code=code,
                name=name,
                branch="CSD",
                is_active=True,
            )

            assignment = SubjectAssignment.objects.create(
                subject=att_subject,
                staff=teacher,
                batch_id=b_id,
                semester=sem,
            )

            topics = [
                f"{name} - Introduction and System Foundations",
                f"{name} - Architecture and Core Principles",
                f"{name} - State-of-the-Art Algorithms and Protocols",
                f"{name} - Implementation Patterns & Case Study",
                f"{name} - Performance Optimization & Benchmarking",
                f"{name} - Security Hardening & Threat Models",
                f"{name} - Practical Lab: Real-World Demonstration",
                f"{name} - Mid-Semester Progress Review",
                f"{name} - Advanced Topics & Scalability Patterns",
                f"{name} - Industrial Integration & Modern Toolchains",
                f"{name} - Capstone Project Guidance & Evaluation",
                f"{name} - Comprehensive Final Revision",
            ]

            # 12 lectures: 8 past, 1 today, 3 future
            for idx, topic in enumerate(topics, start=1):
                day_offset = (idx - 9) * 2  # idx 1: -16 days, idx 9: 0 (today), idx 12: +6 days
                lecture_date = today + timedelta(days=day_offset)

                plan = TeachingPlan.objects.create(
                    assignment=assignment,
                    lecture_number=idx,
                    topic=topic,
                    lecture_date=lecture_date,
                )
                total_teaching_plans += 1

                # If lecture has already occurred or is today, record attendance
                if lecture_date <= today:
                    students_in_batch = batch_students_map.get(b_id, [])
                    for s_idx, s_prof in enumerate(students_in_batch):
                        # Realistic attendance distribution:
                        # student1: ~89% attendance (absent on lecture 4)
                        # student2: 100% attendance (Class Topper)
                        # student3: ~78% attendance
                        # student4: ~55% attendance (Defaulter Alert!)
                        # student5, student6, student7: ~85% attendance
                        is_present = True
                        if s_prof.user.username == "student1" and idx == 4:
                            is_present = False
                        elif s_prof.user.username == "student4" and (idx % 2 == 0):
                            is_present = False  # Defaulter
                        elif s_prof.user.username == "student3" and (idx in (3, 7)):
                            is_present = False
                        elif s_prof.user.username == "student7" and idx == 5:
                            is_present = False

                        Attendance.objects.create(
                            teaching_plan=plan,
                            student=s_prof,
                            is_present=is_present,
                        )
                        total_attendance_records += 1

        seeded_counts["attendance_subjects"] = len(subjects_spec)
        seeded_counts["teaching_plans"] = total_teaching_plans
        seeded_counts["attendance_records"] = total_attendance_records

        # -----------------------------------------------------------------
        # STEP 5: TIMETABLES APP (8 SLOTS, B.E. & T.E., MON - SUN)
        # -----------------------------------------------------------------
        time_slot_specs = [
            (time(9, 0), time(10, 0), False, None),
            (time(10, 0), time(11, 0), False, None),
            (time(11, 0), time(11, 15), True, "Morning Tea Break"),
            (time(11, 15), time(12, 15), False, None),
            (time(12, 15), time(13, 15), False, None),
            (time(13, 15), time(14, 0), True, "Lunch Break"),
            (time(14, 0), time(15, 0), False, None),
            (time(15, 0), time(16, 0), False, None),
        ]

        slot_objs = []
        for start_t, end_t, is_brk, label in time_slot_specs:
            slot = TimeSlot.objects.create(
                start_time=start_t,
                end_time=end_t,
                is_break=is_brk,
                break_label=label,
            )
            slot_objs.append(slot)

        # Timetable subjects for B.E. (Final Year)
        tt_csd801 = TimetableSubject.objects.create(
            code="CSD801",
            name="Artificial Intelligence & Deep Learning",
            branch="CSD",
            year="BE",
            teacher=staff_profile,
            classroom="Lab 301 (AI Lab)",
        )
        tt_csd802 = TimetableSubject.objects.create(
            code="CSD802",
            name="Cloud Computing & DevOps",
            branch="CSD",
            year="BE",
            teacher=staff_profile,
            classroom="Lab 302 (Cloud Lab)",
        )
        tt_csd803 = TimetableSubject.objects.create(
            code="CSD803",
            name="Information & Cyber Security",
            branch="CSD",
            year="BE",
            teacher=hod_profile,
            classroom="Room 401",
        )
        tt_csd804 = TimetableSubject.objects.create(
            code="CSD804",
            name="Mobile & Pervasive Computing",
            branch="CSD",
            year="BE",
            teacher=hod_profile,
            classroom="Room 402",
        )

        # Timetable subjects for T.E. (Third Year)
        tt_csd601 = TimetableSubject.objects.create(
            code="CSD601",
            name="Database Management Systems & NoSQL",
            branch="CSD",
            year="TE",
            teacher=staff_profile,
            classroom="Room 305",
        )
        tt_csd602 = TimetableSubject.objects.create(
            code="CSD602",
            name="Computer Networks & Cloud Architecture",
            branch="CSD",
            year="TE",
            teacher=hod_profile,
            classroom="Room 306",
        )

        # Timetable patterns covering ALL 7 days (Monday - Sunday)
        # Includes Sunday seminar so weekend dashboard testing displays active schedule!
        day_patterns_be = {
            "MON": [(0, tt_csd801), (1, tt_csd803), (3, tt_csd802), (4, tt_csd804)],
            "TUE": [(0, tt_csd802), (1, tt_csd804), (3, tt_csd801), (4, tt_csd803)],
            "WED": [(0, tt_csd803), (1, tt_csd801), (3, tt_csd804), (4, tt_csd802)],
            "THU": [(0, tt_csd804), (1, tt_csd802), (3, tt_csd803), (4, tt_csd801)],
            "FRI": [(0, tt_csd801), (1, tt_csd802), (3, tt_csd803), (4, tt_csd804)],
            "SAT": [(0, tt_csd802), (1, tt_csd803), (3, tt_csd801), (4, tt_csd804)],
            "SUN": [(0, tt_csd801), (1, tt_csd802)],  # Weekend AI Seminar & DevOps Hands-on
        }

        day_patterns_te = {
            "MON": [(0, tt_csd601), (1, tt_csd602)],
            "TUE": [(0, tt_csd602), (1, tt_csd601)],
            "WED": [(0, tt_csd601), (1, tt_csd602)],
            "THU": [(0, tt_csd602), (1, tt_csd601)],
            "FRI": [(0, tt_csd601), (1, tt_csd602)],
            "SAT": [(0, tt_csd602), (1, tt_csd601)],
            "SUN": [(0, tt_csd601)],  # Weekend Database Project Lab
        }

        timetable_count = 0

        # Seed B.E. Timetable
        for day_code, lectures in day_patterns_be.items():
            Timetable.objects.create(subject=None, timeslot=slot_objs[2], day=day_code)  # Tea break
            Timetable.objects.create(subject=None, timeslot=slot_objs[5], day=day_code)  # Lunch break
            timetable_count += 2
            for slot_idx, sub in lectures:
                Timetable.objects.create(subject=sub, timeslot=slot_objs[slot_idx], day=day_code)
                timetable_count += 1

        # Seed T.E. Timetable
        for day_code, lectures in day_patterns_te.items():
            for slot_idx, sub in lectures:
                # Add TE lectures at later slots to avoid clash
                target_slot = slot_objs[6 if slot_idx == 0 else 7]
                Timetable.objects.create(subject=sub, timeslot=target_slot, day=day_code)
                timetable_count += 1

        seeded_counts["timetables"] = timetable_count

        # -----------------------------------------------------------------
        # STEP 6: RESULTS APP (MULTI-BATCH EXCEL LEDGERS & RESULT ENTRIES)
        # -----------------------------------------------------------------
        res_dir = os.path.join(settings.MEDIA_ROOT, "result_uploads")
        os.makedirs(res_dir, exist_ok=True)

        # Batch 1 Results Ledger: CSD-2022 (Semester 8)
        sem8_ledger_path = os.path.join(res_dir, "semester_8_csd_results.xlsx")
        sem8_rows = [
            ("T1001", "Suhas Navale", "student1", "CSD-2022", "CSD801", "Artificial Intelligence & Deep Learning", "28/30", "62/70", "90/100", "O", 4.0, 8.85),
            ("T1001", "Suhas Navale", "student1", "CSD-2022", "CSD802", "Cloud Computing & DevOps", "25/30", "58/70", "83/100", "A+", 4.0, 8.85),
            ("T1001", "Suhas Navale", "student1", "CSD-2022", "CSD803", "Information & Cyber Security", "26/30", "60/70", "86/100", "A+", 4.0, 8.85),
            ("T1001", "Suhas Navale", "student1", "CSD-2022", "CSD804", "Mobile & Pervasive Computing", "24/30", "56/70", "80/100", "A", 4.0, 8.85),
            ("T1002", "Aditya Sharma", "student2", "CSD-2022", "CSD801", "Artificial Intelligence & Deep Learning", "29/30", "66/70", "95/100", "O", 4.0, 9.25),
            ("T1002", "Aditya Sharma", "student2", "CSD-2022", "CSD802", "Cloud Computing & DevOps", "28/30", "64/70", "92/100", "O", 4.0, 9.25),
            ("T1002", "Aditya Sharma", "student2", "CSD-2022", "CSD803", "Information & Cyber Security", "27/30", "63/70", "90/100", "O", 4.0, 9.25),
            ("T1002", "Aditya Sharma", "student2", "CSD-2022", "CSD804", "Mobile & Pervasive Computing", "26/30", "62/70", "88/100", "A+", 4.0, 9.25),
            ("T1003", "Neha Patil", "student3", "CSD-2022", "CSD801", "Artificial Intelligence & Deep Learning", "25/30", "55/70", "80/100", "A", 4.0, 8.40),
            ("T1003", "Neha Patil", "student3", "CSD-2022", "CSD802", "Cloud Computing & DevOps", "26/30", "56/70", "82/100", "A+", 4.0, 8.40),
            ("T1003", "Neha Patil", "student3", "CSD-2022", "CSD803", "Information & Cyber Security", "24/30", "54/70", "78/100", "A", 4.0, 8.40),
            ("T1003", "Neha Patil", "student3", "CSD-2022", "CSD804", "Mobile & Pervasive Computing", "25/30", "53/70", "78/100", "A", 4.0, 8.40),
            ("T1004", "Rohan Deshmukh", "student4", "CSD-2022", "CSD801", "Artificial Intelligence & Deep Learning", "22/30", "48/70", "70/100", "B+", 4.0, 7.60),
            ("T1004", "Rohan Deshmukh", "student4", "CSD-2022", "CSD802", "Cloud Computing & DevOps", "23/30", "50/70", "73/100", "B+", 4.0, 7.60),
            ("T1004", "Rohan Deshmukh", "student4", "CSD-2022", "CSD803", "Information & Cyber Security", "21/30", "46/70", "67/100", "B", 4.0, 7.60),
            ("T1004", "Rohan Deshmukh", "student4", "CSD-2022", "CSD804", "Mobile & Pervasive Computing", "12/30", "18/70", "30/100", "F", 4.0, 7.60),
        ]
        _create_excel_ledger(sem8_ledger_path, "CSD-2022", sem8_rows)

        res_upload_2022 = ResultUpload.objects.create(
            file="result_uploads/semester_8_csd_results.xlsx",
            uploaded_by=staff_user,
            batch_id="CSD-2022",
        )

        user_lookup = {
            "student1": student_user,
            "student2": cohort_profiles[0].user,
            "student3": cohort_profiles[1].user,
            "student4": cohort_profiles[2].user,
        }

        total_results = 0
        for seat, s_name, u_str, b_id, c_code, c_name, i_m, e_m, t_m, grd, crd, sgpa in sem8_rows:
            ResultEntry.objects.create(
                upload=res_upload_2022,
                batch_id=b_id,
                student=user_lookup[u_str],
                subject_code=c_code,
                subject_name=c_name,
                internal_marks=i_m,
                external_marks=e_m,
                total_marks=t_m,
                grade=grd,
                subject_credits=crd,
                sgpa=sgpa,
            )
            total_results += 1

        # Batch 2 Results Ledger: CSD-2023 (Semester 6) for multi-batch analytics
        sem6_ledger_path = os.path.join(res_dir, "semester_6_csd_results.xlsx")
        sem6_rows = [
            ("T2001", "Priya Joshi", "student5", "CSD-2023", "CSD601", "Database Management Systems & NoSQL", "27/30", "60/70", "87/100", "A+", 4.0, 8.75),
            ("T2001", "Priya Joshi", "student5", "CSD-2023", "CSD602", "Computer Networks & Cloud Architecture", "26/30", "58/70", "84/100", "A+", 4.0, 8.75),
            ("T2002", "Amit Kulkarni", "student6", "CSD-2023", "CSD601", "Database Management Systems & NoSQL", "28/30", "65/70", "93/100", "O", 4.0, 9.00),
            ("T2002", "Amit Kulkarni", "student6", "CSD-2023", "CSD602", "Computer Networks & Cloud Architecture", "27/30", "61/70", "88/100", "A+", 4.0, 9.00),
            ("T2003", "Anjali Shinde", "student7", "CSD-2023", "CSD601", "Database Management Systems & NoSQL", "24/30", "52/70", "76/100", "A", 4.0, 8.10),
            ("T2003", "Anjali Shinde", "student7", "CSD-2023", "CSD602", "Computer Networks & Cloud Architecture", "23/30", "50/70", "73/100", "B+", 4.0, 8.10),
        ]
        _create_excel_ledger(sem6_ledger_path, "CSD-2023", sem6_rows)

        res_upload_2023 = ResultUpload.objects.create(
            file="result_uploads/semester_6_csd_results.xlsx",
            uploaded_by=staff_user,
            batch_id="CSD-2023",
        )

        user_lookup_te = {
            "student5": cohort_profiles[3].user,
            "student6": cohort_profiles[4].user,
            "student7": cohort_profiles[5].user,
        }

        for seat, s_name, u_str, b_id, c_code, c_name, i_m, e_m, t_m, grd, crd, sgpa in sem6_rows:
            ResultEntry.objects.create(
                upload=res_upload_2023,
                batch_id=b_id,
                student=user_lookup_te[u_str],
                subject_code=c_code,
                subject_name=c_name,
                internal_marks=i_m,
                external_marks=e_m,
                total_marks=t_m,
                grade=grd,
                subject_credits=crd,
                sgpa=sgpa,
            )
            total_results += 1

        # Also store sample ledgers for interactive testing by visitors in UI
        sample_dir = os.path.join(settings.MEDIA_ROOT, "sample_ledgers")
        os.makedirs(sample_dir, exist_ok=True)
        _create_excel_ledger(os.path.join(sample_dir, "sample_result_ledger.xlsx"), "TEST", sem8_rows)

        seeded_counts["result_entries"] = total_results

        # -----------------------------------------------------------------
        # STEP 7: NOTICEBOARD & DOWNLOADABLE STUDY MATERIALS
        # -----------------------------------------------------------------
        notices_dir = os.path.join(settings.MEDIA_ROOT, "notice_files")
        os.makedirs(notices_dir, exist_ok=True)

        notices_data = [
            {
                "title": "Campus Placement Drive 2026: Schedule & Guidelines",
                "brief_message": (
                    "Annual campus placement drive for final year (B.E.) Computer Science & Design students. "
                    "Participating recruiters include Microsoft, Google, TCS Digital, and Persistent Systems. "
                    "Students must report in formal attire with updated resumes and hall passes at 09:30 AM."
                ),
                "is_public": True,
                "uploaded_by": "Training & Placement Cell",
                "created_at": timezone.now() - timedelta(hours=6),
                "links": ["https://neocampus.demo.edu/placements/2026-drive-schedule"],
                "file_name": "placement_drive_schedule_2026.pdf",
            },
            {
                "title": "NeoNova 2026 - National Technical Symposium & Hackathon",
                "brief_message": (
                    "Registrations are officially open for the Annual Technical Symposium NeoNova 2026! "
                    "Tracks include Generative AI, Cloud Infrastructure, and Cyber Security with cash prizes up to INR 1.5 Lakhs. "
                    "Open to both B.E. and T.E. engineering departments."
                ),
                "is_public": True,
                "uploaded_by": "Dean of Student Affairs",
                "created_at": timezone.now() - timedelta(days=1, hours=3),
                "links": ["https://neonova.demo.edu/hackathon-register"],
                "file_name": "neonova_2026_hackathon_guidelines.pdf",
            },
            {
                "title": "Unit 4 & 5 Study Notes: Cloud Computing & DevOps Architecture",
                "brief_message": (
                    "Comprehensive study materials and lab guides covering Docker containerization, "
                    "Kubernetes pod scheduling, and Terraform Infrastructure as Code. Recommended reading for Semester End Exam."
                ),
                "subject_name": "Cloud Computing & DevOps",
                "subject_code": "CSD802",
                "batch_id": "CSD-2022",
                "is_public": False,
                "uploaded_by": "Prof. Pooja Pawar",
                "created_at": timezone.now() - timedelta(days=2),
                "links": ["https://github.com/neocampus/devops-kubernetes-lab"],
                "file_name": "devops_unit_4_5_architecture_notes.pdf",
            },
            {
                "title": "Question Bank & Assignment 3: Neural Networks with PyTorch",
                "brief_message": (
                    "Assignment 3 is due this Friday by 5:00 PM. Implement a multi-layer convolutional neural network "
                    "on CIFAR-10. Submit your Jupyter notebook with training loss curves and evaluation metrics."
                ),
                "subject_name": "Artificial Intelligence & Deep Learning",
                "subject_code": "CSD801",
                "batch_id": "CSD-2022",
                "is_public": False,
                "uploaded_by": "Prof. Pooja Pawar",
                "created_at": timezone.now() - timedelta(days=2, hours=12),
                "links": ["https://drive.google.com/neocampus-ai-assignment"],
                "file_name": "csd801_assignment_3_question_bank.pdf",
            },
            {
                "title": "Cyber Security Lab Manual: Cryptography & Zero-Trust Models",
                "brief_message": (
                    "Complete practical manual on public-key cryptography, asymmetric signatures, and perimeterless network defenses. "
                    "Includes Wireshark traffic inspection walkthroughs and Snort intrusion detection setups."
                ),
                "subject_name": "Information & Cyber Security",
                "subject_code": "CSD803",
                "batch_id": "CSD-2022",
                "is_public": False,
                "uploaded_by": "Dr. Rahul Tambe",
                "created_at": timezone.now() - timedelta(days=3),
                "links": ["https://csrc.nist.gov/publications/detail/sp/800-207/final"],
                "file_name": "csd803_cyber_security_lab_manual.pdf",
            },
            {
                "title": "Final Year Semester End Examination (SEE) Schedule & Hall Tickets",
                "brief_message": (
                    "The timetable for Semester 8 theory and practical examinations has been released. "
                    "Eligible students can download hall tickets directly from the student examination portal. Minimum 75% attendance required."
                ),
                "is_public": True,
                "uploaded_by": "Controller of Examinations",
                "created_at": timezone.now() - timedelta(days=4),
                "links": ["https://neocampus.demo.edu/examination/time-table-see-2026"],
                "file_name": "see_exam_timetable_admit_card_notice.pdf",
            },
        ]

        notice_count = 0
        for n_item in notices_data:
            notice = Notice.objects.create(
                title=n_item["title"],
                brief_message=n_item["brief_message"],
                subject_name=n_item.get("subject_name"),
                subject_code=n_item.get("subject_code"),
                batch_id=n_item.get("batch_id"),
                is_public=n_item.get("is_public", True),
                uploaded_by=n_item["uploaded_by"],
                created_at=n_item["created_at"],
            )

            for l_url in n_item.get("links", []):
                NoticeLink.objects.create(notice=notice, url=l_url)

            # Generate real PDF on disk and attach NoticeFile
            f_name = n_item["file_name"]
            f_disk_path = os.path.join(notices_dir, f_name)
            _create_minimal_pdf(f_disk_path, n_item["title"])
            NoticeFile.objects.create(
                notice=notice,
                file=f"notice_files/{f_name}",
            )
            notice_count += 1

        seeded_counts["notices"] = notice_count

        # -----------------------------------------------------------------
        # STEP 8: CHATBOT KNOWLEDGE DOCUMENTS & CHUNKS (RAG PIPELINE)
        # -----------------------------------------------------------------
        doc_dir = os.path.join(settings.MEDIA_ROOT, "chatbot", "documents")
        os.makedirs(doc_dir, exist_ok=True)

        from django.db.models.signals import post_save
        from chatbot.signals import auto_create_chunks

        # Disconnect auto_create_chunks signal so seeding runs with deterministic vector representation
        post_save.disconnect(auto_create_chunks, sender=UploadedDocument)
        try:
            # Document 1: Academic Regulations & Campus Guide
            doc1_path = os.path.join(doc_dir, "academic_handbook_2026.pdf")
            _create_minimal_pdf(doc1_path, "NeoCampus Academic Handbook 2026")
            doc1 = UploadedDocument.objects.create(
                file="chatbot/documents/academic_handbook_2026.pdf",
                file_id="DOC-ACADEMICS-2026",
                context="NeoCampus Academic Regulations & Campus Guide",
                uploaded_by=staff_user,
            )

            # Document 2: CSD Department Curriculum
            doc2_path = os.path.join(doc_dir, "csd_curriculum_guide_2026.pdf")
            _create_minimal_pdf(doc2_path, "CSD Curriculum Guide 2026")
            doc2 = UploadedDocument.objects.create(
                file="chatbot/documents/csd_curriculum_guide_2026.pdf",
                file_id="DOC-CURRICULUM-CSD",
                context="Computer Science & Design Department Curriculum Overview",
                uploaded_by=hod_user,
            )

            # Document 3: Campus Placements & Laboratory Facilities
            doc3_path = os.path.join(doc_dir, "campus_placements_and_facilities_2026.pdf")
            _create_minimal_pdf(doc3_path, "NeoCampus Placements & Facilities 2026")
            doc3 = UploadedDocument.objects.create(
                file="chatbot/documents/campus_placements_and_facilities_2026.pdf",
                file_id="DOC-PLACEMENTS-2026",
                context="Campus Placement Statistics & Laboratory Infrastructure",
                uploaded_by=staff_user,
            )
        finally:
            post_save.connect(auto_create_chunks, sender=UploadedDocument)

        knowledge_chunks = [
            # Document 1 Chunks (Academics & Attendance)
            (
                doc1, 1, "NeoCampus Academic Regulations & Campus Guide",
                "Grading and Evaluation System: NeoCampus follows the standard 10-point credit evaluation system. "
                "Grades awarded are: O (Outstanding, 90-100 marks, Grade Points: 10), A+ (Excellent, 80-89 marks, Grade Points: 9), "
                "A (Very Good, 70-79 marks, Grade Points: 8), B+ (Good, 60-69 marks, Grade Points: 7), B (Above Average, 55-59 marks, Grade Points: 6), "
                "C (Average, 50-54 marks, Grade Points: 5), P (Pass, 40-49 marks, Grade Points: 4), and F (Fail, <40 marks, Grade Points: 0). "
                "SGPA is computed as sum of (Course Credits * Grade Points) divided by total credits registered."
            ),
            (
                doc1, 2, "NeoCampus Academic Regulations & Campus Guide",
                "Attendance Policy and Defaulter Norms: Every enrolled student must maintain a minimum attendance of 75% in all theory lectures "
                "and practical sessions. Students having attendance between 65% and 74% due to medical conditions must submit certified proof to the HOD. "
                "Students with attendance below 65% will be detained, classified as defaulters, and denied hall tickets for final semester exams."
            ),
            (
                doc1, 3, "NeoCampus Academic Regulations & Campus Guide",
                "Examination Guidelines and Hall Tickets: Semester end examinations (SEE) consist of 70 marks theory paper and 30 marks in-semester continuous evaluation (ISE). "
                "Students with cleared dues and above 75% attendance can generate their digital admit cards with cryptographic QR verification from the student dashboard."
            ),
            # Document 2 Chunks (Curriculum)
            (
                doc2, 1, "Computer Science & Design Department Curriculum Overview",
                "Computer Science & Design (CSD) Curriculum Overview: Semester 8 features four advanced specializations: "
                "1) Artificial Intelligence & Deep Learning (CSD801) covering heuristic search, deep neural networks, transformers, and computer vision; "
                "2) Cloud Computing & DevOps (CSD802) covering virtualization, containers, Kubernetes orchestration, and continuous integration; "
                "3) Information & Cyber Security (CSD803) covering cryptographic primitives, zero-trust network models, and penetration testing; "
                "4) Mobile & Pervasive Computing (CSD804) covering ubiquitous application architecture, Android/iOS runtime frameworks, and edge computing."
            ),
            (
                doc2, 2, "Computer Science & Design Department Curriculum Overview",
                "Artificial Intelligence & Deep Learning (CSD801) Laboratory Outcomes: Students implement convolutional neural networks (CNNs), "
                "recurrent neural networks (RNNs), and attention mechanisms using PyTorch and Hugging Face Transformers. Lab evaluations include model training, "
                "hyperparameter tuning on GPU clusters, and benchmark reporting."
            ),
            (
                doc2, 3, "Computer Science & Design Department Curriculum Overview",
                "Cloud Computing & DevOps (CSD802) Practicals: Hands-on mastery of Docker multi-stage container builds, Kubernetes pod scheduling, "
                "Service meshes with Istio, and CI/CD automation pipelines deployed to AWS and Render cloud instances."
            ),
            # Document 3 Chunks (Placements, Facilities & Hardware Auth)
            (
                doc3, 1, "Campus Placement Statistics & Laboratory Infrastructure",
                "Campus Infrastructure & Laboratory Access: Academic labs in Block C, including the High-Performance Computing Lab (Lab 301) "
                "and the Cloud & DevOps Lab (Lab 302), are open Monday through Saturday from 08:00 AM to 08:00 PM. "
                "The Central Digital Library provides high-speed Wi-Fi, IEEE Xplore access, and 24/7 digital repository privileges."
            ),
            (
                doc3, 2, "Campus Placement Statistics & Laboratory Infrastructure",
                "Campus Placement Records: Over 92% of final year students secure placements before graduation. "
                "Top recruiters include Microsoft, Google, TCS Digital, Persistent Systems, and Cognizant. Highest CTC offered is INR 42 LPA, "
                "with an average cohort package of INR 9.8 LPA."
            ),
            (
                doc3, 3, "Campus Placement Statistics & Laboratory Infrastructure",
                "Hardware USB Key Authentication: NeoCampus provides hardware-grade physical security for faculty and student terminals. "
                "Authorized users may register a cryptographic USB hardware token using Ed25519 asymmetric key pairs for instantaneous zero-password login "
                "without transmitting plaintext passwords over network connections."
            ),
        ]

        dummy_embedding = pickle.dumps([0.05] * 384)

        for d_obj, c_idx, c_ctx, c_content in knowledge_chunks:
            Chunk.objects.create(
                document=d_obj,
                chunk_index=c_idx,
                content=c_content,
                context=c_ctx,
                embedding=dummy_embedding,
            )

        seeded_counts["chatbot_chunks"] = len(knowledge_chunks)

        # -----------------------------------------------------------------
        # STEP 9: ACCOUNTS (STUDENT BULK UPLOAD AUDIT LOG)
        # -----------------------------------------------------------------
        StudentUpload.objects.create()
        seeded_counts["student_uploads"] = 1

        # -----------------------------------------------------------------
        # STEP 10: RECORD LOG IN DemoResetLog
        # -----------------------------------------------------------------
        total_seeded = sum(seeded_counts.values())
        DemoResetLog.objects.create(
            status="SUCCESS",
            triggered_by=triggered_by,
            records_seeded=total_seeded,
            details=json.dumps(seeded_counts, indent=2),
        )

        logger.info(f"Demo database reset and seed successfully completed! Seeded {total_seeded} records: {seeded_counts}")
        return {
            "status": "SUCCESS",
            "triggered_by": triggered_by,
            "records_seeded": total_seeded,
            "breakdown": seeded_counts,
            "reset_at": timezone.now().isoformat(),
        }
