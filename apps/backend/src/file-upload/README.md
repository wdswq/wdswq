# File Upload Module

This module provides comprehensive file upload functionality with chunked uploads, resume capability, MinIO storage integration, and metadata management.

## Features

- **Chunked Uploads**: Support for large files with configurable chunk sizes
- **Resume Capability**: Resume interrupted uploads from where they left off
- **File Validation**: MIME type validation, size limits, and file type detection
- **Deduplication**: Automatic file deduplication based on SHA-256 hash
- **MinIO Integration**: Store files in MinIO S3-compatible storage
- **Metadata Management**: Store file metadata, tags, and categories
- **Knowledge Items**: Link files to knowledge items with tags and categories
- **Upload Job Tracking**: Track upload progress and state transitions
- **Filtering & Search**: List and filter files by various criteria

## API Endpoints

### Upload Management

#### Initiate Upload
```
POST /file-upload/initiate
```
Start a new upload session.

**Request Body:**
```json
{
  "fileName": "document.pdf",
  "totalSize": 1048576,
  "mimeType": "application/pdf",
  "fileHash": "sha256-hash",
  "chunkSize": 1048576,
  "category": "document",
  "tags": ["important", "work"],
  "knowledgeItemId": "uuid",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadJobId": "uuid",
    "chunkSize": 1048576,
    "totalChunks": 1,
    "existingFileAsset": null
  },
  "message": "Upload initiated successfully"
}
```

#### Upload Chunk
```
POST /file-upload/upload-chunk
Content-Type: multipart/form-data
```
Upload a file chunk.

**Form Data:**
- `chunk`: File chunk (binary data)
- `uploadJobId`: Upload job UUID
- `chunkNumber`: Chunk index (0-based)
- `chunkHash`: MD5 hash of chunk (optional)
- `isLastChunk`: Boolean indicating last chunk (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "chunkNumber": 0,
    "isComplete": true,
    "uploadJobStatus": "completed"
  },
  "message": "File upload completed"
}
```

#### Resume Upload
```
POST /file-upload/resume
```
Resume an interrupted upload.

**Request Body:**
```json
{
  "uploadJobId": "uuid",
  "fileHash": "sha256-hash"
}
```

#### Cancel Upload
```
POST /file-upload/cancel/:uploadJobId
```
Cancel an ongoing upload.

### File Management

#### List Files
```
GET /file-upload/files?page=1&limit=20&search=document&category=document
```
List files with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by filename
- `mimeType`: Filter by MIME type
- `category`: Filter by category
- `status`: Filter by status
- `tags`: Filter by tags (comma-separated)
- `knowledgeItemId`: Filter by knowledge item ID
- `minSize`: Minimum file size
- `maxSize`: Maximum file size
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order ASC/DESC (default: DESC)

#### Get File Details
```
GET /file-upload/files/:id
```
Get detailed information about a file.

#### Download File
```
GET /file-upload/files/:id/download?expiry=3600
```
Generate a presigned download URL.

#### Stream File
```
GET /file-upload/files/:id/stream
```
Stream file content directly.

#### Delete File
```
DELETE /file-upload/files/:id
```
Delete a file and its metadata.

### Upload Job Management

#### Get Upload Job
```
GET /file-upload/jobs/:uploadJobId
```
Get upload job details and progress.

## Database Schema

### Knowledge Items
- `id`: UUID primary key
- `title`: Item title
- `description`: Optional description
- `tags`: JSON array of tags
- `category`: Category classification
- `metadata`: Additional metadata (JSONB)
- `isActive`: Boolean active flag
- `createdAt/updatedAt`: Timestamps

### Upload Jobs
- `id`: UUID primary key
- `fileName`: Original filename
- `totalSize`: Total file size in bytes
- `uploadedSize`: Bytes uploaded so far
- `chunkSize`: Configured chunk size
- `totalChunks`: Total number of chunks
- `completedChunks`: Number of completed chunks
- `status`: Upload status (pending, initiated, uploading, completed, failed, cancelled, resuming)
- `priority`: Upload priority (low, normal, high, urgent)
- `errorMessage`: Error message if failed
- `metadata`: Additional metadata (JSONB)
- `fileHash`: SHA-256 file hash
- `startedAt/completedAt/lastChunkAt`: Timestamps
- `isResumable`: Boolean resumable flag
- `uploadedChunkHashes`: Array of uploaded chunk hashes
- `fileAssetId`: Reference to FileAsset
- `uploadedBy/clientIp/userAgent`: Upload tracking info

### File Assets
- `id`: UUID primary key
- `originalName`: Original filename
- `storagePath`: MinIO storage path
- `mimeType`: Detected MIME type
- `size`: File size in bytes
- `hash`: SHA-256 hash (unique)
- `status`: File status (uploading, completed, failed, processing)
- `metadata`: File metadata (JSONB)
- `bucketName`: MinIO bucket name
- `chunkSize/totalChunks/uploadedChunks`: Upload info
- `uploadJobId`: Reference to UploadJob
- `knowledgeItemId`: Reference to KnowledgeItem
- `tags`: File tags (JSON array)
- `category`: File category
- `createdAt/updatedAt`: Timestamps

## File Categories

Supported file categories with their MIME types:

### Document
- PDF: `application/pdf`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- PowerPoint: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- Text: `text/plain`, `text/csv`, `application/rtf`

### Audio
- MP3: `audio/mpeg`
- WAV: `audio/wav`
- OGG: `audio/ogg`
- AAC: `audio/aac`
- FLAC: `audio/flac`
- WebM: `audio/webm`

### Video
- MP4: `video/mp4`
- MPEG: `video/mpeg`
- QuickTime: `video/quicktime`
- AVI: `video/x-msvideo`
- WebM: `video/webm`
- MKV: `video/x-matroska`

### Image
- JPEG: `image/jpeg`
- PNG: `image/png`
- GIF: `image/gif`
- WebP: `image/webp`
- SVG: `image/svg+xml`
- BMP: `image/bmp`
- TIFF: `image/tiff`

### Archive
- ZIP: `application/zip`
- RAR: `application/x-rar-compressed`
- 7Z: `application/x-7z-compressed`
- TAR: `application/x-tar`
- GZIP: `application/gzip`

## Configuration

### Environment Variables

```bash
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BUCKET=uploads

