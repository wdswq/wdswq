#!/usr/bin/env python3
"""
Example usage of the Vector Indexing System
"""
import os
import sys

# Add the app directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.services.knowledge_service import KnowledgeService
from app.services.vector_indexing_service import VectorIndexingService
from app.core.logging import logger


def main():
    """Demonstrate the vector indexing system"""
    print("🔍 Vector Indexing System Demo")
    print("=" * 50)
    
    # Initialize database
    Base.metadata.create_all(bind=engine)
    
    # Create services
    db = SessionLocal()
    knowledge_service = KnowledgeService(db)
    vector_service = VectorIndexingService(db)
    
    try:
        # Example 1: Create knowledge items
        print("\n📝 Creating sample knowledge items...")
        
        articles = [
            {
                "title": "Introduction to Machine Learning",
                "content": "Machine learning is a subset of artificial intelligence that focuses on the use of data and algorithms to imitate the way that humans learn. ML algorithms build a model based on sample data, known as training data, in order to make predictions or decisions without being explicitly programmed to do so.",
                "source": "example.com",
                "metadata": {"category": "technology", "tags": ["ML", "AI", "algorithms"]}
            },
            {
                "title": "Vector Databases Overview",
                "content": "Vector databases are specialized databases designed to store, manage, and query high-dimensional vectors efficiently. They are essential for applications involving similarity search, recommendation systems, and AI/ML workloads. Unlike traditional databases that work with structured data, vector databases excel at finding similar items based on vector distance metrics.",
                "source": "techdocs.io", 
                "metadata": {"category": "database", "tags": ["vectors", "search", "database"]}
            },
            {
                "title": "Natural Language Processing",
                "content": "Natural Language Processing (NLP) is a branch of artificial intelligence that helps computers understand, interpret and manipulate human language. NLP draws from many disciplines, including computer science and computational linguistics, in its pursuit of filling the gap between human communication and computer understanding.",
                "source": "ai-guide.org",
                "metadata": {"category": "AI", "tags": ["NLP", "language", "processing"]}
            }
        ]
        
        created_items = []
        for article in articles:
            item = knowledge_service.create_knowledge_item(**article)
            created_items.append(item)
            print(f"  ✅ Created: {item.title} (ID: {item.id})")
        
        # Example 2: Process for vector indexing
        print("\n🔄 Processing vector embeddings...")
        for item in created_items:
            embedding_records = vector_service.process_knowledge_item(item.id)
            print(f"  📊 {item.title}: {len(embedding_records)} chunks embedded")
        
        # Example 3: Semantic search
        print("\n🔍 Semantic Search Examples:")
        
        queries = [
            "artificial intelligence and machine learning",
            "database for similarity search", 
            "understanding human language"
        ]
        
        for query in queries:
            print(f"\n  Query: '{query}'")
            results = vector_service.search_similar_content(query, limit=3)
            
            for i, result in enumerate(results, 1):
                score = result['score']
                title = result['payload']['title']
                content_preview = result['payload']['content'][:100] + "..."
                print(f"    {i}. [{score:.3f}] {title}")
                print(f"       {content_preview}")
        
        # Example 4: Get statistics
        print("\n📈 System Statistics:")
        stats = vector_service.get_embedding_stats()
        for key, value in stats.items():
            print(f"  {key}: {value}")
        
        # Example 5: Update content
        print("\n✏️  Updating content...")
        first_item = created_items[0]
        updated_content = first_item.content + " This additional content demonstrates how updates trigger re-indexing."
        
        updated_item = knowledge_service.update_knowledge_item(
            item_id=first_item.id,
            content=updated_content
        )
        
        # Re-process embeddings
        embedding_records = vector_service.update_knowledge_item(first_item.id)
        print(f"  ✅ Updated and re-indexed: {len(embedding_records)} chunks")
        
        print("\n🎉 Demo completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        logger.error(f"Demo error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()