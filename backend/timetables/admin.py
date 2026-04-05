from django.contrib import admin
from .models import Subject, TimeSlot, Timetable


# =========================
# SUBJECT ADMIN
# =========================
@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "name",
        "branch",
        "year",
        "teacher",
        "classroom",
    )
    list_filter = ("branch", "year")
    search_fields = ("code", "name", "branch")
    ordering = ("branch", "year")


# =========================
# TIME SLOT ADMIN
# =========================
@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = (
        "start_time",
        "end_time",
        "is_break",
        "break_label",
    )
    list_filter = ("is_break",)
    ordering = ("start_time",)


# =========================
# TIMETABLE ADMIN
# =========================
@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = (
        "day",
        "timeslot",
        "subject",
        "get_teacher",
        "get_classroom",
    )
    list_filter = ("day",)
    search_fields = ("subject__code", "subject__name")
    ordering = ("day", "timeslot")

    def get_teacher(self, obj):
        if obj.subject:
            return obj.subject.teacher
        return "-"
    get_teacher.short_description = "Teacher"

    def get_classroom(self, obj):
        if obj.subject:
            return obj.subject.classroom
        return "-"
    get_classroom.short_description = "Classroom"