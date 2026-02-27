from rest_framework import serializers
from .models import Subject, SubjectAssignment, TeachingPlan
from profiles.models import StaffProfile


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'is_active']


class StaffMiniSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = StaffProfile
        fields = ['id','user_id', 'name']

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class SubjectAssignmentSerializer(serializers.ModelSerializer):
    assignment_id = serializers.UUIDField(read_only=True)

    subject = SubjectSerializer(read_only=True)
    staff = StaffMiniSerializer(read_only=True)

    staff_id = serializers.PrimaryKeyRelatedField(
        queryset=StaffProfile.objects.all(),
        source="staff",
        write_only=True
    )
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        source="subject",
        write_only=True
    )

    has_teaching_plan = serializers.SerializerMethodField()

    class Meta:
        model = SubjectAssignment
        fields = [
            'assignment_id',
            'subject',
            'staff',
            'subject_id',
            'staff_id',
            'batch_id',
            'semester',
            'has_teaching_plan',
        ]

    def get_has_teaching_plan(self, obj):
        return obj.teaching_plan.exists()
    

class TeachingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeachingPlan
        fields = [
            'id',
            'lecture_number',
            'topic',
            'lecture_date',
        ]
