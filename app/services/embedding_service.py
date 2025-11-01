from abc import ABC, abstractmethod
from typing import List, Optional
import numpy as np
from app.core.config import settings
from app.core.logging import logger
import openai
from sentence_transformers import SentenceTransformer


class EmbeddingProvider(ABC):
    @abstractmethod
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        pass
    
    @property
    @abstractmethod
    def dimension(self) -> int:
        pass
    
    @property
    @abstractmethod
    def model_name(self) -> str:
        pass


class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self, api_key: str, model: str = "text-embedding-ada-002"):
        self.client = openai.OpenAI(api_key=api_key)
        self.model = model
        self._dimension = 1536  # Ada embedding dimension
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=texts
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            logger.error(f"Error generating OpenAI embeddings: {e}")
            raise
    
    @property
    def dimension(self) -> int:
        return self._dimension
    
    @property
    def model_name(self) -> str:
        return self.model


class SentenceTransformerProvider(EmbeddingProvider):
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self._model_name = model_name
        self._dimension = self.model.get_sentence_embedding_dimension()
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        try:
            embeddings = self.model.encode(texts, convert_to_tensor=False)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error generating Sentence Transformer embeddings: {e}")
            raise
    
    @property
    def dimension(self) -> int:
        return self._dimension
    
    @property
    def model_name(self) -> str:
        return self._model_name


class EmbeddingService:
    def __init__(self):
        self.provider = self._get_provider()
    
    def _get_provider(self) -> EmbeddingProvider:
        if settings.embedding_provider == "openai":
            if not settings.openai_api_key:
                raise ValueError("OpenAI API key is required when using OpenAI provider")
            return OpenAIEmbeddingProvider(api_key=settings.openai_api_key)
        elif settings.embedding_provider == "sentence_transformers":
            return SentenceTransformerProvider(model_name=settings.sentence_transformer_model)
        else:
            raise ValueError(f"Unsupported embedding provider: {settings.embedding_provider}")
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        return self.provider.generate_embeddings(texts)
    
    @property
    def dimension(self) -> int:
        return self.provider.dimension
    
    @property
    def model_name(self) -> str:
        return self.provider.model_name