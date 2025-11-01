# Vector Indexing System

A comprehensive vector indexing system that supports embedding generation and Qdrant vector storage.

## Features

- Configurable embedding generation (OpenAI or Sentence Transformers)
- Qdrant vector storage integration
- Text chunking with metadata attachment
- Upsert into Qdrant collections
- EmbeddingRecord model with KnowledgeItem lifecycle sync
- CLI script for rebuilding indices

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Run database migrations:
```bash
alembic upgrade head
```

## Usage

### API Server
```bash
uvicorn app.main:app --reload
```

### CLI Tools
```bash
# Rebuild all vector indices
python -m app.cli rebuild-indices

# Process specific knowledge items
python -m app.cli process-items --item-ids 1,2,3
```

## Configuration

See `.env.example` for available configuration options.

## Architecture

- `app/models/`: SQLAlchemy models for database entities
- `app/services/`: Business logic for embeddings, vector storage, and knowledge management
- `app/api/`: FastAPI endpoints
- `app/cli/`: Command-line interface tools
- `app/core/`: Configuration and shared utilities