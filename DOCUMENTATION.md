# Vector Indexing System Documentation

## Overview

This system provides comprehensive vector indexing capabilities with configurable embedding generation and Qdrant vector storage. It supports text chunking, metadata attachment, and lifecycle management of knowledge items with their corresponding vector embeddings.

## Architecture

### Core Components

1. **Models** (`app/models/`)
   - `KnowledgeItem`: Main entity for storing text content and metadata
   - `EmbeddingRecord`: Links knowledge items to their vector embeddings and Qdrant points

2. **Services** (`app/services/`)
   - `EmbeddingService`: Configurable embedding generation (OpenAI/Sentence Transformers)
   - `TextChunkingService`: Text chunking with overlap and metadata preservation
   - `QdrantService`: Qdrant vector database operations
   - `VectorIndexingService`: Orchestrates the entire indexing process
   - `KnowledgeService`: CRUD operations for knowledge items

3. **API** (`app/api/`)
   - FastAPI endpoints for knowledge management and search
   - RESTful interface for all operations

4. **CLI** (`app/cli/`)
   - Command-line tools for batch operations and system management

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vector_db

# OpenAI (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Sentence Transformers
SENTENCE_TRANSFORMER_MODEL=all-MiniLM-L6-v2

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=  # Optional

# Embedding Configuration
EMBEDDING_PROVIDER=sentence_transformers  # Options: openai, sentence_transformers
EMBEDDING_DIMENSION=384  # Must match the chosen model

# Text Chunking
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Application
DEBUG=True
LOG_LEVEL=INFO
```

### Embedding Providers

#### OpenAI
- Model: `text-embedding-ada-002` (default)
- Dimension: 1536
- Requires: `OPENAI_API_KEY`

#### Sentence Transformers
- Default model: `all-MiniLM-L6-v2`
- Dimension: 384 (varies by model)
- No API key required

## API Endpoints

### Knowledge Management

- `POST /api/v1/knowledge-items` - Create knowledge item with automatic indexing
- `GET /api/v1/knowledge-items` - List knowledge items
- `GET /api/v1/knowledge-items/{id}` - Get specific knowledge item
- `PUT /api/v1/knowledge-items/{id}` - Update knowledge item (re-indexes automatically)
- `DELETE /api/v1/knowledge-items/{id}` - Soft delete knowledge item and embeddings

### Search

- `POST /api/v1/search` - Semantic search using vector similarity
  ```json
  {
    "query": "search text",
    "limit": 10
  }
  ```

### System

- `GET /api/v1/stats` - Get system statistics

## CLI Commands

### Rebuild All Indices
```bash
python -m app.cli rebuild-indices
```

### Process Specific Items
```bash
python -m app.cli process-items --item-ids uuid1,uuid2,uuid3
```

### Process All Items
```bash
python -m app.cli process-items --all-items
```

### Get Statistics
```bash
python -m app.cli stats
```

### Initialize Database
```bash
python -m app.cli init-db
```

## Workflow

### Adding New Content

1. Create knowledge item via API or CLI
2. System automatically chunks the text
3. Embeddings are generated using configured provider
4. Chunks with metadata are stored in Qdrant
5. EmbeddingRecord links are created in database

### Updating Content

1. Update knowledge item content/metadata
2. System deletes existing embeddings
3. Re-processes content with new chunks
4. Updates all vector embeddings and database records

### Searching

1. Query text is embedded using same model
2. Vector similarity search in Qdrant
3. Results returned with scores and metadata

## Data Model

### KnowledgeItem
```python
{
  "id": "uuid",
  "title": "string",
  "content": "text",
  "metadata": "json",
  "source": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "is_active": "boolean"
}
```

### EmbeddingRecord
```python
{
  "id": "uuid",
  "knowledge_item_id": "uuid",
  "chunk_index": "integer",
  "chunk_content": "text",
  "chunk_metadata": "json",
  "qdrant_id": "string",
  "embedding_model": "string",
  "embedding_dimension": "integer",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Error Handling

The system implements comprehensive error handling:

- **Database errors**: Transactions are rolled back, errors are logged
- **Embedding generation**: Retries with exponential backoff, fallback options
- **Qdrant operations**: Connection resilience, batch operation support
- **CLI operations**: Progress tracking, error reporting, partial success handling

## Logging

All operations are logged with appropriate levels:
- `INFO`: Normal operations, progress updates
- `WARNING`: Non-critical issues, fallbacks used
- `ERROR`: Failed operations, exceptions

## Performance Considerations

- **Batch processing**: CLI operations support bulk processing with progress bars
- **Text chunking**: Configurable chunk size and overlap for optimal indexing
- **Vector operations**: Efficient batch upserts to Qdrant
- **Database queries**: Optimized queries with proper indexing

## Security

- **API keys**: Environment-based configuration, no hardcoded credentials
- **Database**: Connection string configuration, proper access controls
- **Input validation**: Pydantic models for all API inputs
- **Soft deletes**: Knowledge items are soft-deleted to preserve data integrity

## Monitoring

### System Statistics
- Total embedding records
- Qdrant collection size
- Embedding model information
- Processing success/failure rates

### Health Checks
- Database connectivity
- Qdrant service availability
- Embedding provider accessibility

## Deployment

### Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Manual Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your settings

# Initialize database
python -m app.cli init-db

# Start API server
uvicorn app.main:app --reload
```

## Testing

Run the test suite:
```bash
python test_system.py
```

This will test:
- Database connectivity
- Embedding generation
- Vector indexing
- Semantic search
- CLI operations

## Troubleshooting

### Common Issues

1. **Embedding dimension mismatch**: Ensure `EMBEDDING_DIMENSION` matches your model
2. **Qdrant connection**: Check `QDRANT_URL` and ensure service is running
3. **Database connection**: Verify `DATABASE_URL` and PostgreSQL accessibility
4. **OpenAI API**: Check `OPENAI_API_KEY` and quota limits

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=DEBUG python -m app.cli stats
```

## Extending the System

### Adding New Embedding Providers

1. Implement `EmbeddingProvider` interface
2. Add provider configuration
3. Update `EmbeddingService._get_provider()`

### Custom Text Chunkers

1. Extend `TextChunkingService`
2. Implement custom chunking logic
3. Override service in `VectorIndexingService`

### Additional Metadata

1. Extend `KnowledgeItem.metadata` schema
2. Update chunking metadata generation
3. Modify search result processing