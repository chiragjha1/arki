import os
import json
import time
import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from .database import SessionLocal, Capture, CategoryLog, Link, UserSetting, ApiUsageLog
from . import qdrant_store

def log_api_usage(db: Session, user_id: int, api_type: str, status: str, error_message: Optional[str] = None):
    try:
        # Create a new session specifically for usage logging to avoid interfering with parent transaction commits/rollbacks
        log_db = SessionLocal()
        log = ApiUsageLog(
            user_id=user_id,
            api_type=api_type,
            status=status,
            error_message=error_message
        )
        log_db.add(log)
        log_db.commit()
        log_db.close()
    except Exception as e:
        print(f"Error logging API usage: {e}")

# Gemini REST endpoints
EMBEDDING_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent"
GENERATE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"

def get_user_api_keys(db: Session, user_id: int) -> List[str]:
    """Retrieves all configured Gemini API keys from settings (comma-separated/newline-separated) and env."""
    setting = db.query(UserSetting).filter(UserSetting.user_id == user_id, UserSetting.key == "GEMINI_API_KEY").first()
    keys = []
    if setting and setting.value:
        keys = [k.strip() for k in setting.value.replace("\n", ",").split(",") if k.strip()]
    if not keys:
        env_key = os.getenv("GEMINI_API_KEY")
        if env_key:
            keys = [k.strip() for k in env_key.replace("\n", ",").split(",") if k.strip()]
    return keys

def call_gemini_embedding_with_rotation(text: str, api_keys: List[str], db: Session, user_id: int) -> List[float]:
    """Tries API keys sequentially for generating embedding vector."""
    last_error = None
    for i, key in enumerate(api_keys):
        try:
            vector = call_gemini_embedding(text, key)
            log_api_usage(db, user_id, "embedding", "success")
            return vector
        except Exception as e:
            last_error = e
            # Mask API key in error message to avoid leak
            masked_key = key[:6] + "..." if len(key) > 6 else "key"
            log_api_usage(db, user_id, "embedding", "failed", f"Key #{i+1} ({masked_key}) failed: {e}")
    if last_error:
        raise last_error
    raise Exception("No Gemini API keys configured.")

