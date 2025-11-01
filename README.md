# Knowledge Base Backend

A NestJS backend application with Prisma ORM for managing knowledge base data.

## Features

- User management with authentication
- Knowledge items with rich content
- File asset management
- Tag and category system
- Link bookmarks
- Embedding records for AI search
- Upload job tracking

## Tech Stack

- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Language**: TypeScript

## Database Schema

The application includes the following main entities:

### Core Entities

- **User**: User accounts with authentication
- **KnowledgeItem**: Main content entity with title, content, and metadata
- **Category**: Hierarchical categorization of knowledge items
- **Tag**: Flexible tagging system with many-to-many relationships

### Supporting Entities

- **FileAsset**: File uploads and attachments
- **LinkBookmark**: External link management
- **EmbeddingRecord**: Vector embeddings for AI-powered search
- **UploadJob**: Asynchronous upload job tracking

### Relationships

- Users can create multiple knowledge items, file assets, and upload jobs
- Knowledge items belong to one user and optionally one category
- Knowledge items can have multiple tags (many-to-many)
- File assets and links can be attached to knowledge items

## Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm/yarn
- PostgreSQL database

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database configuration
   ```

3. Generate Prisma client:
   ```bash
   pnpm prisma:generate
   ```

4. Create and run initial migration:
   ```bash
   pnpm prisma:migrate
   ```

5. Start the development server:
   ```bash
   pnpm start:dev
   ```

## Available Scripts

- `pnpm start:dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start:prod` - Start production server
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

### Prisma Scripts

- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations in development
- `pnpm prisma:studio` - Open Prisma Studio for database management
- `pnpm prisma:deploy` - Apply migrations in production

## API Endpoints

### Health Check
- `GET /` - Application status
- `GET /health` - Health check endpoint

### Database Testing
- `GET /api/test/connection` - Test database connection
- `GET /api/test/stats` - Get database statistics
- `POST /api/test/sample-data` - Create sample data for testing

## Architecture

### Repository Pattern

The application uses a repository pattern with Prisma for database operations:

- **BaseRepository**: Abstract base class with common CRUD operations
- **Entity Repositories**: Specific implementations for each entity
- **Dependency Injection**: Repositories are injectable throughout the application

### Module Structure

```
src/
├── modules/
│   ├── prisma/           # Prisma service and module
│   └── database-test/    # Database testing utilities
├── common/
│   ├── repositories/     # Repository implementations
│   └── base.repository.ts # Base repository abstract class
├── app.module.ts         # Root application module
└── main.ts              # Application entry point
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/knowledge_base?schema=public"

# Application
NODE_ENV=development
PORT=3000

# Prisma
PRISMA_GENERATE_DATAPROXY=false
```

## Database Migration

When modifying the Prisma schema:

1. Make changes to `prisma/schema.prisma`
2. Generate migration:
   ```bash
   pnpm prisma migrate dev --name <migration-name>
   ```
3. Generate updated client:
   ```bash
   pnpm prisma:generate
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the UNLICENSED license.