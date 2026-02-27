from rest_framework import serializers

class ResultAnalysisUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)


class TopperSerializer(serializers.Serializer):
    Name = serializers.CharField()
    SGPA = serializers.FloatField()


class SubjectStatsSerializer(serializers.Serializer):
    subject = serializers.CharField()
    appeared = serializers.IntegerField()
    passed = serializers.IntegerField()
    failed = serializers.IntegerField()
    pass_percentage = serializers.FloatField()


class ResultAnalysisSerializer(serializers.Serializer):
    class_name = serializers.CharField()
    total_students = serializers.IntegerField()
    toppers = TopperSerializer(many=True)
    subjects = SubjectStatsSerializer(many=True)
