from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.knowledge import router as knowledge_router
from app.core.logging import logger

app = FastAPI(
    title="Vector Indexing API",
    description="API for vector indexing with Qdrant and configurable embeddings",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(knowledge_router, prefix="/api/v1", tags=["knowledge"])


@app.get("/")
async def root():
    return {"message": "Vector Indexing API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}