from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class UploadedDocument(models.Model):
    """
    Stores uploaded source documents
    """

    file = models.FileField(upload_to="chatbot/documents/")
    file_id = models.CharField(
        max_length=100,
        unique=True,
        help_text="System or externally generated file ID"
    )

    context = models.CharField(
        max_length=255,
        help_text="Subject / topic / title of the document"
    )

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="chatbot_uploaded_documents"
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_id} - {self.context}"
    


class Chunk(models.Model):
    """
    Stores individual chunks of text extracted from documents
    """

    document = models.ForeignKey(
        UploadedDocument,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="chunks",
        help_text="Optional. Leave empty for manually added chunks."
    )

    chunk_index = models.PositiveIntegerField(
        help_text="Order of chunk inside the document"
    )

    content = models.TextField()

    context = models.CharField(
        max_length=255,
        help_text="Subject / topic this chunk is about"
    )

    embedding = models.BinaryField(
        null=True,
        blank=True,
        help_text="Sentence-transformer embedding (pickled vector)"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["chunk_index"]
        unique_together = ("document", "chunk_index")

    def __str__(self):
        if self.document:
            return f"{self.document.file_id} | Chunk {self.chunk_index}"
        return f"Manual Chunk | {self.chunk_index}"