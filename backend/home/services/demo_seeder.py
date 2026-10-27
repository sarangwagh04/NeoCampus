# home/services/demo_seeder.py
import json
import logging
from datetime import date, time, timedelta
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


def reset_and_seed_demo_data(triggered_by: str = "auto") -> dict:
    """
    Cleans all ephemeral data created by users during demo runs and seeds
    a rich, deterministic, production-grade baseline dataset for NeoCampus.

    This operation runs inside an atomic transaction:
    - If any validation or database constraint fails, everything rolls back.
    - Preserves core administration records while resetting demo users & academics.
    """
    with transaction.atomic():
        logger.info(f"Initiating demo database reset and seed (triggered by {triggered_by})...")

        # -----------------------------------------------------------------
        # STEP 1: RESOLVE / SYNC CANONICAL DEMO USERS
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

        # Clean dynamic test users created during previous demos
        preserved_user_ids = {student_user.id, staff_user.id, hod_user.id, admin_user.id}
        if sarang_user:
            preserved_user_ids.add(sarang_user.id)

        # Also preserve cohort student users
        cohort_usernames = ["student2", "student3", "student4"]
        for cu in User.objects.filter(username__in=cohort_usernames):
            preserved_user_ids.add(cu.id)

        User.objects.exclude(id__in=preserved_user_ids).delete()

        seeded_counts = {}

        # -----------------------------------------------------------------
        # STEP 3: PROFILES FOR CANONICAL USERS
        # -----------------------------------------------------------------
        student_profile, _ = StudentProfile.objects.update_or_create(
            user=student_user,
            defaults={
                "first_name": "Suhas",
                "middle_name": "K.",
                "last_name": "Navale",
                "gender": "Male",
                "dob": date(2003, 5, 15),
                "branch": "CSD",
                "semester": "8",
                "admission_year": "2022",
                "role": "Student",
                "batch_id": "CSD-2022",
                "mobile_number": "8180849725",
                "address": "Campus Hostel Block B, Room 204",
                "parents_name": "Kiran Navale",
                "parents_mobile_number": "9822012345",
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

        # Cohort Students for ranking and batch analytics
        cohort_data = [
            ("student2", "Aditya", "Sharma", "aditya.sharma@neocampus.com", "8180849731"),
            ("student3", "Neha", "Patil", "neha.patil@neocampus.com", "8180849732"),
            ("student4", "Rohan", "Deshmukh", "rohan.deshmukh@neocampus.com", "8180849733"),
        ]
        cohort_profiles = []
        for u_name, f_name, l_name, email, phone in cohort_data:
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
                    "gender": "Female" if f_name == "Neha" else "Male",
                    "dob": date(2003, 7, 21),
                    "branch": "CSD",
                    "semester": "8",
                    "admission_year": "2022",
                    "role": "Student",
                    "batch_id": "CSD-2022",
                    "mobile_number": phone,
                    "address": "Campus Hostel Block A",
                    "parents_name": f"{f_name}'s Parent",
                    "parents_mobile_number": "9822099999",
                },
            )
            cohort_profiles.append(c_prof)

        seeded_counts["users"] = 4 + len(cohort_data)

        # -----------------------------------------------------------------
        # STEP 4: ATTENDANCE APP (SUBJECTS, ASSIGNMENTS, PLANS, RECORDS)
        # -----------------------------------------------------------------
        subjects_spec = [
            ("CSD801", "Artificial Intelligence & Deep Learning", staff_profile),
            ("CSD802", "Cloud Computing & DevOps", staff_profile),
            ("CSD803", "Information & Cyber Security", hod_profile),
            ("CSD804", "Mobile & Pervasive Computing", hod_profile),
        ]

        today = timezone.now().date()
        total_attendance_records = 0
        total_teaching_plans = 0

        for code, name, teacher in subjects_spec:
            att_subject = AttendanceSubject.objects.create(
                code=code,
                name=name,
                branch="CSD",
                is_active=True,
            )

            assignment = SubjectAssignment.objects.create(
                subject=att_subject,
                staff=teacher,
                batch_id="CSD-2022",
                semester=8,
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

            # Distribute 12 lectures: 8 past, 1 today, 3 future
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
                    # student1: ~85% attendance (e.g. absent on lecture 4)
                    is_present_student1 = (idx != 4)
                    Attendance.objects.create(
                        teaching_plan=plan,
                        student=student_profile,
                        is_present=is_present_student1,
                    )
                    total_attendance_records += 1

                    # Cohort students attendance
                    for c_idx, c_prof in enumerate(cohort_profiles, start=1):
                        is_c_present = not (idx % (c_idx + 3) == 0)
                        Attendance.objects.create(
                            teaching_plan=plan,
                            student=c_prof,
                            is_present=is_c_present,
                        )
                        total_attendance_records += 1

        seeded_counts["attendance_subjects"] = len(subjects_spec)
        seeded_counts["teaching_plans"] = total_teaching_plans
        seeded_counts["attendance_records"] = total_attendance_records

        # -----------------------------------------------------------------
        # STEP 5: TIMETABLES APP (TIME SLOTS, SUBJECTS, SCHEDULE)
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

        # Timetable subjects
        tt_sub_csd801 = TimetableSubject.objects.create(
            code="CSD801",
            name="Artificial Intelligence & Deep Learning",
            branch="CSD",
            year="BE",
            teacher=staff_profile,
            classroom="Lab 301 (AI Lab)",
        )
        tt_sub_csd802 = TimetableSubject.objects.create(
            code="CSD802",
            name="Cloud Computing & DevOps",
            branch="CSD",
            year="BE",
            teacher=staff_profile,
            classroom="Lab 302 (Cloud Lab)",
        )
        tt_sub_csd803 = TimetableSubject.objects.create(
            code="CSD803",
            name="Information & Cyber Security",
            branch="CSD",
            year="BE",
            teacher=hod_profile,
            classroom="Room 401",
        )
        tt_sub_csd804 = TimetableSubject.objects.create(
            code="CSD804",
            name="Mobile & Pervasive Computing",
            branch="CSD",
            year="BE",
            teacher=hod_profile,
            classroom="Room 402",
        )

        # Weekly schedule Monday to Saturday ensuring every day has lectures
        day_patterns = {
            "MON": [(0, tt_sub_csd801), (1, tt_sub_csd803), (3, tt_sub_csd802), (4, tt_sub_csd804)],
            "TUE": [(0, tt_sub_csd802), (1, tt_sub_csd804), (3, tt_sub_csd801), (4, tt_sub_csd803)],
            "WED": [(0, tt_sub_csd803), (1, tt_sub_csd801), (3, tt_sub_csd804), (4, tt_sub_csd802)],
            "THU": [(0, tt_sub_csd804), (1, tt_sub_csd802), (3, tt_sub_csd803), (4, tt_sub_csd801)],
            "FRI": [(0, tt_sub_csd801), (1, tt_sub_csd802), (3, tt_sub_csd803), (4, tt_sub_csd804)],
            "SAT": [(0, tt_sub_csd802), (1, tt_sub_csd803), (3, tt_sub_csd801), (4, tt_sub_csd804)],
        }

        timetable_count = 0
        for day_code, lectures in day_patterns.items():
            # Add breaks first
            Timetable.objects.create(
                subject=None,
                timeslot=slot_objs[2],  # Tea break
                day=day_code,
            )
            Timetable.objects.create(
                subject=None,
                timeslot=slot_objs[5],  # Lunch break
                day=day_code,
            )
            timetable_count += 2

            # Add lectures
            for slot_idx, sub in lectures:
                Timetable.objects.create(
                    subject=sub,
                    timeslot=slot_objs[slot_idx],
                    day=day_code,
                )
                timetable_count += 1

        seeded_counts["timetables"] = timetable_count

        import os
        from django.conf import settings

        res_dir = os.path.join(settings.MEDIA_ROOT, "result_uploads")
        os.makedirs(res_dir, exist_ok=True)
        results_file_path = os.path.join(res_dir, "semester_8_csd_results.xlsx")
        if not os.path.exists(results_file_path):
            with open(results_file_path, "w") as f:
                f.write("NeoCampus Semester 8 Results Ledger\n")

        result_upload = ResultUpload.objects.create(
            file="result_uploads/semester_8_csd_results.xlsx",
            uploaded_by=staff_user,
            batch_id="CSD-2022",
        )

        student1_marks = [
            ("CSD801", "Artificial Intelligence & Deep Learning", "28/30", "62/70", "90/100", "O", 4.0, 8.85),
            ("CSD802", "Cloud Computing & DevOps", "25/30", "58/70", "83/100", "A+", 4.0, 8.85),
            ("CSD803", "Information & Cyber Security", "26/30", "60/70", "86/100", "A+", 4.0, 8.85),
            ("CSD804", "Mobile & Pervasive Computing", "24/30", "56/70", "80/100", "A", 4.0, 8.85),
        ]
        for c_code, c_name, i_m, e_m, t_m, grd, crd, sgpa in student1_marks:
            ResultEntry.objects.create(
                upload=result_upload,
                batch_id="CSD-2022",
                student=student_user,
                subject_code=c_code,
                subject_name=c_name,
                internal_marks=i_m,
                external_marks=e_m,
                total_marks=t_m,
                grade=grd,
                subject_credits=crd,
                sgpa=sgpa,
            )

        peer_marks = [
            (cohort_profiles[0].user, [
                ("CSD801", "Artificial Intelligence & Deep Learning", "29/30", "66/70", "95/100", "O", 4.0, 9.25),
                ("CSD802", "Cloud Computing & DevOps", "28/30", "64/70", "92/100", "O", 4.0, 9.25),
                ("CSD803", "Information & Cyber Security", "27/30", "63/70", "90/100", "O", 4.0, 9.25),
                ("CSD804", "Mobile & Pervasive Computing", "26/30", "62/70", "88/100", "A+", 4.0, 9.25),
            ]),
            (cohort_profiles[1].user, [
                ("CSD801", "Artificial Intelligence & Deep Learning", "25/30", "55/70", "80/100", "A", 4.0, 8.40),
                ("CSD802", "Cloud Computing & DevOps", "26/30", "56/70", "82/100", "A+", 4.0, 8.40),
                ("CSD803", "Information & Cyber Security", "24/30", "54/70", "78/100", "A", 4.0, 8.40),
                ("CSD804", "Mobile & Pervasive Computing", "25/30", "53/70", "78/100", "A", 4.0, 8.40),
            ]),
            (cohort_profiles[2].user, [
                ("CSD801", "Artificial Intelligence & Deep Learning", "22/30", "48/70", "70/100", "B+", 4.0, 7.60),
                ("CSD802", "Cloud Computing & DevOps", "23/30", "50/70", "73/100", "B+", 4.0, 7.60),
                ("CSD803", "Information & Cyber Security", "21/30", "46/70", "67/100", "B", 4.0, 7.60),
                ("CSD804", "Mobile & Pervasive Computing", "12/30", "18/70", "30/100", "F", 4.0, 7.60),
            ]),
        ]

        total_results = len(student1_marks)
        for u, marks_list in peer_marks:
            for c_code, c_name, i_m, e_m, t_m, grd, crd, sgpa in marks_list:
                ResultEntry.objects.create(
                    upload=result_upload,
                    batch_id="CSD-2022",
                    student=u,
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

        seeded_counts["result_entries"] = total_results

        # -----------------------------------------------------------------
        # STEP 7: NOTICEBOARD & RECENT MATERIALS
        # -----------------------------------------------------------------
        n1 = Notice.objects.create(
            title="Campus Placement Drive 2026: Schedule & Guidelines",
            brief_message=(
                "Annual placement drive for final year (B.E.) Computer Science & Design students. "
                "Recruiters include Microsoft, Google, TCS Digital, and Persistent Systems. "
                "Students must report in formal attire with updated resumes at 09:30 AM."
            ),
            is_public=True,
            uploaded_by="Training & Placement Cell",
            created_at=timezone.now() - timedelta(hours=8),
        )
        NoticeLink.objects.create(
            notice=n1,
            url="https://neocampus.demo.edu/placements/2026-drive-schedule",
        )

        n2 = Notice.objects.create(
            title="NeoNova 2026 - National Technical Symposium & Hackathon",
            brief_message=(
                "Registrations are officially open for the Annual Technical Symposium NeoNova 2026! "
                "Tracks include Generative AI, Cloud Infrastructure, and Cyber Security with cash prizes up to INR 1.5 Lakhs."
            ),
            is_public=True,
            uploaded_by="Dean of Student Affairs",
            created_at=timezone.now() - timedelta(days=1, hours=4),
        )
        NoticeLink.objects.create(
            notice=n2,
            url="https://neonova.demo.edu/hackathon-register",
        )

        n3 = Notice.objects.create(
            title="Unit 4 & 5 Study Notes: Cloud Computing & DevOps Architecture",
            brief_message=(
                "Comprehensive study materials and lab guides covering Docker containerization, "
                "Kubernetes pod scheduling, and Terraform Infrastructure as Code. Recommended reading for Semester End Exam."
            ),
            subject_name="Cloud Computing & DevOps",
            subject_code="CSD802",
            batch_id="CSD-2022",
            is_public=False,
            uploaded_by="Prof. Pooja Pawar",
            created_at=timezone.now() - timedelta(days=2),
        )
        NoticeLink.objects.create(
            notice=n3,
            url="https://drive.google.com/neocampus-cloud-notes",
        )

        n4 = Notice.objects.create(
            title="Question Bank & Assignment 3: Neural Networks with PyTorch",
            brief_message=(
                "Assignment 3 is due this Friday by 5:00 PM. Implement a multi-layer convolutional neural network "
                "on CIFAR-10. Submit your Jupyter notebook with training loss curves and evaluation metrics."
            ),
            subject_name="Artificial Intelligence & Deep Learning",
            subject_code="CSD801",
            batch_id="CSD-2022",
            is_public=False,
            uploaded_by="Prof. Pooja Pawar",
            created_at=timezone.now() - timedelta(days=2, hours=12),
        )
        NoticeLink.objects.create(
            notice=n4,
            url="https://drive.google.com/neocampus-ai-assignment",
        )

        seeded_counts["notices"] = 4

        # -----------------------------------------------------------------
        # STEP 8: CHATBOT KNOWLEDGE DOCUMENTS & CHUNKS (RAG PIPELINE)
        # -----------------------------------------------------------------
        import os
        from django.conf import settings

        doc_dir = os.path.join(settings.MEDIA_ROOT, "chatbot", "documents")
        os.makedirs(doc_dir, exist_ok=True)
        handbook_pdf_path = os.path.join(doc_dir, "academic_handbook_2026.pdf")
        if not os.path.exists(handbook_pdf_path):
            with open(handbook_pdf_path, "wb") as f:
                f.write(
                    b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n"
                )

        from django.db.models.signals import post_save
        from chatbot.signals import auto_create_chunks

        post_save.disconnect(auto_create_chunks, sender=UploadedDocument)
        try:
            doc = UploadedDocument.objects.create(
                file="chatbot/documents/academic_handbook_2026.pdf",
                file_id="DOC-ACADEMICS-2026",
                context="NeoCampus Academic Regulations & Campus Guide",
                uploaded_by=staff_user,
            )
        finally:
            post_save.connect(auto_create_chunks, sender=UploadedDocument)

        knowledge_chunks = [
            (
                "Grading and Evaluation System: NeoCampus follows the standard 10-point credit evaluation system. "
                "Grades awarded are: O (Outstanding, 90-100 marks, Grade Points: 10), A+ (Excellent, 80-89 marks, Grade Points: 9), "
                "A (Very Good, 70-79 marks, Grade Points: 8), B+ (Good, 60-69 marks, Grade Points: 7), B (Above Average, 55-59 marks, Grade Points: 6), "
                "C (Average, 50-54 marks, Grade Points: 5), P (Pass, 40-49 marks, Grade Points: 4), and F (Fail, <40 marks, Grade Points: 0). "
                "SGPA is computed as sum of (Course Credits * Grade Points) divided by total credits registered."
            ),
            (
                "Attendance Policy and Defaulter Norms: Every enrolled student must maintain a minimum attendance of 75% in all theory lectures "
                "and practical sessions. Students having attendance between 65% and 74% due to medical conditions must submit certified proof to the HOD. "
                "Students with attendance below 65% will be detained and classified as defaulters."
            ),
            (
                "Computer Science & Design (CSD) Curriculum Overview: Semester 8 features four advanced specializations: "
                "1) Artificial Intelligence & Deep Learning (CSD801) covering heuristic search, deep neural networks, transformers, and computer vision; "
                "2) Cloud Computing & DevOps (CSD802) covering virtualization, containers, Kubernetes orchestration, and continuous integration; "
                "3) Information & Cyber Security (CSD803) covering cryptographic primitives, zero-trust network models, and penetration testing; "
                "4) Mobile & Pervasive Computing (CSD804) covering ubiquitous application architecture, Android/iOS runtime frameworks, and edge computing."
            ),
            (
                "Campus Infrastructure & Laboratory Access: Academic labs in Block C, including the High-Performance Computing Lab (Lab 301) "
                "and the Cloud & DevOps Lab (Lab 302), are open Monday through Saturday from 08:00 AM to 08:00 PM. "
                "The Central Digital Library provides high-speed Wi-Fi, IEEE Xplore access, and 24/7 digital repository privileges."
            ),
            (
                "Hardware USB Key Authentication: NeoCampus provides hardware-grade physical security for faculty and student terminals. "
                "Authorized users may register a cryptographic USB hardware token using Ed25519 asymmetric key pairs for instantaneous zero-password login."
            ),
        ]

        import pickle
        dummy_embedding = pickle.dumps([0.05] * 384)

        for c_idx, content in enumerate(knowledge_chunks, start=1):
            Chunk.objects.create(
                document=doc,
                chunk_index=c_idx,
                content=content,
                context="NeoCampus Academic Regulations & Campus Guide",
                embedding=dummy_embedding,
            )

        seeded_counts["chatbot_chunks"] = len(knowledge_chunks)

        # -----------------------------------------------------------------
        # STEP 9: RECORD LOG IN DemoResetLog
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
