import os
import json
import time
import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from .database import SessionLocal, Capture, CategoryLog, Link, UserSetting
from . import qdrant_store

# Gemini REST endpoints
EMBEDDING_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent"
GENERATE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"

def get_user_api_key(db: Session, user_id: int) -> Optional[str]:
    """Retrieves the Gemini API key from the user's settings, falling back to environment variable."""
    # Check database settings first
    setting = db.query(UserSetting).filter(UserSetting.user_id == user_id, UserSetting.key == "GEMINI_API_KEY").first()
    if setting and setting.value:
        return setting.value
    # Fall back to env var
    return os.getenv("GEMINI_API_KEY")

def generate_mock_analysis(raw_text: str) -> Dict[str, Any]:
    """Generates a high-quality fallback analysis if no Gemini API key is provided."""
    text_lower = raw_text.lower()
    
    # Categorization heuristics
    if any(k in text_lower for k in ["code", "python", "javascript", "react", "programming", "api", "software", "database", "git"]):
        category = "Technology"
        sub_category = "Software Engineering"
        tags = ["programming", "dev", "tech"]
    elif any(k in text_lower for k in ["health", "diet", "sleep", "workout", "exercise", "nutrition", "fitness", "muscle"]):
        category = "Health"
        sub_category = "Wellness & Fitness"
        tags = ["health", "wellness", "lifestyle"]
    elif any(k in text_lower for k in ["money", "stock", "invest", "finance", "bitcoin", "crypto", "market", "economy"]):
        category = "Finance"
        sub_category = "Investing"
        tags = ["finance", "money", "economics"]
    elif any(k in text_lower for k in ["philosophy", "stoic", "existential", "wisdom", "ethics", "life", "meaning"]):
        category = "Philosophy"
        sub_category = "Stoicism"
        tags = ["philosophy", "wisdom", "thinking"]
    elif any(k in text_lower for k in ["book", "novel", "poetry", "read", "fiction", "writer", "literature"]):
        category = "Literature"
        sub_category = "Reading Notes"
        tags = ["reading", "books", "literature"]
    elif any(k in text_lower for k in ["history", "war", "ancient", "century", "empire", "archaeology"]):
        category = "History"
        sub_category = "World History"
        tags = ["history", "historical", "archive"]
    else:
        category = "General"
        sub_category = "Unsorted Captures"
        tags = ["ideas", "notes"]

    # Generate a simple mock summary
    words = raw_text.split()
    summary_sentence = " ".join(words[:15]) + "..." if len(words) > 15 else raw_text
    
    return {
        "category": category,
        "sub_category": sub_category,
        "summary": f"[Mock AI Summary] A raw capture discussing: {summary_sentence}",
        "tags": tags,
        "is_mock": True
    }

def generate_mock_embedding(raw_text: str) -> List[float]:
    """Generates a mock vector of 768 dimensions based on string hash for testing."""
    import hashlib
    vector = []
    # Seed with hash of the string
    h = hashlib.sha256(raw_text.encode('utf-8')).hexdigest()
    val = int(h, 16) / (1e77)  # normalization factor
    
    for i in range(768):
        # Deterministic pseudo-random generation based on index and hash value
        x = abs(sin_approx := ((val + i * 1.618) % 1.0))
        vector.append(x * 2.0 - 1.0) # Map to [-1, 1]
    
    # Normalize vector to unit length
    magnitude = sum(x**2 for x in vector)**0.5
    if magnitude > 0:
        vector = [x / magnitude for x in vector]
    return vector

def call_gemini_embedding(text: str, api_key: str) -> List[float]:
    """Calls Gemini API to generate a vector embedding."""
    url = f"{EMBEDDING_API_URL}?key={api_key}"
    payload = {
        "content": {
            "parts": [
                {"text": text}
            ]
        },
        "outputDimensionality": 768
    }
    
    response = httpx.post(url, json=payload, timeout=20.0)
    response.raise_for_status()
    res_data = response.json()
    
    return res_data["embedding"]["values"]

