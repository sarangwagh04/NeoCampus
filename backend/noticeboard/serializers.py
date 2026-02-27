# noticeboard/serializers.py

from rest_framework import serializers
from .models import Notice, NoticeLink, NoticeFile


class NoticeLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoticeLink
        fields = ['id', 'url']


class NoticeFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoticeFile
        fields = ['id', 'file']


class NoticeSerializer(serializers.ModelSerializer):

    # ✅ READ ONLY FIELDS
    subject_name = serializers.CharField(read_only=True)
    subject_code = serializers.CharField(read_only=True)

    # ✅ RETURN NESTED LINKS
    links = NoticeLinkSerializer(
        many=True,
        read_only=True
    )

    # ✅ RETURN NESTED FILES
    files = NoticeFileSerializer(
        many=True,
        read_only=True
    )

    # ✅ ACCEPT LINKS DURING CREATE
    link_urls = serializers.ListField(
        child=serializers.URLField(),
        write_only=True,
        required=False
    )

    # ✅ ACCEPT FILES DURING CREATE
    uploaded_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Notice
        fields = [
            'id',
            'title',
            'brief_message',
            'subject_name',
            'subject_code',
            'batch_id',
            'is_public',
            'uploaded_by',
            'created_at',
            'links',           # ✅ visible in GET
            'files',           # ✅ visible in GET
            'link_urls',       # ✅ used only in POST
            'uploaded_files',  # ✅ used only in POST
        ]

    def validate(self, data):

        links = data.get('link_urls', [])
        files = data.get('uploaded_files', [])

        if len(links) > 5:
            raise serializers.ValidationError("Maximum 5 links allowed.")

        if len(files) > 3:
            raise serializers.ValidationError("Maximum 3 files allowed.")

        return data

    def create(self, validated_data):

        link_urls = validated_data.pop('link_urls', [])
        uploaded_files = validated_data.pop('uploaded_files', [])

        notice = Notice.objects.create(**validated_data)

        # ✅ CREATE LINKS
        for url in link_urls:
            NoticeLink.objects.create(
                notice=notice,
                url=url
            )

        # ✅ CREATE FILES
        for file in uploaded_files:
            NoticeFile.objects.create(
                notice=notice,
                file=file
            )

        return notice