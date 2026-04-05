# accounts/models.py
from django.db import models


class StudentUpload(models.Model):
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Upload Students"
        verbose_name_plural = "Upload Students"

    def __str__(self):
        return f"Upload at {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"
