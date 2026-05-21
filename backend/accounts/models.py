# accounts/models.py
from django.db import models


class StudentUpload(models.Model):
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Upload Students"
        verbose_name_plural = "Upload Students"

    def __str__(self):
        return f"Upload at {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"


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
