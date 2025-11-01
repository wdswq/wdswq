.PHONY: help up down logs clean status init

# Default target
help:
	@echo "Infrastructure Management Commands:"
	@echo ""
	@echo "  up        Start all infrastructure services"
	@echo "  down      Stop all infrastructure services"
	@echo "  logs      Show logs for all services"
	@echo "  status    Show status of all services"
	@echo "  clean     Remove all containers, volumes, and networks"
	@echo "  init      Initialize environment and start services"
	@echo "  help      Show this help message"
	@echo ""
	@echo "Service-specific commands:"
	@echo "  logs-pg   Show PostgreSQL logs"
	@echo "  logs-qd   Show Qdrant logs"
	@echo "  logs-mio  Show MinIO logs"

# Start all services
up:
	@echo "Starting infrastructure services..."
	cd infra && docker compose up -d
	@echo "Services started. Run 'make status' to check health."

# Stop all services
down:
	@echo "Stopping infrastructure services..."
	cd infra && docker compose down
	@echo "Services stopped."

# Show logs for all services
logs:
	cd infra && docker compose logs -f

# Show status of all services
status:
	@echo "Checking service status..."
	cd infra && docker compose ps

# Remove all containers, volumes, and networks
clean:
	@echo "Removing all infrastructure containers, volumes, and networks..."
	cd infra && docker compose down -v --remove-orphans
	@echo "Cleanup complete."

# Initialize environment and start services
init:
	@echo "Initializing infrastructure..."
	@if [ ! -f infra/.env ]; then \
		echo "Creating .env file from .env.docker..."; \
		cp infra/.env.docker infra/.env; \
		echo "Edit infra/.env to customize your configuration."; \
	fi
	$(MAKE) up
	@echo ""
	@echo "Infrastructure initialized!"
	@echo "PostgreSQL: localhost:5432"
	@echo "Qdrant: localhost:6333"
	@echo "MinIO: localhost:9000 (Console: localhost:9001)"
	@echo ""
	@echo "Default credentials:"
	@echo "  PostgreSQL: postgres/postgres"
	@echo "  MinIO: minioadmin/minioadmin"

# Service-specific logs
logs-pg:
	cd infra && docker compose logs -f postgres

logs-qd:
	cd infra && docker compose logs -f qdrant

logs-mio:
	cd infra && docker compose logs -f minio