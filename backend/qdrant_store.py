import os
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from dotenv import load_dotenv

load_dotenv()

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
COLLECTION_NAME = "captures"

client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

def init_qdrant():
    """Initializes the captures collection in Qdrant if it doesn't exist."""
    try:
        # Check if collection exists
        collections = client.get_collections().collections
        exists = any(c.name == COLLECTION_NAME for c in collections)
        
        if not exists:
            # Create collection. Gemini text-embedding-004 has 768 dimensions.
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=qmodels.VectorParams(
                    size=768,
                    distance=qmodels.Distance.COSINE
                )
            )
            print(f"Qdrant collection '{COLLECTION_NAME}' created successfully.")
        else:
            print(f"Qdrant collection '{COLLECTION_NAME}' already exists.")
    except Exception as e:
        print(f"Error initializing Qdrant: {e}")

def upsert_capture(
    capture_id: int, 
    user_id: int, 
    vector: List[float], 
    category: Optional[str] = None,
    source: Optional[str] = None,
    created_at_ts: float = 0.0
):
    """Upserts a capture's vector embedding along with key metadata payloads."""
    try:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                qmodels.PointStruct(
                    id=capture_id,
                    vector=vector,
                    payload={
                        "capture_id": capture_id,
                        "user_id": user_id,
                        "category": category,
                        "source": source,
                        "created_at": created_at_ts
                    }
                )
            ]
        )
    except Exception as e:
        print(f"Error upserting to Qdrant: {e}")
        raise e

def delete_capture_vector(capture_id: int):
    """Removes a vector point from the Qdrant database."""
    try:
        client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=qmodels.PointIdsList(
                points=[capture_id]
            )
        )
    except Exception as e:
        print(f"Error deleting vector point: {e}")

def search_captures(
    user_id: int,
    query_vector: List[float],
    limit: int = 15,
    category: Optional[str] = None,
    source: Optional[str] = None,
    start_date_ts: Optional[float] = None,
    end_date_ts: Optional[float] = None
) -> List[Dict[str, Any]]:
    """Searches Qdrant for similar vectors belonging to the user, applying metadata filters."""
    try:
        # Build user isolation filter
        must_conditions = [
            qmodels.FieldCondition(
                key="user_id",
                match=qmodels.MatchValue(value=user_id)
            )
        ]
        
        # Apply optional filters
        if category:
            must_conditions.append(
                qmodels.FieldCondition(
                    key="category",
                    match=qmodels.MatchValue(value=category)
                )
            )
            
        if source:
            must_conditions.append(
                qmodels.FieldCondition(
                    key="source",
                    match=qmodels.MatchValue(value=source)
                )
            )
            
        if start_date_ts is not None or end_date_ts is not None:
            range_args = {}
            if start_date_ts is not None:
                range_args["gte"] = start_date_ts
            if end_date_ts is not None:
                range_args["lte"] = end_date_ts
            must_conditions.append(
                qmodels.FieldCondition(
                    key="created_at",
                    range=qmodels.Range(**range_args)
                )
            )
            
        query_filter = qmodels.Filter(must=must_conditions)
        
        search_result = client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            query_filter=query_filter,
            limit=limit,
            with_payload=True
        )
        
        results = []
        for hit in search_result.points:
            results.append({
                "capture_id": hit.payload.get("capture_id"),
                "score": hit.score,
                "category": hit.payload.get("category"),
                "source": hit.payload.get("source"),
                "created_at": hit.payload.get("created_at")
            })
        return results
    except Exception as e:
        print(f"Error searching Qdrant: {e}")
        return []
