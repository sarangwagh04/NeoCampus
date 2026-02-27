# profiles/admin.py
from django.contrib import admin
from .models import StudentProfile, StaffProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user", "first_name", "middle_name", "last_name", "gender", "dob",
        "branch", "semester", "admission_year", "batch_id", "role",
        "mobile_number", "address", "parents_name", "parents_mobile_number",
        "profile_picture", "date_created", "last_login"
    )
    search_fields = (
        "first_name", "last_name", "middle_name",
        "branch", "semester", "admission_year",
        "role", "mobile_number", "parents_name", "parents_mobile_number"
    )
    list_filter = ("branch", "semester", "admission_year", "gender")
    ordering = ("branch", "admission_year", "role")


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user", "first_name", "middle_name", "last_name", "gender", "dob",
        "branch", "designation", "qualifications", "joined_year", "role",
        "mobile_number", "address",
        "emergency_name", "emergency_mobile_number", "emergency_relation",
        "profile_picture", "date_created", "last_login", "is_active"
    )
    search_fields = (
        "first_name", "last_name", "middle_name",
        "branch", "designation", "mobile_number",
        "emergency_name", "emergency_mobile_number"
    )
    list_filter = ("branch", "designation", "joined_year", "gender", "is_active")
    ordering = ("branch", "designation", "joined_year")
