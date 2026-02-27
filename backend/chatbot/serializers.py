from rest_framework import serializers


class ChatbotAskSerializer(serializers.Serializer):
    question = serializers.CharField(max_length=1000)
    context = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True
    )
    top_k = serializers.IntegerField(
        default=3,
        min_value=1,
        max_value=10
    )