def call_gemini_analysis(text: str, api_key: str) -> Dict[str, Any]:
    """Calls Gemini API with structured JSON output configurations to extract categories and summaries."""
    url = f"{GENERATE_API_URL}?key={api_key}"
    
    prompt = f"""
    Analyze the following raw knowledge capture text. Categorize it, summarize it, and extract key tags.
    You must return a JSON object with this exact structure:
    {{
      "category": "High level category (e.g., Technology, Health, Finance, Philosophy, Personal, Science, Literature, History)",
      "sub_category": "More specific sub-category (e.g., Software Architecture, Nutrition, Investing, Stoicism, Habit Building, Biology, Fiction, Rome)",
      "summary": "A 2-3 sentence concise and informative summary of the capture content.",
      "tags": ["extracted-tag-1", "extracted-tag-2", "tag-3"]
    }}
    
    Text to analyze:
    ---
    {text}
    ---
    """
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "category": {"type": "STRING"},
                    "sub_category": {"type": "STRING"},
                    "summary": {"type": "STRING"},
                    "tags": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    }
                },
                "required": ["category", "sub_category", "summary", "tags"]
            }
        }
    }
    
    response = httpx.post(url, json=payload, timeout=20.0)
    response.raise_for_status()
    res_data = response.json()
    
    # Extract the text portion which is expected to be a JSON string
    content_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
    parsed_json = json.loads(content_text.strip())
    
    # Validate structure
    required_keys = ["category", "sub_category", "summary", "tags"]
    for key in required_keys:
        if key not in parsed_json:
            parsed_json[key] = "General" if "category" in key else [] if "tags" in key else ""
            
    return parsed_json

def process_capture_pipeline(capture_id: int, user_id: int):
    """Executes the AI capture processing pipeline in the background."""
    db = SessionLocal()
    try:
        # 1. Fetch capture
        capture = db.query(Capture).filter(Capture.id == capture_id, Capture.user_id == user_id).first()
        if not capture:
            print(f"Capture {capture_id} not found for user {user_id}")
            return
            
        # Get user API key
        api_key = get_user_api_key(db, user_id)
        
        # 2. Generate Vector and Upsert to Qdrant
        vector = None
        if api_key:
            try:
                vector = call_gemini_embedding(capture.raw_text, api_key)
            except Exception as e:
                print(f"Gemini embedding API call failed: {e}. Falling back to mock embedding.")
                vector = generate_mock_embedding(capture.raw_text)
        else:
            print("No Gemini API key configured. Generating mock embedding.")
            vector = generate_mock_embedding(capture.raw_text)
            
        # Save embedding in Qdrant
        created_at_ts = capture.created_at.timestamp()
        qdrant_store.upsert_capture(
            capture_id=capture.id,
            user_id=user_id,
            vector=vector,
            category=capture.category, # will update this later in pipeline
            source=capture.source,
            created_at_ts=created_at_ts
        )
        
        # 3. Call Gemini Analysis
        analysis = None
        if api_key:
            try:
                analysis = call_gemini_analysis(capture.raw_text, api_key)
            except Exception as e:
                print(f"Gemini analysis API call failed: {e}. Falling back to mock analysis.")
                analysis = generate_mock_analysis(capture.raw_text)
        else:
            analysis = generate_mock_analysis(capture.raw_text)
            
        # 4. Compare changes and log category transitions
        old_category = capture.category
        old_sub_category = capture.sub_category
        new_category = analysis.get("category")
        new_sub_category = analysis.get("sub_category")
        
        # Log category diff if it is an update and the category changes
        if old_category is not None and (old_category != new_category or old_sub_category != new_sub_category):
            cat_log = CategoryLog(
                capture_id=capture.id,
                old_category=old_category,
                new_category=new_category,
                old_sub_category=old_sub_category,
                new_sub_category=new_sub_category,
                changed_by="ai",
                dismissed=False
            )
            db.add(cat_log)
            
        # Update database capture
        capture.category = new_category
        capture.sub_category = new_sub_category
        capture.summary = analysis.get("summary")
        capture.tags = analysis.get("tags", [])
        capture.ai_status = "completed"
        db.commit()
        
        # Update Qdrant payload with the new category
        qdrant_store.upsert_capture(
            capture_id=capture.id,
            user_id=user_id,
            vector=vector,
            category=new_category,
            source=capture.source,
            created_at_ts=created_at_ts
        )
        
        # 5. Propose Links (re-linking pass for this item)
        similarity_results = qdrant_store.search_captures(
            user_id=user_id,
            query_vector=vector,
            limit=6
        )
        
        for res in similarity_results:
            target_id = res["capture_id"]
            if target_id == capture.id:
                continue
                
            # Only propose if similarity score is high (e.g., > 0.80 for cosine similarity)
            if res["score"] > 0.80:
                # Check if link already exists in any state
                existing_link = db.query(Link).filter(
                    ((Link.source_id == capture.id) & (Link.target_id == target_id)) |
                    ((Link.source_id == target_id) & (Link.target_id == capture.id))
                ).first()
                
                if not existing_link:
                    new_link = Link(
                        user_id=user_id,
                        source_id=capture.id,
                        target_id=target_id,
                        similarity_score=res["score"],
                        status="suggested"
                    )
                    db.add(new_link)
        
        db.commit()
        print(f"Async processing completed for capture {capture_id}")
        
    except Exception as e:
        print(f"Error in background capture processing: {e}")
        try:
            capture = db.query(Capture).filter(Capture.id == capture_id).first()
            if capture:
                capture.ai_status = "failed"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()

