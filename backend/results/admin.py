from django.contrib import admin
from .models import ResultUpload, ResultEntry


# ==============================================================
# REGISTER RESULT UPLOAD TABLE
# ==============================================================

@admin.register(ResultUpload)
class ResultUploadAdmin(admin.ModelAdmin):
    list_display = ("upload_id", "batch_id", "uploaded_by", "uploaded_at")
    search_fields = ("batch_id", "uploaded_by__username")
    ordering = ("-uploaded_at",)


# ==============================================================
# REGISTER RESULT ENTRY TABLE
# ==============================================================

@admin.register(ResultEntry)
class ResultEntryAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "subject_code",
        "subject_name",
        "internal_marks",
        "external_marks",
        "total_marks",
        "grade",
        "sgpa",
    )
    search_fields = ("student__username", "subject_name", "batch_id", "subject_code")
    list_filter = ("batch_id", "subject_name")