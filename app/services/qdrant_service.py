from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
import uuid
from app.core.config import settings
from app.core.logging import logger


class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key if settings.qdrant_api_key else None
        )
        self.collection_name = "knowledge_embeddings"
    
    def ensure_collection_exists(self, vector_size: int):
        try:
            collections = self.client.get_collections().collections
            collection_exists = any(c.name == self.collection_name for c in collections)
            
            if not collection_exists:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
                )
                logger.info(f"Created Qdrant collection: {self.collection_name}")
            else:
                logger.info(f"Qdrant collection {self.collection_name} already exists")
        except Exception as e:
            logger.error(f"Error ensuring collection exists: {e}")
            raise
    
    def upsert_points(self, points: List[Dict[str, Any]]) -> List[str]:
        try:
            qdrant_points = []
            point_ids = []
            
            for point_data in points:
                point_id = str(uuid.uuid4())
                point_ids.append(point_id)
                
                qdrant_point = PointStruct(
                    id=point_id,
                    vector=point_data["vector"],
                    payload=point_data["payload"]
                )
                qdrant_points.append(qdrant_point)
            
            self.client.upsert(
                collection_name=self.collection_name,
                points=qdrant_points
            )
            
            logger.info(f"Upserted {len(qdrant_points)} points to Qdrant")
            return point_ids
            
        except Exception as e:
            logger.error(f"Error upserting points to Qdrant: {e}")
            raise
    
    def delete_points(self, point_ids: List[str]):
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=point_ids
            )
            logger.info(f"Deleted {len(point_ids)} points from Qdrant")
        except Exception as e:
            logger.error(f"Error deleting points from Qdrant: {e}")
            raise
    
    def search_similar(self, query_vector: List[float], limit: int = 10, 
                      knowledge_item_id: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            search_filter = None
            if knowledge_item_id:
                search_filter = Filter(
                    must=[
                        FieldCondition(
                            key="knowledge_item_id",
                            match=MatchValue(value=knowledge_item_id)
                        )
                    ]
                )
            
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=search_filter,
                limit=limit,
                with_payload=True,
                with_vectors=False
            )
            
            search_results = []
            for result in results:
                search_results.append({
                    "id": str(result.id),
                    "score": result.score,
                    "payload": result.payload
                })
            
            return search_results
            
        except Exception as e:
            logger.error(f"Error searching in Qdrant: {e}")
            raise
    
    def get_collection_info(self):
        try:
            return self.client.get_collection(self.collection_name)
        except Exception as e:
            logger.error(f"Error getting collection info: {e}")
            return None