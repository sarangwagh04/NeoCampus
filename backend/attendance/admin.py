from django.contrib import admin
from .models import Subject, SubjectAssignment, TeachingPlan, Attendance


# ===========================
# SUBJECT ADMIN
# ===========================
@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'branch', 'is_active')
    search_fields = ('name', 'code', 'branch')
    list_filter = ('branch', 'is_active')
    ordering = ('branch', 'name')


# ===========================
# SUBJECT ASSIGNMENT ADMIN
# ===========================
@admin.register(SubjectAssignment)
class SubjectAssignmentAdmin(admin.ModelAdmin):
    list_display = ('subject', 'staff', 'batch_id', 'semester', 'assignment_id')
    search_fields = ('subject__name', 'subject__code', 'batch_id', 'staff__user__username')
    list_filter = ('batch_id', 'semester', 'staff__branch')
    ordering = ('subject__branch', 'semester', 'batch_id')

    readonly_fields = ('assignment_id', 'assigned_on')


# ===========================
# TEACHING PLAN ADMIN
# ===========================
@admin.register(TeachingPlan)
class TeachingPlanAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'lecture_number', 'topic', 'lecture_date')
    search_fields = ('assignment__subject__name', 'topic')
    list_filter = ('assignment__batch_id', 'assignment__semester')
    ordering = ('assignment__subject__name', 'lecture_number')


# ===========================
# ATTENDANCE ADMIN
# ===========================
@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('teaching_plan', 'student', 'is_present', 'marked_on')
    search_fields = ('student__user__username', 'teaching_plan__topic')
    list_filter = ('is_present', 'student__branch', 'teaching_plan__lecture_date')
    ordering = ('marked_on',)
