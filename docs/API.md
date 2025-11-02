# API Documentation

This document provides comprehensive API documentation for the backend service, including endpoints, authentication, request/response formats, and error handling.

## Base URL

```
Development: http://localhost:3001
Production: https://api.yourapp.com
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

#### Login User

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token-here"
  }
}
```

#### Refresh Token

```http
POST /api/auth/refresh
```

**Headers:**
```
Authorization: Bearer <refresh-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token"
  }
}
```

#### Logout

```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## File Management

### Upload File

```http
POST /api/files/upload
```

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
file: <binary-file-data>
tags: [optional, comma-separated]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "uuid",
      "name": "document.pdf",
      "size": 1024000,
      "type": "application/pdf",
      "status": "processing",
      "tags": ["document", "important"],
      "uploadedAt": "2023-01-01T00:00:00.000Z",
      "processedAt": null
    }
  }
}
```

### Get Files

```http
GET /api/files
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page
- `search` (string, optional): Search term
- `type` (string, optional): Filter by file type
- `tags` (string, optional): Filter by tags (comma-separated)
- `sort` (string, default: 'createdAt'): Sort field
- `order` (string, default: 'desc'): Sort order (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "uuid",
        "name": "document.pdf",
        "size": 1024000,
        "type": "application/pdf",
        "status": "completed",
        "tags": ["document", "important"],
        "uploadedAt": "2023-01-01T00:00:00.000Z",
        "processedAt": "2023-01-01T00:05:00.000Z",
        "metadata": {
          "pages": 10,
          "author": "John Doe",
          "subject": "Important Document"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### Get File Details

```http
GET /api/files/:id
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "uuid",
      "name": "document.pdf",
      "size": 1024000,
      "type": "application/pdf",
      "status": "completed",
      "tags": ["document", "important"],
      "uploadedAt": "2023-01-01T00:00:00.000Z",
      "processedAt": "2023-01-01T00:05:00.000Z",
      "metadata": {
        "pages": 10,
        "author": "John Doe",
        "subject": "Important Document",
        "extractedText": "Document content here...",
        "embeddings": [0.1, 0.2, 0.3, ...]
      },
      "previewUrl": "/api/files/uuid/preview",
      "downloadUrl": "/api/files/uuid/download"
    }
  }
}
```

### Update File Metadata

```http
PUT /api/files/:id/metadata
```

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Document Name",
  "tags": ["document", "updated", "important"],
  "metadata": {
    "author": "Jane Doe",
    "subject": "Updated Subject"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "uuid",
      "name": "Updated Document Name",
      "tags": ["document", "updated", "important"],
      "updatedAt": "2023-01-01T01:00:00.000Z"
    }
  }
}
```

### Delete File

```http
DELETE /api/files/:id
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Download File

```http
GET /api/files/:id/download
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
Binary file data with appropriate Content-Type header

### Get File Preview

```http
GET /api/files/:id/preview
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `width` (number, optional): Preview width for images
- `height` (number, optional): Preview height for images
- `page` (number, optional): Page number for PDFs

**Response:**
Binary preview data or HTML preview for text files

## Processing

### Get Processing Status

```http
GET /api/processing/:id/status
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "processing": {
      "id": "uuid",
      "fileId": "file-uuid",
      "status": "processing",
      "stage": "extracting_content",
      "progress": 45,
      "startedAt": "2023-01-01T00:00:00.000Z",
      "estimatedCompletion": "2023-01-01T00:10:00.000Z",
      "error": null
    }
  }
}
```

### Retry Processing

```http
POST /api/processing/:id/retry
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Processing restarted",
  "data": {
    "processing": {
      "id": "uuid",
      "status": "queued",
      "restartedAt": "2023-01-01T01:00:00.000Z"
    }
  }
}
```

## Search

### Search Files

```http
GET /api/search
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `q` (string, required): Search query
- `type` (string, optional): Search type (content, metadata, all)
- `filters` (object, optional): Additional filters
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "file": {
          "id": "uuid",
          "name": "document.pdf",
          "type": "application/pdf"
        },
        "score": 0.95,
        "highlights": [
          "This is <mark>important</mark> content from the document"
        ],
        "snippet": "This is important content from the document that matches the search query..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    },
    "searchTime": 0.05
  }
}
```

## Sharing

### Create Share Link

```http
POST /api/shares
```

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fileId": "uuid",
  "expiresAt": "2023-01-08T00:00:00.000Z",
  "password": "optional-password",
  "permissions": ["view", "download"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "share": {
      "id": "share-uuid",
      "url": "https://app.yourapp.com/shared/share-uuid",
      "fileId": "uuid",
      "expiresAt": "2023-01-08T00:00:00.000Z",
      "hasPassword": true,
      "permissions": ["view", "download"],
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Shared File

```http
GET /api/shares/:id
```

**Query Parameters:**
- `password` (string, optional): Share password if protected

**Response:**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "uuid",
      "name": "document.pdf",
      "size": 1024000,
      "type": "application/pdf",
      "previewUrl": "/api/shares/share-uuid/preview",
      "downloadUrl": "/api/shares/share-uuid/download"
    },
    "share": {
      "id": "share-uuid",
      "permissions": ["view", "download"],
      "expiresAt": "2023-01-08T00:00:00.000Z"
    }
  }
}
```

