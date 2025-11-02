# Full-Stack Application with E2E Testing and CI/CD

A modern, scalable full-stack application with comprehensive testing, monitoring, and deployment automation. Built with Next.js 14, NestJS, TypeScript, and Docker.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14, NestJS, TypeScript, Tailwind CSS
- **File Management**: Upload, process, and preview various file types
- **Vector Search**: Semantic search with Qdrant vector database
- **Real-time Processing**: WebSocket-based progress tracking
- **Comprehensive Testing**: Unit, integration, and E2E tests with Playwright
- **CI/CD Pipeline**: Automated testing, building, and deployment
- **Monitoring**: Structured logging, metrics, and health checks
- **Infrastructure as Code**: Docker Compose with development and production configs

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Documentation](#documentation)

## 🎯 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker and Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd <project-name>

# Install dependencies
pnpm install

# Start infrastructure services
pnpm infra:up

# Start development servers
pnpm dev
```

### Access Points

Once started, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/health

### Infrastructure Services

| Service | Port | Access |
|---------|------|--------|
| PostgreSQL | 5432 | `postgresql://postgres:postgres@localhost:5432/app_db` |
| Qdrant | 6333 | http://localhost:6333 |
| MinIO API | 9000 | http://localhost:9000 |
| MinIO Console | 9001 | http://localhost:9001 |

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Infrastructure │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│  Services       │
│                 │    │                 │    │                 │
│ - React/TS      │    │ - REST API      │    │ - PostgreSQL    │
│ - Tailwind      │    │ - WebSocket     │    │ - Qdrant        │
│ - Zustand       │    │ - File Storage  │    │ - MinIO         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and Shadcn UI
- **Backend**: NestJS with REST API, WebSocket support, and comprehensive validation
- **Database**: PostgreSQL for relational data
- **Vector Storage**: Qdrant for semantic search and embeddings
- **File Storage**: MinIO for object storage
- **Queue System**: BullMQ for background job processing

## 🛠️ Development

### Environment Setup

```bash
# Copy environment configuration
cp infra/.env.docker .env.local

# Install dependencies
pnpm install

# Start infrastructure
pnpm infra:up

# Start development servers
pnpm dev
```

### Available Scripts

```bash
# Development
pnpm dev              # Start all development servers
pnpm dev:frontend     # Start frontend only
pnpm dev:backend      # Start backend only

# Building
pnpm build            # Build all applications
pnpm build:frontend   # Build frontend only
pnpm build:backend    # Build backend only

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:integration # Run integration tests
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # Run E2E tests with UI

# Linting and Formatting
pnpm lint             # Lint all code
pnpm format           # Format all code

# Infrastructure
pnpm infra:up         # Start infrastructure services
pnpm infra:down       # Stop infrastructure services
pnpm infra:logs       # View infrastructure logs
pnpm infra:clean      # Clean up infrastructure
```

### Project Structure

```
project/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/       # App router pages
│   │   │   ├── components/ # React components
│   │   │   └── lib/       # Utilities and helpers
│   │   ├── e2e/           # E2E tests
│   │   └── __tests__/     # Unit tests
│   └── backend/           # NestJS backend application
│       ├── src/
│       │   ├── common/    # Common utilities
│       │   ├── modules/   # Feature modules
│       │   └── config/    # Configuration
│       └── test/          # Integration tests
├── docs/                  # Documentation
├── infra/                 # Infrastructure configuration
├── .github/workflows/     # CI/CD workflows
└── scripts/               # Utility scripts
```

## 🧪 Testing

### Testing Strategy

We employ a comprehensive testing strategy with three main layers:

1. **Unit Tests**: Fast, isolated tests for individual components and functions
2. **Integration Tests**: Tests that verify interaction between different system parts
3. **E2E Tests**: Full user journey tests with Playwright

### Running Tests

```bash
# Run all tests
pnpm test:all

# Run specific test suites
pnpm test:unit        # Jest unit tests
pnpm test:integration # NestJS integration tests
pnpm test:e2e         # Playwright E2E tests

# Run E2E tests with UI
pnpm test:e2e:ui

# Debug E2E tests
pnpm test:e2e:debug
```

### Test Coverage

Our E2E tests cover:

- **Authentication Flow**: Login, registration, logout, session management
- **Upload Flow**: File selection, drag-and-drop, progress tracking, validation
- **Processing Flow**: Real-time status updates, error handling, completion
- **Library Flow**: File listing, search, filtering, sorting, deletion
- **Preview Flow**: File preview for different types, zoom controls, metadata editing

### Test Reports

Test results are generated in multiple formats:

- **HTML Reports**: Visual test results with screenshots
- **JSON Reports**: Machine-readable results for CI integration
- **JUnit Reports**: Compatible with CI/CD systems
- **Coverage Reports**: Code coverage analysis

## 🚀 Deployment

### Development Deployment

```bash
# Using Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Using Make
make dev-deploy
```

### Production Deployment

```bash
# Build production images
docker build -f Dockerfile -t myapp:latest .

# Deploy with production compose
docker-compose -f docker-compose.prod.yml up -d

# Or use CI/CD pipeline
git push main  # Triggers automatic deployment
```

### Environment Configuration

#### Development (.env.local)

```bash
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dev_db
QDRANT_URL=http://localhost:6333
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

#### Production (.env.production)

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/prod_db
QDRANT_URL=https://prod-qdrant.example.com
MINIO_ENDPOINT=https://prod-minio.example.com
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://prod-redis:6379
```

### CI/CD Pipeline

Our CI/CD pipeline includes:

1. **Linting**: Code quality checks
2. **Unit Tests**: Fast feedback on code changes
3. **Integration Tests**: API and database interaction testing
4. **E2E Tests**: Full user journey validation
5. **Security Scanning**: Vulnerability assessment
6. **Building**: Docker image creation
7. **Deployment**: Automated deployment to staging/production

### Health Checks

All services include comprehensive health checks:

```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend health
curl http://localhost:3000/api/health

# Infrastructure health
make infra:status
```

## 📊 Monitoring

### Logging

We use structured logging with multiple levels:

- **ERROR**: System errors and exceptions
- **WARN**: Warning conditions and performance issues
- **INFO**: Important business events and user actions
- **DEBUG**: Detailed debugging information (development only)

### Metrics

Key metrics we track:

- **Performance**: Response times, throughput, error rates
- **Business**: User registrations, file uploads, search queries
- **Infrastructure**: CPU, memory, disk usage, database connections

### Monitoring Stack

- **Log Aggregation**: ELK Stack or Grafana Loki
- **Metrics**: Prometheus + Grafana
- **Error Tracking**: Sentry or Bugsnag
- **APM**: New Relic or DataDog

### Alerting

Automated alerts for:

- High error rates (>5%)
- Slow response times (>2s 95th percentile)
- Service unavailability
- Resource exhaustion (memory, disk, CPU)

## 📚 Documentation

### Available Documentation

- **[Testing Guide](docs/TESTING.md)**: Comprehensive testing strategy and examples
- **[API Documentation](docs/API.md)**: Complete API reference with examples
- **[Monitoring Guide](docs/MONITORING.md)**: Logging, metrics, and observability
- **[Architecture Guide](docs/ARCHITECTURE.md)**: System architecture and deployment

### API Documentation

Interactive API documentation is available at:

- **Development**: http://localhost:3001/api/docs
- **Production**: https://api.yourapp.com/docs

### Code Examples

#### Frontend API Client

```typescript
import { ApiClient } from '@/lib/api-client';

const client = new ApiClient('http://localhost:3001');

// Upload a file
const result = await client.uploadFile(file, ['document', 'important']);

// Search files
const searchResults = await client.searchFiles('query', { type: 'pdf' });
```

#### Backend Service Example

```typescript
import { Injectable } from '@nestjs/common';
import { FilesService } from './files.service';

@Injectable()
export class UploadService {
  constructor(private filesService: FilesService) {}

  async uploadFile(file: Express.Multer.File, userId: string) {
    // Process file upload
    const savedFile = await this.filesService.save(file, userId);
    
    // Queue for processing
    await this.queueService.add('process-file', {
      fileId: savedFile.id,
      userId,
    });
    
    return savedFile;
  }
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Backend port | `3001` |
| `DATABASE_URL` | PostgreSQL connection | - |
| `QDRANT_URL` | Qdrant connection | `http://localhost:6333` |
| `MINIO_ENDPOINT` | MinIO endpoint | `localhost` |
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO secret key | `minioadmin` |
| `JWT_SECRET` | JWT signing secret | - |
| `REDIS_URL` | Redis connection | - |

### Docker Configuration

The application supports multiple Docker configurations:

- **Development**: Hot reloading, debugging enabled
- **Testing**: Optimized for CI/CD with test dependencies
- **Production**: Optimized for security and performance

### Infrastructure as Code

Terraform configurations are available for cloud deployment:

```bash
# Deploy to AWS
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes and **add tests**
4. **Run** the test suite: `pnpm test:all`
5. **Commit** your changes: `git commit -m 'Add amazing feature'`
6. **Push** to the branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Consistent code style
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for quality checks

### Testing Requirements

- **Unit Tests**: All new features must have unit tests
- **Integration Tests**: API changes need integration tests
- **E2E Tests**: User-facing features require E2E tests
- **Coverage**: Maintain >80% test coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the [docs](docs/) directory first
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join our community forum or Discord

### Troubleshooting

#### Common Issues

1. **Port Conflicts**: Modify ports in `.env` file
2. **Memory Issues**: Increase Docker memory allocation
3. **Permission Errors**: Check file permissions for volumes
4. **Service Failures**: Check logs with `pnpm infra:logs`

#### Debug Commands

```bash
# Check service status
pnpm infra:status

# View logs
pnpm infra:logs
pnpm infra:logs:postgres
pnpm infra:logs:qdrant
pnpm infra:logs:minio

# Reset environment
pnpm infra:clean
```

### Performance Tips

- Use **SSD** storage for better I/O performance
- Allocate **sufficient memory** (8GB+ recommended)
- Use **local Docker registry** for faster builds
- Enable **Docker BuildKit** for parallel builds

---

Built with ❤️ by the development team. For more information, visit our [documentation](docs/) or [GitHub repository](https://github.com/your-org/your-repo).