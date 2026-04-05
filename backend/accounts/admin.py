# accounts/admin.py
from django.contrib import admin, messages
from django import forms
from django.template.response import TemplateResponse
from django.urls import path
from django.shortcuts import redirect
from django.contrib.auth.models import User
from django.db import models
import pandas as pd
from datetime import datetime
from django.http import HttpResponse

from profiles.models import StudentProfile, StaffProfile  # import from your profiles app


# ---------- Excel Upload Form ----------
class ExcelUploadForm(forms.Form):
    excel_file = forms.FileField(label="Select Excel file (.xlsx)")


# ---------- Helper Functions ----------
def parse_dob(dob):
    """Convert DOB to DDMM format safely."""
    if pd.isna(dob) or not dob:
        return ""
    if isinstance(dob, (datetime, pd.Timestamp)):
        return f"{dob.day:02d}{dob.month:02d}"
    s = str(dob).strip()
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y"):
        try:
            d = datetime.strptime(s, fmt)
            return f"{d.day:02d}{d.month:02d}"
        except Exception:
            continue
    return ""


def generate_password(first_name, dob):
    """Generate password like Rutu0402."""
    name_part = str(first_name or "").capitalize()[:4]
    ddmm = parse_dob(dob)
    return f"{name_part}{ddmm}" if ddmm else name_part


# ---------- STUDENT LOGIC ----------
def assign_branchwise_rolls(df):
    """Assign roll numbers (3 digits) branch-wise."""
    df = df.copy()
    df["branch"] = df["branch"].astype(str).str.upper()

    for branch in df["branch"].unique():
        mask = df["branch"] == branch
        branch_df = df[mask]
        df.loc[mask, "roll_number"] = range(1, len(branch_df) + 1)
    return df


def generate_student_username(branch, admission_year, roll_no):
    """Generate username like CSD2025001."""
    branch = str(branch or "").upper()[:3]
    year = str(admission_year)
    roll = str(int(roll_no)).zfill(3)[-3:]
    return f"{branch}{year}{roll}"


def create_students_from_excel(df):
    """Create or update student users + StudentProfile."""
    df.columns = [c.strip().lower() for c in df.columns]
    df = assign_branchwise_rolls(df)

    created, updated, errors = 0, 0, []

    for idx, row in df.iterrows():
        try:
            first_name = str(row.get("first_name", "")).strip()
            middle_name = str(row.get("middle_name", "")).strip()
            last_name = str(row.get("last_name", "")).strip()
            email = str(row.get("email", "")).strip()
            branch = row.get("branch", "")
            semester = row.get("semester", "")
            admission_year = row.get("admission_year", "")
            dob = row.get("dob", "")
            gender = row.get("gender", "")
            profile_picture = row.get("profile_picture", "")
            mobile_number = row.get("mobile_number", "")
            address = row.get("address", "")
            parents_name = row.get("parents_name", "")
            parents_mobile_number = row.get("parents_mobile_number", "")
            roll_no = row.get("roll_number", "")

            username = generate_student_username(branch, admission_year, roll_no)
            password = generate_password(first_name, dob)

            # Create or update User
            user, created_flag = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "is_active": True,
                },
            )

            # Keep user data synced always
            user.first_name = first_name
            user.last_name = last_name
            user.email = email
            user.save()

            if created_flag:
                user.set_password(password)
                user.save()
                created += 1
            else:
                updated += 1

            # Create or update StudentProfile (sync all name fields)
            StudentProfile.objects.update_or_create(
                user=user,
                defaults={
                    "first_name": first_name,
                    "middle_name": middle_name,
                    "last_name": last_name,
                    "gender": gender,
                    "dob": dob,
                    "profile_picture": profile_picture,
                    "branch": branch,
                    "semester": semester,
                    "admission_year": admission_year,
                    "batch_id": f"{branch}_{admission_year}",
                    "role": "Student",
                    "mobile_number": mobile_number,
                    "address": address,
                    "parents_name": parents_name,
                    "parents_mobile_number": parents_mobile_number,
                },
            )

        except Exception as e:
            errors.append(f"Row {idx + 1}: {str(e)}")

    return created, updated, errors


# ---------- STAFF LOGIC ----------
def generate_staff_username(branch, designation, idx):
    """Generate staff username like CSEHOD001."""
    dept = str(branch or "").upper()[:3]
    desg = str(designation or "").upper()[:3]
    uid = str(idx).zfill(3)
    return f"{dept}{desg}{uid}"