## User Management

### Get User Profile

```http
GET /api/users/profile
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "storageUsed": 104857600,
      "storageLimit": 1073741824,
      "fileCount": 25,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

### Update User Profile

```http
PUT /api/users/profile
```

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Jane Doe",
      "avatar": "https://example.com/new-avatar.jpg",
      "updatedAt": "2023-01-01T01:00:00.000Z"
    }
  }
}
```

## System

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2023-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "services": {
      "database": "healthy",
      "qdrant": "healthy",
      "minio": "healthy"
    },
    "uptime": 3600
  }
}
```

### System Stats

```http
GET /api/stats
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1000,
      "totalFiles": 50000,
      "totalStorage": 10737418240,
      "processingQueue": 5,
      "averageProcessingTime": 30
    }
  }
}
```

## Error Handling

### Error Response Format

All errors follow this consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |
| `UNSUPPORTED_TYPE` | 415 | Unsupported file type |
| `PROCESSING_ERROR` | 500 | File processing failed |
| `STORAGE_ERROR` | 507 | Storage limit exceeded |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |

### Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **File upload**: 10 requests per minute
- **General API**: 100 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## SDK Examples

### JavaScript/TypeScript

```typescript
class ApiClient {
  constructor(private baseUrl: string, private token: string) {}

  async uploadFile(file: File, tags?: string[]) {
    const formData = new FormData();
    formData.append('file', file);
    if (tags) {
      formData.append('tags', tags.join(','));
    }

    const response = await fetch(`${this.baseUrl}/api/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    return response.json();
  }

  async getFiles(options: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  } = {}) {
    const params = new URLSearchParams(options as any);
    const response = await fetch(`${this.baseUrl}/api/files?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    return response.json();
  }
}
```

### Python

```python
import requests

class ApiClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}'
        }
    
    def upload_file(self, file_path: str, tags: list = None):
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {}
            if tags:
                data['tags'] = ','.join(tags)
            
            response = requests.post(
                f'{self.base_url}/api/files/upload',
                headers=self.headers,
                files=files,
                data=data
            )
        
        return response.json()
    
    def get_files(self, page=1, limit=20, search=None, type=None):
        params = {
            'page': page,
            'limit': limit,
        }
        if search:
            params['search'] = search
        if type:
            params['type'] = type
        
        response = requests.get(
            f'{self.base_url}/api/files',
            headers=self.headers,
            params=params
        )
        
        return response.json()
```

## WebSocket API

### Real-time Processing Updates

Connect to WebSocket for real-time processing updates:

```javascript
const ws = new WebSocket('ws://localhost:3001/processing');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'processing.started':
      console.log('Processing started:', data.fileId);
      break;
    case 'processing.progress':
      console.log('Progress:', data.progress);
      break;
    case 'processing.completed':
      console.log('Processing completed:', data.fileId);
      break;
    case 'processing.error':
      console.error('Processing error:', data.error);
      break;
  }
};
```

### WebSocket Message Types

| Type | Description |
|------|-------------|
| `processing.started` | File processing has started |
| `processing.progress` | Processing progress update |
| `processing.completed` | File processing completed successfully |
| `processing.error` | File processing failed |
| `file.uploaded` | New file uploaded |
| `file.deleted` | File was deleted |

## Versioning

The API uses semantic versioning. Current version: `v1`

Include version in requests:
```
Accept: application/vnd.api+json;version=1
```

Or use versioned endpoints:
```
/api/v1/files
```

## Changelog

### v1.0.0 (Current)
- Initial API release
- File upload and management
- Authentication and authorization
- Search functionality
- Sharing capabilities

### Upcoming v1.1.0
- Advanced search filters
- Batch operations
- Webhook support
- Advanced sharing options

## Support

For API support and questions:
- Documentation: https://docs.yourapp.com/api
- Support email: api-support@yourapp.com
- Status page: https://status.yourapp.com