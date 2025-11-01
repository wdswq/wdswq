from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.models import KnowledgeItem, EmbeddingRecord
from app.services.embedding_service import EmbeddingService
from app.services.text_chunking_service import TextChunkingService
from app.services.qdrant_service import QdrantService
from app.core.logging import logger
from datetime import datetime


class VectorIndexingService:
    def __init__(self, db: Session):
        self.db = db
        self.embedding_service = EmbeddingService()
        self.text_chunking_service = TextChunkingService()
        self.qdrant_service = QdrantService()
        
        # Ensure Qdrant collection exists
        self.qdrant_service.ensure_collection_exists(self.embedding_service.dimension)
    
    def process_knowledge_item(self, knowledge_item_id: UUID) -> List[EmbeddingRecord]:
        try:
            knowledge_item = self.db.query(KnowledgeItem).filter(
                KnowledgeItem.id == knowledge_item_id
            ).first()
            
            if not knowledge_item:
                raise ValueError(f"KnowledgeItem with id {knowledge_item_id} not found")
            
            # Delete existing embedding records for this knowledge item
            self._delete_existing_embeddings(knowledge_item_id)
            
            # Chunk the text
            chunks = self.text_chunking_service.chunk_text(
                text=knowledge_item.content,
                metadata={
                    "knowledge_item_id": str(knowledge_item.id),
                    "title": knowledge_item.title,
                    "source": knowledge_item.source,
                    "created_at": knowledge_item.created_at.isoformat() if knowledge_item.created_at else None
                }
            )
            
            if not chunks:
                logger.warning(f"No chunks generated for knowledge item {knowledge_item_id}")
                return []
            
            # Generate embeddings
            chunk_texts = [chunk["content"] for chunk in chunks]
            embeddings = self.embedding_service.generate_embeddings(chunk_texts)
            
            # Prepare points for Qdrant
            qdrant_points = []
            embedding_records = []
            
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                # Create embedding record
                embedding_record = EmbeddingRecord(
                    knowledge_item_id=knowledge_item_id,
                    chunk_index=chunk["chunk_index"],
                    chunk_content=chunk["content"],
                    chunk_metadata=chunk["metadata"],
                    embedding_model=self.embedding_service.model_name,
                    embedding_dimension=self.embedding_service.dimension
                )
                embedding_records.append(embedding_record)
                
                # Prepare Qdrant point
                qdrant_point = {
                    "vector": embedding,
                    "payload": {
                        "knowledge_item_id": str(knowledge_item.id),
                        "chunk_index": chunk["chunk_index"],
                        "content": chunk["content"],
                        "title": knowledge_item.title,
                        "source": knowledge_item.source,
                        "metadata": chunk["metadata"]
                    }
                }
                qdrant_points.append(qdrant_point)
            
            # Upsert to Qdrant
            qdrant_ids = self.qdrant_service.upsert_points(qdrant_points)
            
            # Update embedding records with Qdrant IDs
            for record, qdrant_id in zip(embedding_records, qdrant_ids):
                record.qdrant_id = qdrant_id
            
            # Save embedding records to database
            self.db.add_all(embedding_records)
            self.db.commit()
            
            logger.info(f"Processed knowledge item {knowledge_item_id}: created {len(embedding_records)} embedding records")
            return embedding_records
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error processing knowledge item {knowledge_item_id}: {e}")
            raise
    
    def update_knowledge_item(self, knowledge_item_id: UUID) -> List[EmbeddingRecord]:
        return self.process_knowledge_item(knowledge_item_id)
    
    def delete_knowledge_item_embeddings(self, knowledge_item_id: UUID):
        try:
            # Get all embedding records for this knowledge item
            embedding_records = self.db.query(EmbeddingRecord).filter(
                EmbeddingRecord.knowledge_item_id == knowledge_item_id
            ).all()
            
            if not embedding_records:
                logger.warning(f"No embedding records found for knowledge item {knowledge_item_id}")
                return
            
            # Delete from Qdrant
            qdrant_ids = [record.qdrant_id for record in embedding_records if record.qdrant_id]
            if qdrant_ids:
                self.qdrant_service.delete_points(qdrant_ids)
            
            # Delete from database
            self._delete_existing_embeddings(knowledge_item_id)
            
            logger.info(f"Deleted embeddings for knowledge item {knowledge_item_id}")
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting embeddings for knowledge item {knowledge_item_id}: {e}")
            raise
    
    def _delete_existing_embeddings(self, knowledge_item_id: UUID):
        # Get existing records to delete from Qdrant
        existing_records = self.db.query(EmbeddingRecord).filter(
            EmbeddingRecord.knowledge_item_id == knowledge_item_id
        ).all()
        
        # Delete from Qdrant if they have Qdrant IDs
        qdrant_ids = [record.qdrant_id for record in existing_records if record.qdrant_id]
        if qdrant_ids:
            self.qdrant_service.delete_points(qdrant_ids)
        
        # Delete from database
        self.db.query(EmbeddingRecord).filter(
            EmbeddingRecord.knowledge_item_id == knowledge_item_id
        ).delete()
        self.db.commit()
    
    def search_similar_content(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            # Generate embedding for query
            query_embedding = self.embedding_service.generate_embeddings([query])[0]
            
            # Search in Qdrant
            results = self.qdrant_service.search_similar(query_embedding, limit=limit)
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching similar content: {e}")
            raise
    
    def get_embedding_stats(self) -> Dict[str, Any]:
        try:
            total_records = self.db.query(EmbeddingRecord).count()
            collection_info = self.qdrant_service.get_collection_info()
            
            return {
                "total_embedding_records": total_records,
                "qdrant_collection_info": collection_info.points_count if collection_info else 0,
                "embedding_model": self.embedding_service.model_name,
                "embedding_dimension": self.embedding_service.dimension
            }
            
        except Exception as e:
            logger.error(f"Error getting embedding stats: {e}")
            return {}