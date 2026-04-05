from django.contrib import admin
from .models import UploadedDocument, Chunk


@admin.register(UploadedDocument)
class UploadedDocumentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "file",
        "file_id",
        "context",
        "uploaded_by",
        "uploaded_at",
    )

    search_fields = (
        "file_id",
        "context",
    )

    list_filter = (
        "uploaded_at",
        "uploaded_by",
    )

    readonly_fields = (
        "uploaded_at",
    )

    fieldsets = (
        ("Document", {
            "fields": ("file", "file_id")
        }),
        ("Context", {
            "fields": ("context",)
        }),
        ("System Metadata", {
            "fields": ("uploaded_by", "uploaded_at")
        }),
    )


@admin.register(Chunk)
class ChunkAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "document",
        "chunk_index",
        "context",
        "short_content",
        "has_embedding",
        "created_at",
    )

    search_fields = (
        "content",
        "context",
    )

    list_filter = (
        "document",
        "created_at",
    )

    readonly_fields = (
        "created_at",
    )

    fieldsets = (
        ("Chunk Data", {
            "fields": ("document", "chunk_index", "content")
        }),
        ("Context", {
            "fields": ("context",)
        }),
        ("System Metadata", {
            "fields": ("created_at",)
        }),
    )

    def short_content(self, obj):
        return obj.content[:80] + "..." if len(obj.content) > 80 else obj.content

    short_content.short_description = "Chunk Preview"

    def has_embedding(self, obj):
        return obj.embedding is not None

    has_embedding.boolean = True
    has_embedding.short_description = "Embedding"