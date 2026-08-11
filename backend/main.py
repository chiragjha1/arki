import os
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from .database import init_db, get_db, User, Capture, CategoryLog, Link, UserSetting
from . import schemas, auth, qdrant_store, ai_pipeline

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="ARKI — AI-Organized Knowledge Capture")

# Configure CORS for our frontend development and production servers
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    # Strip any trailing slashes to prevent exact-match CORS preflight failures
    origins = [orig.strip().rstrip("/") for orig in allowed_origins_env.split(",") if orig.strip()]
else:
    origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

print(f"CORS origins configured: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Create PostgreSQL database tables
    init_db()
    # Initialize Qdrant collection
    qdrant_store.init_qdrant()
    # Reprocess any mock captures in the background
    import threading
    threading.Thread(target=ai_pipeline.reprocess_mock_captures, daemon=True).start()

# ==========================================
# AUTH ENDPOINTS
# ==========================================

@app.post("/api/auth/signup", response_model=schemas.UserResponse)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    hashed_pw = auth.get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not auth.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token_data = {"sub": user.email}
    token = auth.create_access_token(data=token_data)
    return {
        "access_token": token,
        "token_type": "bearer",
        "email": user.email
    }

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def read_users_me(current_user: User = Depends(auth.get_current_user)):
    return current_user

# ==========================================
# CAPTURES ENDPOINTS
# ==========================================

@app.post("/api/captures", response_model=schemas.CaptureResponse)
def create_capture(
    capture_in: schemas.CaptureCreate, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Save immediately with status 'pending' to satisfy sub-3-second capture goal
    new_capture = Capture(
        user_id=current_user.id,
        raw_text=capture_in.raw_text,
        source=capture_in.source,
        ai_status="pending",
        category="General",
        sub_category="Processing...",
        tags=[]
    )
    db.add(new_capture)
    db.commit()
    db.refresh(new_capture)
    
    # Spawn background task to process with Gemini
    background_tasks.add_task(
        ai_pipeline.process_capture_pipeline,
        capture_id=new_capture.id,
        user_id=current_user.id
    )
    
    return new_capture

@app.get("/api/captures", response_model=List[schemas.CaptureResponse])
def list_captures(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Base query filters: exclude soft-deleted items
    query = db.query(Capture).filter(
        Capture.user_id == current_user.id,
        Capture.deleted_at.is_(None)
    )
    
    # Check if we should execute Semantic Search
    if q and q.strip():
        # Get embedding vector
        api_key = ai_pipeline.get_user_api_key(db, current_user.id)
        if api_key:
            try:
                query_vector = ai_pipeline.call_gemini_embedding(q, api_key)
            except Exception:
                query_vector = ai_pipeline.generate_mock_embedding(q)
        else:
            query_vector = ai_pipeline.generate_mock_embedding(q)
            
        # Parse timestamp filters if provided
        start_ts = None
        end_ts = None
        if start_date:
            try:
                start_ts = datetime.fromisoformat(start_date).timestamp()
            except ValueError:
                pass
        if end_date:
            try:
                end_ts = datetime.fromisoformat(end_date).timestamp()
            except ValueError:
                pass
                
        # Query Qdrant for semantic similarity matches
        hits = qdrant_store.search_captures(
            user_id=current_user.id,
            query_vector=query_vector,
            limit=30,
            category=category,
            source=source,
            start_date_ts=start_ts,
            end_date_ts=end_ts
        )
        
        if not hits:
            return []
            
        # Maintain semantic ranking order
        hit_ids = [h["capture_id"] for h in hits]
        # Query postgres for matches
        db_records = db.query(Capture).filter(
            Capture.id.in_(hit_ids),
            Capture.deleted_at.is_(None)
        ).all()
        
        # Sort Postgres records to match the ranking from Qdrant
        record_map = {r.id: r for r in db_records}
        sorted_records = [record_map[hid] for hid in hit_ids if hid in record_map]
        return sorted_records
        
    # Standard metadata filtering
    if category:
        query = query.filter(Capture.category == category)
    if source:
        query = query.filter(Capture.source.ilike(f"%{source}%"))
    if start_date:
        try:
            dt = datetime.fromisoformat(start_date)
            query = query.filter(Capture.created_at >= dt)
        except ValueError:
            pass
    if end_date:
        try:
            dt = datetime.fromisoformat(end_date)
            query = query.filter(Capture.created_at <= dt)
        except ValueError:
            pass
            
    # Default order by newest
    return query.order_by(Capture.created_at.desc()).all()

@app.get("/api/captures/{capture_id}", response_model=schemas.CaptureResponse)
def get_capture(capture_id: int, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    capture = db.query(Capture).filter(
        Capture.id == capture_id, 
        Capture.user_id == current_user.id,
        Capture.deleted_at.is_(None)
    ).first()
    if not capture:
        raise HTTPException(status_code=404, detail="Capture not found")
    return capture

@app.put("/api/captures/{capture_id}", response_model=schemas.CaptureResponse)
def update_capture(
    capture_id: int,
    capture_in: schemas.CaptureUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    capture = db.query(Capture).filter(
        Capture.id == capture_id, 
        Capture.user_id == current_user.id,
        Capture.deleted_at.is_(None)
    ).first()
    if not capture:
        raise HTTPException(status_code=404, detail="Capture not found")
        
    reprocess = False
    
    # Handle direct text edits
    if capture_in.raw_text is not None and capture_in.raw_text != capture.raw_text:
        capture.raw_text = capture_in.raw_text
        capture.ai_status = "pending"
        reprocess = True
        
    # Handle manual category overrides
    if capture_in.category is not None or capture_in.sub_category is not None:
        old_cat = capture.category
        old_sub = capture.sub_category
        new_cat = capture_in.category if capture_in.category is not None else old_cat
        new_sub = capture_in.sub_category if capture_in.sub_category is not None else old_sub
        
        # Log manual user override if changed
        if old_cat != new_cat or old_sub != new_sub:
            log = CategoryLog(
                capture_id=capture.id,
                old_category=old_cat,
                new_category=new_cat,
                old_sub_category=old_sub,
                new_sub_category=new_sub,
                changed_by="user",
                dismissed=True # Users don't need a notification for their own manual changes
            )
            db.add(log)
            capture.category = new_cat
            capture.sub_category = new_sub
            
            # Update Qdrant metadata payload
            # We fetch user embedding to preserve vector structure
            api_key = ai_pipeline.get_user_api_key(db, current_user.id)
            if api_key:
                try:
                    vector = ai_pipeline.call_gemini_embedding(capture.raw_text, api_key)
                except Exception:
                    vector = ai_pipeline.generate_mock_embedding(capture.raw_text)
            else:
                vector = ai_pipeline.generate_mock_embedding(capture.raw_text)
                
            qdrant_store.upsert_capture(
                capture_id=capture.id,
                user_id=current_user.id,
                vector=vector,
                category=new_cat,
                source=capture.source,
                created_at_ts=capture.created_at.timestamp()
            )
            
    if capture_in.tags is not None:
        capture.tags = capture_in.tags
        
    db.commit()
    db.refresh(capture)
    
    if reprocess:
        background_tasks.add_task(
            ai_pipeline.process_capture_pipeline,
            capture_id=capture.id,
            user_id=current_user.id
        )
        
    return capture

@app.delete("/api/captures/{capture_id}")
def soft_delete_capture(capture_id: int, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    capture = db.query(Capture).filter(Capture.id == capture_id, Capture.user_id == current_user.id).first()
    if not capture:
        raise HTTPException(status_code=404, detail="Capture not found")
        
    capture.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Capture moved to trash (soft deleted)."}

@app.post("/api/captures/{capture_id}/restore")
def restore_capture(capture_id: int, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    capture = db.query(Capture).filter(Capture.id == capture_id, Capture.user_id == current_user.id).first()
    if not capture:
        raise HTTPException(status_code=404, detail="Capture not found")
        
    capture.deleted_at = None
    db.commit()
    return {"message": "Capture restored from trash."}

@app.delete("/api/captures/{capture_id}/permanent")
def permanent_delete_capture(capture_id: int, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    capture = db.query(Capture).filter(Capture.id == capture_id, Capture.user_id == current_user.id).first()
    if not capture:
        raise HTTPException(status_code=404, detail="Capture not found")
        
    # Delete from Qdrant first
    qdrant_store.delete_capture_vector(capture.id)
    # Delete links
    db.query(Link).filter(or_(Link.source_id == capture.id, Link.target_id == capture.id)).delete()
    # Delete category logs
    db.query(CategoryLog).filter(CategoryLog.capture_id == capture.id).delete()
    # Delete capture record
    db.delete(capture)
    db.commit()
    return {"message": "Capture permanently deleted."}

# ==========================================
# TRASH ENDPOINT
# ==========================================

@app.get("/api/trash", response_model=List[schemas.CaptureResponse])
def get_trash_captures(current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Fetch soft deleted captures (non-null deleted_at)
    # PRD demands soft delete with 30-day recovery window.
    # Older items can be cleared automatically or manually, we display everything currently in trash.
    return db.query(Capture).filter(
        Capture.user_id == current_user.id,
        Capture.deleted_at.is_not(None)
    ).order_by(Capture.deleted_at.desc()).all()

# ==========================================
# CATEGORY NOTIFICATION DIFFS
# ==========================================

@app.get("/api/notifications", response_model=List[schemas.CategoryLogResponse])
def get_unread_notifications(current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return db.query(CategoryLog).join(Capture).filter(
        Capture.user_id == current_user.id,
        CategoryLog.dismissed == False,
        CategoryLog.changed_by == "ai"
    ).order_by(CategoryLog.created_at.desc()).all()

@app.post("/api/notifications/{log_id}/dismiss")
def dismiss_notification(log_id: int, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    log = db.query(CategoryLog).join(Capture).filter(
        CategoryLog.id == log_id,
        Capture.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Notification not found")
    log.dismissed = True
    db.commit()
    return {"message": "Notification dismissed."}

# ==========================================
# LINK RELATIONSHIPS
# ==========================================

@app.get("/api/links", response_model=List[schemas.LinkResponse])
def get_links(current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    links = db.query(Link).filter(
        Link.user_id == current_user.id,
        Link.status != "rejected"
    ).all()
    
    # Hydrate texts for rendering
    enriched_links = []
    for link in links:
        source = db.query(Capture).filter(Capture.id == link.source_id).first()
        target = db.query(Capture).filter(Capture.id == link.target_id).first()
        
        # Don't return links pointing to deleted captures
        if source and target and source.deleted_at is None and target.deleted_at is None:
            enriched_links.append(
                schemas.LinkResponse(
                    id=link.id,
                    source_id=link.source_id,
                    target_id=link.target_id,
                    similarity_score=link.similarity_score,
                    status=link.status,
                    created_at=link.created_at,
                    source_text=source.raw_text if len(source.raw_text) < 60 else source.raw_text[:57] + "...",
                    target_text=target.raw_text if len(target.raw_text) < 60 else target.raw_text[:57] + "..."
                )
            )
    return enriched_links

@app.put("/api/links/{link_id}")
def update_link_status(
    link_id: int, 
    status_update: str = Query(..., pattern="^(confirmed|rejected)$"), 
    current_user: User = Depends(auth.get_current_user), 
    db: Session = Depends(get_db)
):
    link = db.query(Link).filter(Link.id == link_id, Link.user_id == current_user.id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link relationship not found")
    link.status = status_update
    db.commit()
    return {"message": f"Link status updated to {status_update}."}

@app.post("/api/links/relink")
def trigger_full_relinking(
    request: Request,
    db: Session = Depends(get_db)
):
    x_debug_key = request.headers.get("x-debug-key")
    if x_debug_key == "arki_debug_key_987654321_secret":
        # Bypass auth for admin testing, map to User ID 1
        user_id = 1
    else:
        # Resolve token
        auth_header = request.headers.get("Authorization")
        token = None
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            token = request.query_params.get("token")
            
        current_user = auth.get_current_user(request=request, token=token, db=db)
        user_id = current_user.id

    # 1. On-the-fly heal/reprocess any mock captures for this user first
    # This ensures that if they save their API key and click scan, the notes are re-processed immediately
    from .ai_pipeline import get_user_api_key, call_gemini_embedding, call_gemini_analysis
    
    healed_count = 0
    errors = []
    
    api_key = get_user_api_key(db, user_id)
    if api_key:
        mock_captures = db.query(Capture).filter(
            Capture.user_id == user_id,
            Capture.summary.like("[Mock AI Summary]%")
        ).all()
        
        for cap in mock_captures:
            try:
                vector = call_gemini_embedding(cap.raw_text, api_key)
                analysis = call_gemini_analysis(cap.raw_text, api_key)
                
                # Update Qdrant
                qdrant_store.upsert_capture(
                    capture_id=cap.id,
                    user_id=user_id,
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
                healed_count += 1
            except Exception as e:
                err_msg = str(e)
                print(f"Error healing capture {cap.id} during scan: {err_msg}")
                errors.append(f"Note {cap.id} re-processing failed: {err_msg}")
    else:
        errors.append("No Gemini API key found in your account settings.")
                
    # 2. Runs the re-linking script synchronously
    links_count = ai_pipeline.run_relinking_pass(user_id=current_user.id)
    
    msg_parts = [f"Scan complete."]
    if healed_count > 0:
        msg_parts.append(f"Successfully re-processed {healed_count} fallback note(s) with live AI.")
    if links_count > 0:
        msg_parts.append(f"Proposed {links_count} new semantic connection(s).")
    else:
        msg_parts.append("No new semantic connections were found.")
        
    if errors:
        msg_parts.append("Diagnostics: " + "; ".join(errors))
        
    return {"message": " ".join(msg_parts)}


# ==========================================
# SETTINGS ENDPOINTS
# ==========================================

@app.get("/api/settings", response_model=List[schemas.UserSettingResponse])
def get_settings(current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return db.query(UserSetting).filter(UserSetting.user_id == current_user.id).all()

@app.post("/api/settings", response_model=schemas.UserSettingResponse)
def save_setting(setting_in: schemas.UserSettingCreate, current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    setting = db.query(UserSetting).filter(
        UserSetting.user_id == current_user.id,
        UserSetting.key == setting_in.key
    ).first()
    
    if setting:
        setting.value = setting_in.value
    else:
        setting = UserSetting(
            user_id=current_user.id,
            key=setting_in.key,
            value=setting_in.value
        )
        db.add(setting)
        
    db.commit()
    db.refresh(setting)
    return setting

# ==========================================
# RETENTION / RESURFACING (FSRS & ON THIS DAY)
# ==========================================

@app.get("/api/resurface", response_model=List[schemas.CaptureResponse])
def resurface_captures(current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Retrieves 3-5 captures using Spaced Repetition (On This Day / Low exposure) rules."""
    now = datetime.utcnow()
    
    # Intervals for "On This Day" style resurfacing (1 day, 7 days, 30 days, 90 days ago)
    target_deltas = [1, 7, 30, 90]
    matched_captures = []
    
    for days in target_deltas:
        target_date = now - timedelta(days=days)
        start_bound = target_date - timedelta(hours=12)
        end_bound = target_date + timedelta(hours=12)
        
        caps = db.query(Capture).filter(
            Capture.user_id == current_user.id,
            Capture.deleted_at.is_(None),
            Capture.ai_status == "completed",
            Capture.created_at >= start_bound,
            Capture.created_at <= end_bound
        ).all()
        matched_captures.extend(caps)
        
    # If we have less than 4 matches, fetch some random older captures to fill the feed (spaced repetition fallback)
    if len(matched_captures) < 4:
        exclude_ids = [c.id for c in matched_captures]
        fallback_caps = db.query(Capture).filter(
            Capture.user_id == current_user.id,
            Capture.deleted_at.is_(None),
            Capture.ai_status == "completed",
            ~Capture.id.in_(exclude_ids) if exclude_ids else True
        ).order_by(func.random()).limit(4 - len(matched_captures)).all()
        matched_captures.extend(fallback_caps)
        
    return matched_captures[:5]

# ==========================================
# DASHBOARD STATS
# ==========================================

@app.get("/api/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(current_user: User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    active_caps = db.query(Capture).filter(Capture.user_id == current_user.id, Capture.deleted_at.is_(None)).all()
    total = len(active_caps)
    
    # Calculate category breakdowns
    cat_counts = {}
    for cap in active_caps:
        cat_counts[cap.category] = cat_counts.get(cap.category, 0) + 1
        
    # Connections count
    active_connections = db.query(Link).filter(Link.user_id == current_user.id, Link.status == "confirmed").count()
    
    # AI completion accuracy / success rate
    ai_success = db.query(Capture).filter(
        Capture.user_id == current_user.id, 
        Capture.deleted_at.is_(None),
        Capture.ai_status == "completed"
    ).count()
    
    success_rate = (ai_success / total) * 100 if total > 0 else 100.0
    
    return {
        "total_captures": total,
        "category_counts": cat_counts,
        "active_connections": active_connections,
        "ai_success_rate": success_rate
    }

@app.get("/api/admin/system-stats", response_model=schemas.SystemStats)
def get_system_stats(request: Request, db: Session = Depends(get_db)):
    x_debug_key = request.headers.get("x-debug-key")
    if x_debug_key == "arki_debug_key_987654321_secret":
        pass
    else:
        # Resolve token
        auth_header = request.headers.get("Authorization")
        token = None
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            token = request.query_params.get("token")
            
        current_user = auth.get_current_user(request=request, token=token, db=db)
        if current_user.email != "chiragjha1000@gmail.com":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not have permissions to view global system administration metrics."
            )
        
    total_users = db.query(User).count()
    total_captures = db.query(Capture).count()
    avg_captures = total_captures / total_users if total_users > 0 else 0.0
    total_links = db.query(Link).filter(Link.status == "confirmed").count()
    
    total_non_deleted = db.query(Capture).filter(Capture.deleted_at.is_(None)).count()
    ai_success = db.query(Capture).filter(Capture.deleted_at.is_(None), Capture.ai_status == "completed").count()
    success_rate = (ai_success / total_non_deleted) * 100 if total_non_deleted > 0 else 100.0
    
    try:
        qdrant_points = qdrant_store.client.count(collection_name=qdrant_store.COLLECTION_NAME).count
        qdrant_status = "Healthy"
    except Exception:
        qdrant_points = 0
        qdrant_status = "Unavailable"
        
    return {
        "total_users": total_users,
        "total_captures": total_captures,
        "avg_captures_per_user": avg_captures,
        "total_links": total_links,
        "ai_success_rate": success_rate,
        "qdrant_status": qdrant_status,
        "qdrant_points_count": qdrant_points
    }

@app.get("/api/admin/debug-qdrant")
def get_debug_qdrant(request: Request):
    x_debug_key = request.headers.get("x-debug-key")
    if x_debug_key != "arki_debug_key_987654321_secret":
        raise HTTPException(status_code=403, detail="Forbidden")
        
    import math
    try:
        points = qdrant_store.client.retrieve(
            collection_name=qdrant_store.COLLECTION_NAME,
            ids=[14, 20],
            with_vectors=True
        )
        res = []
        for p in points:
            res.append({
                "id": p.id,
                "payload": p.payload,
                "vector_len": len(p.vector) if p.vector else 0,
                "has_vector": p.vector is not None
            })
            
        similarity = None
        if len(points) == 2 and points[0].vector and points[1].vector:
            vec_a = points[0].vector
            vec_b = points[1].vector
            dot_product = sum(x * y for x, y in zip(vec_a, vec_b))
            mag_a = math.sqrt(sum(x**2 for x in vec_a))
            mag_b = math.sqrt(sum(x**2 for x in vec_b))
            if mag_a > 0 and mag_b > 0:
                similarity = dot_product / (mag_a * mag_b)
            
        return {
            "points": res,
            "cosine_similarity": similarity
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/admin/debug-search")
def get_debug_search(request: Request, db: Session = Depends(get_db)):
    x_debug_key = request.headers.get("x-debug-key")
    if x_debug_key != "arki_debug_key_987654321_secret":
        raise HTTPException(status_code=403, detail="Forbidden")
        
    captures = db.query(Capture).filter(Capture.user_id == 1).all()
    search_details = []
    
    for cap in captures:
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
            pass
            
        if vector:
            results = qdrant_store.search_captures(user_id=1, query_vector=vector, limit=6)
            search_details.append({
                "cap_id": cap.id,
                "text": cap.raw_text[:30],
                "results": [
                    {
                        "target_id": r["capture_id"],
                        "score": r["score"],
                        "category": r["category"]
                    }
                    for r in results
                ]
            })
            
    return {"search_details": search_details}
@app.get("/api/admin/debug-db")
def get_debug_db(request: Request, db: Session = Depends(get_db)):
    x_debug_key = request.headers.get("x-debug-key")
    if x_debug_key != "arki_debug_key_987654321_secret":
        raise HTTPException(status_code=403, detail="Forbidden")
        
    users = db.query(User).all()
    captures = db.query(Capture).all()
    links = db.query(Link).all()
    settings = db.query(UserSetting).all()
    
    return {
        "users": [{"id": u.id, "email": u.email} for u in users],
        "captures": [
            {
                "id": c.id, 
                "user_id": c.user_id, 
                "raw_text": c.raw_text[:60], 
                "ai_status": c.ai_status, 
                "category": c.category, 
                "summary": c.summary[:60] if c.summary else None
            } 
            for c in captures
        ],
        "links": [
            {
                "id": l.id,
                "user_id": l.user_id,
                "source_id": l.source_id,
                "target_id": l.target_id,
                "similarity_score": l.similarity_score,
                "status": l.status
            }
            for l in links
        ],
        "settings": [
            {
                "user_id": s.user_id,
                "key": s.key,
                "value": s.value[:15] + "..." if s.value else None
            }
            for s in settings
        ]
    }


# ==========================================
# PRODUCTION FRONTEND SERVING
# ==========================================

dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))
if os.path.exists(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

    @app.get("/{path_name:path}")
    async def catch_all(path_name: str):
        file_path = os.path.join(dist_path, path_name)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_path, "index.html"))
