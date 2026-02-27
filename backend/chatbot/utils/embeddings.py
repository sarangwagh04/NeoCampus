from sentence_transformers import SentenceTransformer
import pickle

# Load once (important for performance)
_model = SentenceTransformer("all-MiniLM-L6-v2")


def generate_embedding(text: str) -> bytes:
    """
    Generate embedding for text and serialize it
    for database storage.
    """
    vector = _model.encode(text)
    return pickle.dumps(vector)


def deserialize_embedding(blob: bytes):
    """
    Convert stored embedding back to numpy array
    """
    return pickle.loads(blob)