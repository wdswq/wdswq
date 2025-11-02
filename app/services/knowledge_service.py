from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.models import KnowledgeItem, EmbeddingRecord
from app.core.logging import logger


class KnowledgeService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_knowledge_item(self, title: str, content: str, source: Optional[str] = None, 
                            metadata: Optional[dict] = None) -> KnowledgeItem:
        try:
            knowledge_item = KnowledgeItem(
                title=title,
                content=content,
                source=source,
                metadata=metadata or {}
            )
            
            self.db.add(knowledge_item)
            self.db.commit()
            self.db.refresh(knowledge_item)
            
            logger.info(f"Created knowledge item: {knowledge_item.id}")
            return knowledge_item
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating knowledge item: {e}")
            raise
    
    def get_knowledge_item(self, item_id: UUID) -> Optional[KnowledgeItem]:
        return self.db.query(KnowledgeItem).filter(KnowledgeItem.id == item_id).first()
    
    def get_all_knowledge_items(self, skip: int = 0, limit: int = 100) -> List[KnowledgeItem]:
        return self.db.query(KnowledgeItem).filter(KnowledgeItem.is_active == True).offset(skip).limit(limit).all()
    
    def update_knowledge_item(self, item_id: UUID, title: Optional[str] = None, 
                             content: Optional[str] = None, source: Optional[str] = None,
                             metadata: Optional[dict] = None) -> Optional[KnowledgeItem]:
        try:
            knowledge_item = self.get_knowledge_item(item_id)
            if not knowledge_item:
                return None
            
            if title is not None:
                knowledge_item.title = title
            if content is not None:
                knowledge_item.content = content
            if source is not None:
                knowledge_item.source = source
            if metadata is not None:
                knowledge_item.metadata = metadata
            
            self.db.commit()
            self.db.refresh(knowledge_item)
            
            logger.info(f"Updated knowledge item: {knowledge_item.id}")
            return knowledge_item
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating knowledge item {item_id}: {e}")
            raise
    
    def delete_knowledge_item(self, item_id: UUID) -> bool:
        try:
            knowledge_item = self.get_knowledge_item(item_id)
            if not knowledge_item:
                return False
            
            # Soft delete
            knowledge_item.is_active = False
            self.db.commit()
            
            logger.info(f"Soft deleted knowledge item: {item_id}")
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting knowledge item {item_id}: {e}")
            raise
    
    def get_knowledge_item_embeddings(self, item_id: UUID) -> List[EmbeddingRecord]:
        return self.db.query(EmbeddingRecord).filter(
            EmbeddingRecord.knowledge_item_id == item_id
        ).order_by(EmbeddingRecord.chunk_index).all()