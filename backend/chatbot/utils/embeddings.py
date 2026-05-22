import pickle
import requests
import numpy as np
from decouple import config

# Hugging Face Inference API details
API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
HF_TOKEN = config("HF_TOKEN", default="")

def generate_embedding(text: str) -> bytes:
    """
    Generate embedding for text using Hugging Face API
    and serialize it for database storage.
    """
    if not HF_TOKEN:
        raise ValueError("HF_TOKEN environment variable is missing! Please configure it in your environment.")

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": text}
    
    response = requests.post(API_URL, headers=headers, json=payload)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch embeddings: {response.text}")
        
    # The API returns a list of floats (the embedding vector)
    vector = np.array(response.json(), dtype=np.float32)
    return pickle.dumps(vector)

def deserialize_embedding(blob: bytes):
    """
    Convert stored embedding back to numpy array
    """
    return pickle.loads(blob)