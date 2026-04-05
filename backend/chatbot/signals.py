from django.dispatch import receiver
from django.db.models.signals import post_save, pre_save

from .models import UploadedDocument, Chunk
from .utils.pdf_chunker import generate_chunks_from_pdf
from chatbot.utils.embeddings import generate_embedding

@receiver(post_save, sender=UploadedDocument)
def auto_create_chunks(sender, instance, created, **kwargs):
    if not created:
        return

    if not instance.file.name.lower().endswith(".pdf"):
        return

    pdf_path = instance.file.path
    chunks = generate_chunks_from_pdf(pdf_path)

    chunk_objects = []

    for chunk_index, content in chunks:
        chunk_objects.append(
            Chunk(
                document=instance,
                chunk_index=chunk_index,
                content=content,
                context=instance.context,
                embedding=generate_embedding(content),  # ✅ FIX
            )
        )

    Chunk.objects.bulk_create(chunk_objects)

    print(f"✅ Created {len(chunk_objects)} chunks with embeddings")



# ===================== NEW SECTION =====================
# This ensures embedding is generated even if chunk
# is manually created from Django admin or via API
# ========================================================

@receiver(pre_save, sender=Chunk)
def auto_generate_embedding(sender, instance, **kwargs):
    """
    Automatically generate embedding for manually created chunks
    (e.g., College Updates added by staff or admin).
    """

    # If embedding already exists → do nothing
    if instance.embedding:
        return

    # If content exists → generate embedding
    if instance.content:
        instance.embedding = generate_embedding(instance.content)