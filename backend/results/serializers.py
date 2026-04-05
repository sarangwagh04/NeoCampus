from rest_framework import serializers
from .models import ResultUpload
from attendance.models import StudentProfile

# ==============================================================
# Student result (FOR Excel UPLOAD)
# ==============================================================
class ResultUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultUpload
        fields = ["upload_id", "file", "uploaded_by", "batch_id", "uploaded_at"]
        read_only_fields = ["upload_id", "uploaded_by", "uploaded_at"]


# ==============================================================
# Student Info (FOR MARKSHEET PDF)
# ==============================================================
class StudentProfileSerializer(serializers.ModelSerializer):
    college_id = serializers.CharField(source="user.username")

    class Meta:
        model = StudentProfile
        fields = [
            "first_name",
            "middle_name",
            "last_name",
            "branch",
            "semester",
            "admission_year",
            "college_id",
        ]