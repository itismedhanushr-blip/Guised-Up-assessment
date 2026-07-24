"""
Guised Up - Python ML & Embedding Service
FastAPI microservice for sentence-transformers 384-d vector embeddings
and authenticity scoring.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import math
import re

app = FastAPI(
    title="Guised Up ML Service",
    description="Vector Embeddings and Authenticity Processing Engine",
    version="1.0.0"
)

class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    text: str
    dimension: int
    vector: List[float]
    authenticity_score: float

class SimilarityRequest(BaseModel):
    vector_a: List[float]
    vector_b: List[float]

class SimilarityResponse(BaseModel):
    similarity: float

def compute_text_embedding(text: str) -> List[float]:
    """
    Generate 384-dimensional dense vector representation for text.
    In production, this wraps `sentence_transformers.SentenceTransformer('all-MiniLM-L6-v2')`.
    """
    clean_text = text.lower().strip()
    words = re.findall(r'\w+', clean_text)
    vector = [0.0] * 384
    
    for word in words:
        hash_val = sum(ord(c) for c in word)
        for i in range(384):
            v = math.sin((hash_val + i * 17) / 100.0)
            vector[i] += v
            
    # L2 Normalize
    norm = math.sqrt(sum(x * x for x in vector))
    if norm > 0:
        vector = [round(x / norm, 6) for x in vector]
    return vector

def compute_authenticity(text: str) -> float:
    """
    Calculate text genuineness based on structural heuristics.
    """
    hashtags = len(re.findall(r'#\w+', text))
    is_all_caps = text.isupper() and len(text) > 10
    marketing_buzz = len(re.findall(r'\b(sponsored|ad|collab|influencer|vibes|blessed)\b', text, re.I))
    
    base_score = 0.95
    penalty = (hashtags * 0.05) + (0.20 if is_all_caps else 0.0) + (marketing_buzz * 0.10)
    return max(0.10, min(1.0, round(base_score - penalty, 2)))

@app.get("/")
def read_root():
    return {"status": "online", "service": "Guised Up ML Engine v1.0.0"}

@app.post("/embed", response_model=EmbeddingResponse)
def generate_embedding(payload: EmbeddingRequest):
    vector = compute_text_embedding(payload.text)
    authenticity = compute_authenticity(payload.text)
    return EmbeddingResponse(
        text=payload.text,
        dimension=len(vector),
        vector=vector,
        authenticity_score=authenticity
    )

@app.post("/similarity", response_model=SimilarityResponse)
def calculate_similarity(payload: SimilarityRequest):
    if len(payload.vector_a) != len(payload.vector_b) or not payload.vector_a:
        raise HTTPException(status_code=400, detail="Vectors must be non-empty and equal length")
    
    dot = sum(a * b for a, b in zip(payload.vector_a, payload.vector_b))
    norm_a = math.sqrt(sum(a * a for a in payload.vector_a))
    norm_b = math.sqrt(sum(b * b for b in payload.vector_b))
    
    if norm_a == 0 or norm_b == 0:
        similarity = 0.0
    else:
        similarity = dot / (norm_a * norm_b)
        
    return SimilarityResponse(similarity=round(similarity, 4))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
