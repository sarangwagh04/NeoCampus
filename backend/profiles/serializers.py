# profiles/serializers.py

from rest_framework import serializers
from .models import StaffProfile, StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    # Map Django User email field
    email = serializers.EmailField(source="user.email", read_only=False)
    username = serializers.CharField(source="user.username", read_only=True)


    class Meta:
        model = StudentProfile
        fields = [
            # Personal
            "first_name",
            "middle_name",
            "last_name",
            "gender",
            "dob",
            "profile_picture",

            # Academic
            "branch",
            "semester",
            "admission_year",
            "role",
            "batch_id",

            # Contact
            "mobile_number",
            "address",

            # Parent
            "parents_name",
            "parents_mobile_number",

            # System
            "date_created",
            "last_login",

            # User
            "email",
            "username",
        ]

        read_only_fields = [
            "branch",
            "semester",
            "admission_year",
            "role",
            "batch_id",
            "parents_mobile_number",
            "date_created",
            "last_login",
        ]

    # ✅ Allow updating email properly
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)

        if user_data:
            instance.user.email = user_data.get("email", instance.user.email)
            instance.user.save()

        return super().update(instance, validated_data)




# -------------------- STAFF SERIALIZER --------------------

class StaffProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = StaffProfile
        fields = [
            # Basic
            "first_name",
            "middle_name",
            "last_name",
            "gender",
            "dob",
            "profile_picture",

            # Job
            "branch",
            "is_hod",
            "designation",
            "qualifications",
            "joined_year",
            "role",

            # Contact
            "mobile_number",
            "address",

            # Emergency
            "emergency_name",
            "emergency_mobile_number",
            "emergency_relation",

            # System
            "date_created",
            "last_login",
            "is_active",

            # User
            "email",
            "username",
        ]

        read_only_fields = [
            "branch",
            "designation",
            "joined_year",
            "role",
            "is_active",
            "date_created",
            "last_login",
            "is_hod",
        ]