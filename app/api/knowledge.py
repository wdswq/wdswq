from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from app.core.database import get_db
from app.services.knowledge_service import KnowledgeService
from app.services.vector_indexing_service import VectorIndexingService
from app.core.logging import logger

router = APIRouter()


class KnowledgeItemCreate(BaseModel):
    title: str
    content: str
    source: Optional[str] = None
    metadata: Optional[dict] = None


class KnowledgeItemUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    source: Optional[str] = None
    metadata: Optional[dict] = None


class KnowledgeItemResponse(BaseModel):
    id: str
    title: str
    content: str
    source: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: str
    updated_at: str
    is_active: bool
    
    class Config:
        from_attributes = True


class SearchRequest(BaseModel):
    query: str
    limit: int = 10


class SearchResponse(BaseModel):
    id: str
    score: float
    payload: dict


@router.post("/knowledge-items", response_model=KnowledgeItemResponse)
async def create_knowledge_item(
    item: KnowledgeItemCreate,
    db: Session = Depends(get_db)
):
    try:
        knowledge_service = KnowledgeService(db)
        vector_service = VectorIndexingService(db)
        
        # Create knowledge item
        knowledge_item = knowledge_service.create_knowledge_item(
            title=item.title,
            content=item.content,
            source=item.source,
            metadata=item.metadata
        )
        
        # Process for vector indexing
        vector_service.process_knowledge_item(knowledge_item.id)
        
        return KnowledgeItemResponse.from_orm(knowledge_item)
        
    except Exception as e:
        logger.error(f"Error creating knowledge item: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/knowledge-items", response_model=List[KnowledgeItemResponse])
async def get_knowledge_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    try:
        knowledge_service = KnowledgeService(db)
        items = knowledge_service.get_all_knowledge_items(skip=skip, limit=limit)
        return [KnowledgeItemResponse.from_orm(item) for item in items]
    except Exception as e:
        logger.error(f"Error getting knowledge items: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/knowledge-items/{item_id}", response_model=KnowledgeItemResponse)
async def get_knowledge_item(
    item_id: UUID,
    db: Session = Depends(get_db)
):
    try:
        knowledge_service = KnowledgeService(db)
        item = knowledge_service.get_knowledge_item(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Knowledge item not found")
        return KnowledgeItemResponse.from_orm(item)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting knowledge item: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/knowledge-items/{item_id}", response_model=KnowledgeItemResponse)
async def update_knowledge_item(
    item_id: UUID,
    item_update: KnowledgeItemUpdate,
    db: Session = Depends(get_db)
):
    try:
        knowledge_service = KnowledgeService(db)
        vector_service = VectorIndexingService(db)
        
        # Update knowledge item
        item = knowledge_service.update_knowledge_item(
            item_id=item_id,
            title=item_update.title,
            content=item_update.content,
            source=item_update.source,
            metadata=item_update.metadata
        )
        
        if not item:
            raise HTTPException(status_code=404, detail="Knowledge item not found")
        
        # Update vector embeddings
        vector_service.update_knowledge_item(item_id)
        
        return KnowledgeItemResponse.from_orm(item)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating knowledge item: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/knowledge-items/{item_id}")
async def delete_knowledge_item(
    item_id: UUID,
    db: Session = Depends(get_db)
):
    try:
        knowledge_service = KnowledgeService(db)
        vector_service = VectorIndexingService(db)
        
        # Delete vector embeddings
        vector_service.delete_knowledge_item_embeddings(item_id)
        
        # Soft delete knowledge item
        success = knowledge_service.delete_knowledge_item(item_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Knowledge item not found")
        
        return {"message": "Knowledge item deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting knowledge item: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search", response_model=List[SearchResponse])
async def search_knowledge(
    search_request: SearchRequest,
    db: Session = Depends(get_db)
):
    try:
        vector_service = VectorIndexingService(db)
        results = vector_service.search_similar_content(
            query=search_request.query,
            limit=search_request.limit
        )
        
        return [SearchResponse(**result) for result in results]
        
    except Exception as e:
        logger.error(f"Error searching knowledge: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_embedding_stats(db: Session = Depends(get_db)):
    try:
        vector_service = VectorIndexingService(db)
        stats = vector_service.get_embedding_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))