# Infrastructure Setup

This repository contains Docker Compose configuration for running essential development services locally.

## Services

The infrastructure setup includes the following services:

- **PostgreSQL 15** - Primary database
- **Qdrant** - Vector database for embeddings and similarity search
- **MinIO** - S3-compatible object storage

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Make (optional, for convenient commands)

### Starting Services

#### Option 1: Using Make (Recommended)

```bash
# Initialize and start all services
make init

# Or start services individually
make up
```

#### Option 2: Using Docker Compose directly

```bash
# Copy environment file
cp infra/.env.docker infra/.env

# Start services
cd infra && docker compose up -d

# Check status
docker compose ps
```

## Service Endpoints

Once started, the services are available at:

| Service | Port | Description | Access |
|---------|------|-------------|--------|
| PostgreSQL | 5432 | Primary database | `postgresql://postgres:postgres@localhost:5432/app_db` |
| Qdrant HTTP | 6333 | Vector database API | http://localhost:6333 |
| Qdrant gRPC | 6334 | Vector database gRPC | http://localhost:6334 |
| MinIO API | 9000 | Object storage API | http://localhost:9000 |
| MinIO Console | 9001 | Web UI | http://localhost:9001 |

## Environment Variables

The `.env.docker` file provides default configuration. Copy it to `.env` and customize as needed:

```bash
cp infra/.env.docker infra/.env
```

Key environment variables for your backend application:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db
QDRANT_URL=http://localhost:6333
QDRANT_GRPC_URL=http://localhost:6334
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
```

## Management Commands

### Using Make

```bash
# Start services
make up

# Stop services
make down

# View logs
make logs

# Check service status
make status

# View specific service logs
make logs-pg    # PostgreSQL
make logs-qd    # Qdrant
make logs-mio   # MinIO

# Clean up everything (removes volumes)
make clean

# Show help
make help
```

### Using Docker Compose directly

```bash
cd infra

# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Check status
docker compose ps

# Clean up everything
docker compose down -v
```

## Health Checks

All services include health checks:

- **PostgreSQL**: Checks database connectivity via `pg_isready`
- **Qdrant**: Checks HTTP endpoint `/health`
- **MinIO**: Checks `/minio/health/live` endpoint

Services will automatically restart if they become unhealthy.

## Data Persistence

Named volumes are used for data persistence:

- `postgres_data`: PostgreSQL data directory
- `qdrant_data`: Qdrant vector storage
- `minio_data`: MinIO object storage

Data persists across container restarts but can be removed with `make clean`.

## Troubleshooting

### Port Conflicts

If ports are already in use, modify them in your `.env` file:

```bash
# Change PostgreSQL port
POSTGRES_PORT=5433

# Change Qdrant port
QDRANT_PORT=7333

# Change MinIO ports
MINIO_PORT=9001
MINIO_CONSOLE_PORT=9002
```

### Services Not Starting

1. Check Docker is running: `docker version`
2. Check available disk space: `df -h`
3. Check logs: `make logs` or `docker-compose logs`
4. Verify ports are available: `netstat -tulpn | grep :5432`

### Health Check Failures

Health checks may take time to pass during initial startup:

- PostgreSQL: ~30 seconds
- Qdrant: ~40 seconds  
- MinIO: ~60 seconds

If health checks continue failing, check service logs for specific error messages.

### Permission Issues

If you encounter permission errors with volumes:

```bash
# Reset Docker permissions
sudo chown -R $USER:$USER /var/lib/docker/volumes/
```

### Memory Issues

If services are slow to start or crash, ensure sufficient memory:

```bash
# Check available memory
free -h

# Monitor Docker resource usage
docker stats
```

## Development Workflow

1. **Initial Setup**: Run `make init` to start services with default configuration
2. **Daily Development**: Use `make up` to start services, `make down` to stop
3. **Debugging**: Use `make logs` or service-specific log commands
4. **Reset**: Use `make clean` to completely reset the environment

## Security Notes

- Default credentials are provided for development only
- In production, change all passwords and access keys
- Consider using Docker secrets or external secret management
- Enable SSL/TLS for production deployments
- Configure proper network isolation and firewalls

## Next Steps

After infrastructure is running:

1. Configure your application to use the environment variables
2. Run database migrations if needed
3. Create MinIO buckets for your application
4. Set up Qdrant collections for your vector data
5. Configure backup strategies for persistent data

## Support

For issues with the infrastructure setup:

1. Check the troubleshooting section above
2. Review service logs for specific error messages
3. Verify Docker and Docker Compose versions
4. Ensure sufficient system resources are available