# File Upload Configuration
MAX_FILE_SIZE=524288000  # 500MB in bytes
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png,audio/mpeg,video/mp4,text/plain
```

## Upload Flow

1. **Initiate Upload**: Client sends file metadata and receives upload job ID
2. **Upload Chunks**: Client uploads file in chunks sequentially or in parallel
3. **Track Progress**: Each chunk updates the upload job status
4. **Finalize Upload**: When all chunks are uploaded, server combines them
5. **Validate & Store**: File is validated, hashed, and stored in MinIO
6. **Create Metadata**: FileAsset record is created with metadata
7. **Deduplication**: If file hash exists, reference existing file instead

## Error Handling

The API provides comprehensive error responses:

```json
{
  "success": false,
  "message": "File size exceeds maximum allowed size of 524288000 bytes",
  "error": {
    "statusCode": 400,
    "message": "Bad Request"
  }
}
```

Common error scenarios:
- File size exceeds limits
- Invalid MIME type
- Chunk size mismatch
- Upload job not found
- Upload already completed
- File validation failed

## Security Features

- **File Type Validation**: MIME type and magic number verification
- **Size Limits**: Configurable maximum file sizes
- **Hash Verification**: SHA-256 for file integrity, MD5 for chunks
- **Sanitized Filenames**: Dangerous characters removed from filenames
- **Secure Storage**: Files stored with randomized paths in MinIO
- **Access Control**: Presigned URLs with expiry for downloads

## Performance Considerations

- **Chunked Uploads**: Reduces memory usage for large files
- **Parallel Uploads**: Multiple chunks can be uploaded concurrently
- **Deduplication**: Saves storage space for duplicate files
- **Database Indexes**: Optimized queries for file listing and search
- **Streaming**: Direct file streaming without loading entire files into memory

## Monitoring & Logging

The module provides comprehensive logging for:
- Upload initiation and completion
- Individual chunk uploads
- Errors and failures
- File validation results
- Storage operations

## Testing

The module includes comprehensive test coverage:
- Unit tests for services
- Integration tests for controllers
- File upload scenarios
- Error handling cases
- Database operations

## Future Enhancements

- Virus scanning integration
- Image/video thumbnail generation
- Content extraction (OCR, metadata)
- Advanced search capabilities
- File versioning
- Access control and permissions
- Analytics and usage tracking