def call_gemini_analysis_with_rotation(
    text: str,
    api_keys: List[str],
    db: Session,
    user_id: int,
    existing_categories: Optional[List[str]] = None,
    existing_subcategories: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Tries API keys sequentially for generating analysis."""
    last_error = None
    for i, key in enumerate(api_keys):
        try:
            analysis = call_gemini_analysis(text, key, existing_categories, existing_subcategories)
            log_api_usage(db, user_id, "analysis", "success")
            return analysis
        except Exception as e:
            last_error = e
            masked_key = key[:6] + "..." if len(key) > 6 else "key"
            log_api_usage(db, user_id, "analysis", "failed", f"Key #{i+1} ({masked_key}) failed: {e}")
    if last_error:
        raise last_error
    raise Exception("No Gemini API keys configured.")

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

def call_gemini_analysis(
    text: str,
    api_key: str,
    existing_categories: Optional[List[str]] = None,
    existing_subcategories: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Calls Gemini API with structured JSON output configurations to extract categories and summaries."""
    url = f"{GENERATE_API_URL}?key={api_key}"
    
    prompt = f"""
    Analyze the following raw knowledge capture text. Categorize it, summarize it, and extract key tags.
    
    CRITICAL TAXONOMY REUSE INSTRUCTION:
    We want to keep the folders/taxonomy clean and consistent. Here are the user's existing categories and sub-categories:
    - Existing Categories: {existing_categories or []}
    - Existing Sub-categories: {existing_subcategories or []}
    
    If the content fits reasonably well into one of these existing categories and/or sub-categories, you MUST reuse them exactly (case-sensitive) instead of creating new ones!
    Only create a new category or sub-category if the content absolutely does not fit into the existing ones. Do not create synonyms, minor variations, or different word forms (e.g. if "Philosophy" exists, do not create "Philosophical"; if "Physics" exists under "Science", do not create a separate "Physics" high-level folder or "Theoretical Physics" subcategory unless it is totally different).
    
    You must return a JSON object with this exact structure:
    {{
      "category": "High level category (re-use from the Existing Categories list if it fits)",
      "sub_category": "More specific sub-category (re-use from the Existing Sub-categories list if it fits)",
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

def get_existing_taxonomy(db: Session, user_id: int):
    """Fetches all existing distinct categories and subcategories for the user."""
    categories = [
        r[0] for r in db.query(Capture.category)
        .filter(Capture.user_id == user_id, Capture.category.isnot(None), Capture.deleted_at.is_(None))
        .distinct().all()
    ]
    sub_categories = [
        r[0] for r in db.query(Capture.sub_category)
        .filter(Capture.user_id == user_id, Capture.sub_category.isnot(None), Capture.deleted_at.is_(None))
        .distinct().all()
    ]
    return categories, sub_categories

def process_capture_pipeline(capture_id: int, user_id: int):
    """Executes the AI capture processing pipeline in the background."""
    db = SessionLocal()
    try:
        # 1. Fetch capture
        capture = db.query(Capture).filter(Capture.id == capture_id, Capture.user_id == user_id).first()
        if not capture:
            print(f"Capture {capture_id} not found for user {user_id}")
            return
            
        # Get user API keys
        api_keys = get_user_api_keys(db, user_id)
        if not api_keys:
            err_msg = "No Gemini API key configured. Please add your Gemini API key in settings."
            capture.ai_status = "failed"
            capture.error_message = err_msg
            db.commit()
            log_api_usage(db, user_id, "embedding", "failed", err_msg)
            return
            
        # 2. Generate Vector and Upsert to Qdrant
        vector = None
        try:
            vector = call_gemini_embedding_with_rotation(capture.raw_text, api_keys, db, user_id)
        except Exception as e:
            err_msg = f"AI Embedding failed: {e}"
            print(err_msg)
            capture.ai_status = "failed"
            capture.error_message = err_msg
            db.commit()
            return
            
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
        
        # 3. Call Gemini Analysis with existing taxonomy to reuse folders
        analysis = None
        try:
            existing_cats, existing_subcats = get_existing_taxonomy(db, user_id)
            analysis = call_gemini_analysis_with_rotation(
                capture.raw_text,
                api_keys,
                db,
                user_id,
                existing_categories=existing_cats,
                existing_subcategories=existing_subcats
            )
        except Exception as e:
            err_msg = f"AI Analysis failed: {e}"
            print(err_msg)
            capture.ai_status = "failed"
            capture.error_message = err_msg
            db.commit()
            return
            
        new_category = analysis.get("category")
        new_sub_category = analysis.get("sub_category")
        
        # Update database capture
        capture.category = new_category
        capture.sub_category = new_sub_category
        capture.summary = analysis.get("summary")
        capture.tags = analysis.get("tags", [])
        capture.ai_status = "completed"
        capture.error_message = None
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
                capture.error_message = str(e)
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
            # 1. Roll back to clear any previous failed transactions and check if capture still exists
            db.rollback()
            live_cap = db.query(Capture).filter(Capture.id == cap.id).first()
            if not live_cap:
                print(f"Capture {cap.id} was concurrently deleted. Skipping re-processing.")
                continue
                
            api_keys = get_user_api_keys(db, live_cap.user_id)
            if not api_keys:
                print(f"Skipping capture {cap.id}: No API key configured for user {live_cap.user_id}")
                continue
                
            try:
                print(f"Re-processing capture {live_cap.id} using live Gemini API...")
                
                # 1. Embedding
                try:
                    vector = call_gemini_embedding_with_rotation(live_cap.raw_text, api_keys, db, live_cap.user_id)
                except Exception as e_embed:
                    raise e_embed
                    
                # 2. Analysis
                existing_cats, existing_subcats = get_existing_taxonomy(db, live_cap.user_id)
                try:
                    analysis = call_gemini_analysis_with_rotation(
                        live_cap.raw_text,
                        api_keys,
                        db,
                        live_cap.user_id,
                        existing_categories=existing_cats,
                        existing_subcategories=existing_subcats
                    )
                except Exception as e_anal:
                    raise e_anal
                
                # Update Qdrant
                qdrant_store.upsert_capture(
                    capture_id=live_cap.id,
                    user_id=live_cap.user_id,
                    vector=vector,
                    category=analysis.get("category"),
                    source=live_cap.source,
                    created_at_ts=live_cap.created_at.timestamp()
                )
                
                # Update DB
                live_cap.category = analysis.get("category")
                live_cap.sub_category = analysis.get("sub_category")
                live_cap.summary = analysis.get("summary")
                live_cap.tags = analysis.get("tags", [])
                live_cap.ai_status = "completed"
                live_cap.error_message = None
                db.commit()
                print(f"Capture {live_cap.id} successfully re-processed: {live_cap.category}")
            except Exception as e:
                print(f"Error re-processing capture {cap.id}: {e}")
                db.rollback()
                
                # Retrieve fresh state in new transaction context to record failure reason
                try:
                    failed_cap = db.query(Capture).filter(Capture.id == cap.id).first()
                    if failed_cap:
                        failed_cap.ai_status = "failed"
                        failed_cap.error_message = f"AI Re-processing failed: {e}"
                        db.commit()
                except Exception as inner_e:
                    print(f"Failed to save error status for capture {cap.id}: {inner_e}")
                    db.rollback()
            finally:
                time.sleep(4.0)
                
        # Run a relinking pass for users whose captures were reprocessed
        user_ids = {cap.user_id for cap in mock_captures}
        for uid in user_ids:
            try:
                run_relinking_pass(uid)
            except Exception as e:
                print(f"Error running relinking pass for user {uid}: {e}")
                
    finally:
        db.close()

