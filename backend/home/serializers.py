# accounts/serializers.py
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

