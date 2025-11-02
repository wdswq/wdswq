from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://user:password@localhost:5432/vector_db"
    
    # OpenAI Configuration
    openai_api_key: Optional[str] = None
    
    # Sentence Transformers Configuration
    sentence_transformer_model: str = "all-MiniLM-L6-v2"
    
    # Qdrant Configuration
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: Optional[str] = None
    
    # Embedding Configuration
    embedding_provider: str = "sentence_transformers"  # Options: openai, sentence_transformers
    embedding_dimension: int = 384
    
    # Text Chunking
    chunk_size: int = 1000
    chunk_overlap: int = 200
    
    # Application
    debug: bool = False
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"


settings = Settings()