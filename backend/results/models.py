from django.db import models
from django.conf import settings


# ==============================================================
# TABLE 1: RESULT UPLOAD RECORD
# ==============================================================

class ResultUpload(models.Model):
    upload_id = models.AutoField(primary_key=True)

    # Uploaded file
    file = models.FileField(upload_to="result_uploads/")

    # Staff who uploaded
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="result_uploads"
    )

    # Batch ID selected from context
    batch_id = models.CharField(max_length=100)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Upload {self.upload_id} - {self.batch_id}"


# ==============================================================
# TABLE 2: RESULT ENTRY (PER STUDENT PER SUBJECT)
# ==============================================================

class ResultEntry(models.Model):
    upload = models.ForeignKey(
        ResultUpload,
        on_delete=models.CASCADE,
        related_name="entries"
    )

    batch_id = models.CharField(max_length=100)

    # username = roll number / college id
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    subject_code = models.CharField(max_length=50)
    subject_name = models.CharField(max_length=200)

    internal_marks = models.CharField(max_length=20)  # 00/00 or NA
    external_marks = models.CharField(max_length=20)
    total_marks = models.CharField(max_length=20)

    grade = models.CharField(max_length=5)
    subject_credits = models.FloatField()
    sgpa = models.FloatField()

    def __str__(self):
        return f"{self.student.username} - {self.subject_name}"