def create_staff_from_excel(df):
    """Create or update staff users + StaffProfile."""
    df.columns = [c.strip().lower() for c in df.columns]
    created, updated, errors = 0, 0, []

    for idx, row in df.iterrows():
        try:
            first_name = str(row.get("first_name", "")).strip()
            middle_name = str(row.get("middle_name", "")).strip()
            last_name = str(row.get("last_name", "")).strip()
            email = str(row.get("email", "")).strip()
            branch = row.get("branch", "")
            designation = row.get("designation", "")
            qualifications = row.get("qualifications", "")
            joined_year = row.get("joined_year", "")
            dob = row.get("dob", "")
            gender = row.get("gender", "")
            profile_picture = row.get("profile_picture", "")
            mobile_number = row.get("mobile_number", "")
            address = row.get("address", "")
            emergency_name = row.get("emergency_name", "")
            emergency_mobile_number = row.get("emergency_mobile_number", "")
            emergency_relation = row.get("emergency_relation", "")

            username = generate_staff_username(branch, designation, idx + 1)
            password = generate_password(first_name, dob)

            # Create or update User
            user, created_flag = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "is_staff": True,
                    "is_active": True,
                },
            )

            # Always sync User with profile
            user.first_name = first_name
            user.last_name = last_name
            user.email = email
            user.save()

            if created_flag:
                user.set_password(password)
                user.save()
                created += 1
            else:
                updated += 1

            # Create or update StaffProfile (sync all name fields)
            StaffProfile.objects.update_or_create(
                user=user,
                defaults={
                    "first_name": first_name,
                    "middle_name": middle_name,
                    "last_name": last_name,
                    "gender": gender,
                    "dob": dob,
                    "profile_picture": profile_picture,
                    "branch": branch,
                    "designation": designation,
                    "qualifications": qualifications,
                    "joined_year": joined_year,
                    "mobile_number": mobile_number,
                    "address": address,
                    "emergency_name": emergency_name,
                    "emergency_mobile_number": emergency_mobile_number,
                    "emergency_relation": emergency_relation,
                    "role": "Staff",
                },
            )

        except Exception as e:
            errors.append(f"Row {idx + 1}: {str(e)}")

    return created, updated, errors


# ---------- Dummy Models for Admin UI ----------
class DummyStudentModel(models.Model):
    class Meta:
        managed = False
        verbose_name = "Upload Students"
        verbose_name_plural = "Upload Students"

    def __str__(self):
        return "Student Upload Section"


class DummyStaffModel(models.Model):
    class Meta:
        managed = False
        verbose_name = "Upload Staff"
        verbose_name_plural = "Upload Staff"

    def __str__(self):
        return "Staff Upload Section"


# ---------- Base Upload Admin ----------
class BaseUploadAdmin(admin.ModelAdmin):
    upload_function = None
    template_function = None   # NEW
    section_title = ""
    upload_name = ""
    template_name = "admin/upload_excel.html"

    def get_urls(self):
        urls = super().get_urls()
        extra_urls = [
            path(
                "upload-excel/",
                self.admin_site.admin_view(self.upload_excel),
                name=self.upload_name,
            ),
            path(
                "download-template/",
                self.admin_site.admin_view(self.download_template),
                name=f"{self.upload_name}_template",
            ),
        ]
        return extra_urls + urls

    def changelist_view(self, request, extra_context=None):
        return redirect(f"admin:{self.upload_name}")

    def upload_excel(self, request):
        if request.method == "POST":
            form = ExcelUploadForm(request.POST, request.FILES)
            if form.is_valid():
                try:
                    df = pd.read_excel(form.cleaned_data["excel_file"])
                    created, updated, errors = self.upload_function(df)

                    messages.success(request, f"✅ {created} records created.")
                    if updated:
                        messages.info(request, f"♻️ {updated} records updated.")
                    for e in errors:
                        messages.warning(request, e)

                    return redirect("..")
                except Exception as e:
                    messages.error(request, f"Error: {e}")
                    return redirect("..")
        else:
            form = ExcelUploadForm()

        context = {
            **self.admin_site.each_context(request),
            "form": form,
            "title": self.section_title,
            "template_download_url": f"admin:{self.upload_name}_template",
        }
        return TemplateResponse(request, self.template_name, context)
    
    def download_template(self, request):
        df = self.template_function()

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = f'attachment; filename="{self.upload_name}_template.xlsx"'

        df.to_excel(response, index=False)

        return response




def staff_template():
    columns = [
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "branch",
        "designation",
        "qualifications",
        "joined_year",
        "dob",
        "gender",
        "profile_picture",
        "mobile_number",
        "address",
        "emergency_name",
        "emergency_mobile_number",
        "emergency_relation",
    ]

    return pd.DataFrame(columns=columns)

def student_template():
    columns = [
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "branch",
            "semester",
            "admission_year",
            "dob",
            "gender",
            "profile_picture",
            "mobile_number",
            "address",
            "parents_name",
            "parents_mobile_number",
        ]

    return pd.DataFrame(columns=columns)


# ---------- Final Admin Registration ----------
class StudentUploadAdmin(BaseUploadAdmin):
    upload_function = staticmethod(create_students_from_excel)
    template_function = staticmethod(student_template)
    section_title = "Upload Students Excel"
    upload_name = "upload_students_excel"


class StaffUploadAdmin(BaseUploadAdmin):
    upload_function = staticmethod(create_staff_from_excel)
    template_function = staticmethod(staff_template)
    section_title = "Upload Staff Excel"
    upload_name = "upload_staff_excel"


admin.site.register(DummyStudentModel, StudentUploadAdmin)
admin.site.register(DummyStaffModel, StaffUploadAdmin)
