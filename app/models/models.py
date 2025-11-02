from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid


class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    metadata = Column(JSON, nullable=True)
    source = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    embedding_records = relationship("EmbeddingRecord", back_populates="knowledge_item", cascade="all, delete-orphan")


class EmbeddingRecord(Base):
    __tablename__ = "embedding_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    knowledge_item_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_items.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    chunk_content = Column(Text, nullable=False)
    chunk_metadata = Column(JSON, nullable=True)
    qdrant_id = Column(String, nullable=True)  # Qdrant point ID
    embedding_model = Column(String, nullable=False)
    embedding_dimension = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    knowledge_item = relationship("KnowledgeItem", back_populates="embedding_records")