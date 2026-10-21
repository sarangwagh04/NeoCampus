import pickle

# Lazy-loaded model to keep runserver startup fast
_model = None

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def generate_embedding(text: str) -> bytes:
    """
    Generate embedding for text and serialize it
    for database storage.
    """
    model = get_model()
    vector = model.encode(text)
    return pickle.dumps(vector)


def deserialize_embedding(blob: bytes):
    """
    Convert stored embedding back to numpy array
    """
    return pickle.loads(blob)