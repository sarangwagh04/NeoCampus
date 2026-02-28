# home/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from profiles.models import StudentProfile, StaffProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email")

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = StudentProfile
        fields = "__all__"

class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = StaffProfile
        fields = "__all__"


class StudentDashboardSerializer(serializers.ModelSerializer):
    college_id = serializers.CharField(source="user.username")
    full_name = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()


    class Meta:
        model = StudentProfile
        fields = [
            "full_name",
            "college_id",
            "profile_picture",
            "batch_id",
            "branch",
            "semester",
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    def get_profile_picture(self, obj):
        request = self.context.get("request")
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None