def run_relinking_pass(user_id: int):
    """Runs a full re-linking pass over all user captures."""
    db = SessionLocal()
    try:
        # First, prune any pre-existing duplicate links and links below the 80% threshold
        existing_links = db.query(Link).filter(Link.user_id == user_id).all()
        seen_pairs = set()
        for link in existing_links:
            # Delete suggested links below the 80% similarity threshold
            if link.status == "suggested" and link.similarity_score < 0.80:
                db.delete(link)
                continue
                
            pair = (min(link.source_id, link.target_id), max(link.source_id, link.target_id))
            if pair in seen_pairs:
                db.delete(link)
            else:
                seen_pairs.add(pair)
        db.commit()

        # Find all completed, non-deleted captures for the user
        captures = db.query(Capture).filter(
            Capture.user_id == user_id, 
            Capture.ai_status == "completed",
            Capture.deleted_at.is_(None)
        ).all()
        
        api_key = get_user_api_key(db, user_id)
        
        links_proposed = 0
        proposed_in_session = set()
        
        for cap in captures:
            # Try to retrieve existing vector from Qdrant to avoid duplicate embedding API calls
            vector = None
            try:
                points = qdrant_store.client.retrieve(
                    collection_name=qdrant_store.COLLECTION_NAME,
                    ids=[cap.id],
                    with_vectors=True
                )
                if points and points[0].vector:
                    vector = points[0].vector
            except Exception as e:
                print(f"Error retrieving vector from Qdrant: {e}")
                
            if not vector:
                if api_key:
                    try:
                        vector = call_gemini_embedding(cap.raw_text, api_key)
                    except Exception:
                        vector = generate_mock_embedding(cap.raw_text)
                else:
                    vector = generate_mock_embedding(cap.raw_text)

            # Perform similarity search
            results = qdrant_store.search_captures(user_id=user_id, query_vector=vector, limit=6)
            for res in results:
                target_id = res["capture_id"]
                if target_id == cap.id:
                    continue
                    
                # Track unique connection pairs to prevent proposing bidirectional duplicates (A-B and B-A) in the same session
                pair = (min(cap.id, target_id), max(cap.id, target_id))
                if pair in proposed_in_session:
                    continue
                    
                if res["score"] > 0.80:
                    existing_link = db.query(Link).filter(
                        ((Link.source_id == cap.id) & (Link.target_id == target_id)) |
                        ((Link.source_id == target_id) & (Link.target_id == cap.id))
                    ).first()
                    
                    if not existing_link:
                        new_link = Link(
                            user_id=user_id,
                            source_id=cap.id,
                            target_id=target_id,
                            similarity_score=res["score"],
                            status="suggested"
                        )
                        db.add(new_link)
                        proposed_in_session.add(pair)
                        links_proposed += 1
        db.commit()
        return links_proposed
    except Exception as e:
        print(f"Error running full relinking pass: {e}")
        return 0
    finally:
        db.close()

def reprocess_mock_captures():
    """Finds all captures that were processed using mock fallbacks and re-runs them using the live Gemini API."""
    db = SessionLocal()
    try:
        # Find captures with mock summaries
        mock_captures = db.query(Capture).filter(
            Capture.summary.like("[Mock AI Summary]%")
        ).all()
        
        if not mock_captures:
            print("No mock captures found to re-process.")
            return
            
        print(f"Found {len(mock_captures)} mock captures. Starting re-processing...")
        
        for cap in mock_captures:
            api_key = get_user_api_key(db, cap.user_id)
            if not api_key:
                print(f"Skipping capture {cap.id}: No API key configured for user {cap.user_id}")
                continue
                
            try:
                print(f"Re-processing capture {cap.id} using live Gemini API...")
                vector = call_gemini_embedding(cap.raw_text, api_key)
                analysis = call_gemini_analysis(cap.raw_text, api_key)
                
                # Update Qdrant
                qdrant_store.upsert_capture(
                    capture_id=cap.id,
                    user_id=cap.user_id,
                    vector=vector,
                    category=analysis.get("category"),
                    source=cap.source,
                    created_at_ts=cap.created_at.timestamp()
                )
                
                # Update DB
                cap.category = analysis.get("category")
                cap.sub_category = analysis.get("sub_category")
                cap.summary = analysis.get("summary")
                cap.tags = analysis.get("tags", [])
                cap.ai_status = "completed"
                db.commit()
                print(f"Capture {cap.id} successfully re-processed: {cap.category}")
            except Exception as e:
                print(f"Error re-processing capture {cap.id}: {e}")
                
        # Run a relinking pass for users whose captures were reprocessed
        user_ids = {cap.user_id for cap in mock_captures}
        for uid in user_ids:
            try:
                run_relinking_pass(uid)
            except Exception as e:
                print(f"Error running relinking pass for user {uid}: {e}")
                
    finally:
        db.close()

