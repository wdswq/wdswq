# Prisma Database Setup Guide

This guide walks you through setting up the Prisma database schema for the Knowledge Base backend.

## Prerequisites

- PostgreSQL database installed and running
- Node.js 18+ and npm installed
- Project dependencies installed (`npm install`)

## Step 1: Configure Database Connection

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your database configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/knowledge_base?schema=public"
   ```

   Replace:
   - `username`: Your PostgreSQL username
   - `password`: Your PostgreSQL password  
   - `localhost`: Your database host (if not local)
   - `5432`: Your database port (if different)
   - `knowledge_base`: Your database name

## Step 2: Create Database

Create the database in PostgreSQL:
```sql
CREATE DATABASE knowledge_base;
```

## Step 3: Generate Prisma Client

Generate the Prisma client with:
```bash
npm run prisma:generate
```

This creates the TypeScript types for your database schema.

## Step 4: Create Initial Migration

Create and apply the initial migration:
```bash
npm run prisma:migrate
```

When prompted, enter a migration name like `init`.

This will:
- Create a migration file in `prisma/migrations/`
- Apply the migration to your database
- Create all tables and relationships

## Step 5: Verify Setup

1. **Test Database Connection**
   ```bash
   curl http://localhost:3000/api/test/connection
   ```

2. **Create Sample Data** (optional)
   ```bash
   curl -X POST http://localhost:3000/api/test/sample-data
   ```

3. **Check Database Stats**
   ```bash
   curl http://localhost:3000/api/test/stats
   ```

## Step 6: Start Development Server

```bash
npm run start:dev
```

The server will start on `http://localhost:3000`.

## Available Prisma Commands

- `npm run prisma:generate` - Regenerate Prisma client
- `npm run prisma:migrate` - Run migrations in development
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:deploy` - Apply migrations in production

## Database Schema Overview

The application includes these main entities:

### Core Tables
- **users** - User accounts and authentication
- **knowledge_items** - Main content with title, content, metadata
- **categories** - Hierarchical categorization
- **tags** - Flexible tagging system

### Supporting Tables
- **knowledge_item_tags** - Many-to-many relationship between items and tags
- **file_assets** - File uploads and attachments
- **link_bookmarks** - External link management
- **embedding_records** - Vector embeddings for AI search
- **upload_jobs** - Asynchronous upload tracking

### Key Relationships
- Users create knowledge items, upload files, and manage bookmarks
- Knowledge items belong to users and optional categories
- Knowledge items can have multiple tags (many-to-many)
- Files and links can be attached to knowledge items

## Making Schema Changes

When modifying the schema:

1. Edit `prisma/schema.prisma`
2. Test changes: `npm run prisma:generate`
3. Create migration: `npm run prisma:migrate --name <description>`
4. Regenerate client: `npm run prisma:generate`

## Troubleshooting

### Migration Fails
- Check database connection in `.env`
- Ensure database exists and user has permissions
- Verify PostgreSQL is running

### Client Generation Fails
- Check schema syntax in `prisma/schema.prisma`
- Ensure all relations are properly defined
- Run `npm install` to get latest Prisma version

### Connection Issues
- Verify DATABASE_URL format
- Check firewall/network access to database
- Ensure database user has necessary permissions

## Production Deployment

For production:

1. Set `NODE_ENV=production` in environment
2. Use `npm run prisma:deploy` instead of `migrate`
3. Ensure DATABASE_URL points to production database
4. Configure proper database security and backups

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)