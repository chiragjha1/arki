from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# User auth schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    email: str

# Capture schemas
class CaptureCreate(BaseModel):
    raw_text: str
    source: Optional[str] = None

class CaptureUpdate(BaseModel):
    raw_text: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    tags: Optional[List[str]] = None

class CaptureResponse(BaseModel):
    id: int
    user_id: int
    raw_text: str
    source: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    summary: Optional[str] = None
    tags: List[str] = []
    ai_status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Category transition logs
class CategoryLogResponse(BaseModel):
    id: int
    capture_id: int
    old_category: Optional[str] = None
    new_category: Optional[str] = None
    old_sub_category: Optional[str] = None
    new_sub_category: Optional[str] = None
    changed_by: str
    dismissed: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Relationship edge schemas
class LinkResponse(BaseModel):
    id: int
    source_id: int
    target_id: int
    similarity_score: float
    status: str
    created_at: datetime
    source_text: Optional[str] = None
    target_text: Optional[str] = None

    class Config:
        from_attributes = True

# User settings schemas
class UserSettingCreate(BaseModel):
    key: str
    value: str

class UserSettingResponse(BaseModel):
    key: str
    value: str

    class Config:
        from_attributes = True

# Dashboard aggregated stats
class DashboardStats(BaseModel):
    total_captures: int
    category_counts: dict
    active_connections: int
    ai_success_rate: float

# System-wide metrics schema
class SystemStats(BaseModel):
    total_users: int
    total_captures: int
    avg_captures_per_user: float
    total_links: int
    ai_success_rate: float
    qdrant_status: str
    qdrant_points_count: int

# API Usage response schema
class ApiUsageResponse(BaseModel):
    requests_today: int
    daily_limit: int
    remaining_today: int
    recent_errors: List[str]

