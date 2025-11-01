#!/usr/bin/env python3
"""
Test script for the vector indexing system
"""
import os
import sys

# Add the app directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.services.knowledge_service import KnowledgeService
from app.services.vector_indexing_service import VectorIndexingService
from app.core.logging import logger


def test_basic_functionality():
    """Test basic functionality of the vector indexing system"""
    try:
        print("Testing Vector Indexing System...")
        
        # Create database tables
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Initialize services
        db = SessionLocal()
        knowledge_service = KnowledgeService(db)
        vector_service = VectorIndexingService(db)
        
        # Create a test knowledge item
        print("Creating test knowledge item...")
        test_item = knowledge_service.create_knowledge_item(
            title="Test Article",
            content="This is a test article about vector indexing. It contains multiple sentences that should be chunked and embedded. The system should process this content and create vector embeddings for semantic search.",
            source="test",
            metadata={"category": "test", "tags": ["vector", "indexing", "test"]}
        )
        print(f"Created knowledge item: {test_item.id}")
        
        # Test vector processing
        print("Processing vector embeddings...")
        embedding_records = vector_service.process_knowledge_item(test_item.id)
        print(f"Created {len(embedding_records)} embedding records")
        
        # Test search functionality
        print("Testing semantic search...")
        search_results = vector_service.search_similar_content("vector search", limit=5)
        print(f"Found {len(search_results)} search results")
        
        for result in search_results:
            print(f"  Score: {result['score']:.4f}, Content: {result['payload']['content'][:100]}...")
        
        # Get stats
        print("Getting system stats...")
        stats = vector_service.get_embedding_stats()
        print(f"Stats: {stats}")
        
        print("\n✅ All tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        logger.error(f"Test error: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = test_basic_functionality()
    sys.exit(0 if success else 1)