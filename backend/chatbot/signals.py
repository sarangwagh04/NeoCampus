from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import UploadedDocument, Chunk
# from .utils.pdf_chunker import generate_chunks_from_pdf
# from chatbot.utils.embeddings import generate_embedding

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