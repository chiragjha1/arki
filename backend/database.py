import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from dotenv import load_dotenv

load_dotenv()

# PRD backend primary DB: PostgreSQL.
# Falls back to local SQLite database in case PostgreSQL is unavailable (e.g. for simple local fallback testing),
# but default is connecting to PostgreSQL container running on localhost.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/arki")

# Add SQLite-compatible arguments if SQLite is used
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    captures = relationship("Capture", back_populates="user", cascade="all, delete-orphan")
    links = relationship("Link", back_populates="user", cascade="all, delete-orphan")

class Capture(Base):
    __tablename__ = "captures"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    raw_text = Column(Text, nullable=False)
    source = Column(String, nullable=True)
    category = Column(String, nullable=True)
    sub_category = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    tags = Column(JSON, default=list) # JSON list of strings (e.g. ["ai", "learning"])
    ai_status = Column(String, default="pending") # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True) # soft delete timestamp
    
    user = relationship("User", back_populates="captures")
    category_logs = relationship("CategoryLog", back_populates="capture", cascade="all, delete-orphan")

class CategoryLog(Base):
    __tablename__ = "category_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    capture_id = Column(Integer, ForeignKey("captures.id"), nullable=False)
    old_category = Column(String, nullable=True)
    new_category = Column(String, nullable=True)
    old_sub_category = Column(String, nullable=True)
    new_sub_category = Column(String, nullable=True)
    changed_by = Column(String, default="ai") # ai or user
    dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    capture = relationship("Capture", back_populates="category_logs")

class Link(Base):
    __tablename__ = "links"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source_id = Column(Integer, ForeignKey("captures.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("captures.id"), nullable=False)
    similarity_score = Column(Float, nullable=False)
    status = Column(String, default="suggested") # suggested, confirmed, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="links")

class UserSetting(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    key = Column(String, nullable=False)
    value = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
