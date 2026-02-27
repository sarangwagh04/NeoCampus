import numpy as np
from typing import List

from chatbot.models import Chunk
from chatbot.utils.embeddings import (
    generate_embedding,
    deserialize_embedding,
)


def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    if np.linalg.norm(vec1) == 0 or np.linalg.norm(vec2) == 0:
        return 0.0
    return float(
        np.dot(vec1, vec2)
        / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    )


def similarity_search(
    query: str,
    top_k: int = 3,
    context: str | None = None,
) -> List[Chunk]:
    """
    DB-based semantic similarity search over chunks
    """

    # 1️⃣ Embed the query (same model as chunks)
    query_embedding = deserialize_embedding(
        generate_embedding(query)
    )

    # 2️⃣ Fetch candidate chunks
    qs = Chunk.objects.exclude(embedding__isnull=True)

    if context:
        qs = qs.filter(context__iexact=context)

    scored_chunks = []

    # 3️⃣ Compute similarity
    for chunk in qs:
        chunk_embedding = deserialize_embedding(chunk.embedding)
        score = cosine_similarity(query_embedding, chunk_embedding)
        scored_chunks.append((score, chunk))

    # 4️⃣ Sort by similarity
    scored_chunks.sort(key=lambda x: x[0], reverse=True)

    # 5️⃣ Return top-K chunks only
    return [chunk for _, chunk in scored_chunks[:top_k]]