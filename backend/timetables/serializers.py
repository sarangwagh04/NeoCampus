from rest_framework import serializers
from .models import Timetable, TimeSlot


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = [
            "id",
            "start_time",
            "end_time",
            "is_break",
            "break_label",
        ]


class TimetableEntrySerializer(serializers.ModelSerializer):
    subjectCode = serializers.SerializerMethodField()
    subjectName = serializers.SerializerMethodField()
    facultyName = serializers.SerializerMethodField()

    class Meta:
        model = Timetable
        fields = [
            "id",
            "day",
            "timeslot",
            "classroom",
            "subjectCode",
            "subjectName",
            "facultyName",
        ]

    def get_subjectCode(self, obj):
        if obj.assignment:
            return obj.assignment.subject.code
        return None

    def get_subjectName(self, obj):
        if obj.assignment:
            return obj.assignment.subject.name
        return None

    def get_facultyName(self, obj):
        if obj.assignment:
            return obj.assignment.staff.user.get_full_name()
        return None