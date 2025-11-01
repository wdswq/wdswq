from typing import List, Dict, Any, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.core.config import settings
from app.core.logging import logger


class TextChunkingService:
    def __init__(self, chunk_size: Optional[int] = None, chunk_overlap: Optional[int] = None):
        self.chunk_size = chunk_size or settings.chunk_size
        self.chunk_overlap = chunk_overlap or settings.chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def chunk_text(self, text: str, metadata: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        try:
            chunks = self.text_splitter.split_text(text)
            
            chunked_documents = []
            for i, chunk in enumerate(chunks):
                chunk_metadata = {
                    "chunk_index": i,
                    "chunk_text": chunk,
                    "chunk_size": len(chunk),
                    **(metadata or {})
                }
                
                chunked_documents.append({
                    "content": chunk,
                    "metadata": chunk_metadata,
                    "chunk_index": i
                })
            
            logger.info(f"Split text into {len(chunks)} chunks")
            return chunked_documents
            
        except Exception as e:
            logger.error(f"Error chunking text: {e}")
            raise