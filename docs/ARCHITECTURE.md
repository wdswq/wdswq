# Architecture and Deployment Guide

This document provides comprehensive architecture diagrams, deployment strategies, and infrastructure setup for our full-stack application.

## System Architecture Overview

### High-Level Architecture

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

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer                            │
│                      (Nginx/Cloudflare)                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐          ┌────────▼────────┐
│   Frontend      │          │    Backend      │
│   Containers    │          │   Containers    │
│                 │          │                 │
│ ┌─────────────┐ │          │ ┌─────────────┐ │
│ │ Next.js App │ │          │ │ NestJS App  │ │
│ └─────────────┘ │          │ └─────────────┘ │
│                 │          │                 │
│ ┌─────────────┐ │          │ ┌─────────────┐ │
│ │ Static Files│ │          │ │ API Gateway │ │
│ └─────────────┘ │          │ └─────────────┘ │
└─────────────────┘          └─────────────────┘
        │                           │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │   Infrastructure Layer    │
        │                           │
        │ ┌─────────┐ ┌──────────┐ │
        │ │PostgreSQL│ │ Qdrant   │ │
        │ │(Database)│ │(Vector DB)│ │
        │ └─────────┘ └──────────┘ │
        │                           │
        │ ┌─────────┐ ┌──────────┐ │
        │ │  MinIO  │ │  Redis   │ │
        │ │(Storage)│ │ (Cache)  │ │
        │ └─────────┘ └──────────┘ │
        └───────────────────────────┘
```

## Data Flow Architecture

### File Upload Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │───►│Frontend │───►│ Backend │───►│  MinIO  │───►│  Queue  │
│Browser  │    │ Upload  │    │ Upload  │    │ Storage │    │Processor│
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                      │               │               │               │
                      │               │               │               │
                      ▼               ▼               ▼               ▼
               ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
               │ Progress│    │Metadata │    │  File   │    │Extract  │
               │ Tracking│    │Storage  │    │ Storage │    │Content  │
               └─────────┘    └─────────┘    └─────────┘    └─────────┘
                                                      │               │
                                                      │               │
                                                      ▼               ▼
                                               ┌─────────┐    ┌─────────┐
                                               │Database │    │ Qdrant  │
                                               │Metadata │    │Vectors  │
                                               └─────────┘    └─────────┘
```

### Search and Retrieval Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │───►│Frontend │───►│ Backend │───►│PostgreSQL│───►│ Results │
│Search   │    │ Search  │    │ Search  │    │Metadata │    │Combine │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                      │               │               │
                      │               │               │
                      ▼               ▼               ▼
               ┌─────────┐    ┌─────────┐    ┌─────────┐
               │ Semantic│    │ Keyword │    │ Hybrid  │
               │ Search  │    │ Search  │    │ Scoring │
               └─────────┘    └─────────┘    └─────────┘
                      │               │               │
                      └───────────────┼───────────────┘
                                      │
                                      ▼
                               ┌─────────┐
                               │ Qdrant  │
                               │Vector DB│
                               └─────────┘
```

## Infrastructure Architecture

### Development Environment

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    depends_on:
      - backend

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    volumes:
      - ./apps/backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/dev_db
      - QDRANT_URL=http://qdrant:6333
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
    depends_on:
      - postgres
      - qdrant
      - minio

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: dev_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_dev_data:/qdrant/storage

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_dev_data:/data

volumes:
  postgres_dev_data:
  qdrant_dev_data:
  minio_dev_data:
```

### Production Environment

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.yourapp.com
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - QDRANT_URL=${QDRANT_URL}
      - MINIO_ENDPOINT=${MINIO_ENDPOINT}
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
    depends_on:
      - postgres
      - qdrant
      - minio
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./backups:/backups
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  qdrant:
    image: qdrant/qdrant:latest
    environment:
      QDRANT__SERVICE__HTTP_PORT: 6333
      QDRANT__SERVICE__GRPC_PORT: 6334
    volumes:
      - qdrant_prod_data:/qdrant/storage
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_prod_data:/data
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_prod_data:/data
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

volumes:
  postgres_prod_data:
  qdrant_prod_data:
  minio_prod_data:
  redis_prod_data:
```

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Layers                              │
├─────────────────────────────────────────────────────────────────┤
│ 1. Network Security                                            │
│    - WAF (Web Application Firewall)                            │
│    - DDoS Protection                                            │
│    - SSL/TLS Encryption                                         │
├─────────────────────────────────────────────────────────────────┤
│ 2. Application Security                                         │
│    - JWT Authentication                                         │
│    - RBAC (Role-Based Access Control)                          │
│    - Input Validation                                           │
│    - Rate Limiting                                              │
├─────────────────────────────────────────────────────────────────┤
│ 3. Data Security                                                │
│    - Encryption at Rest                                          │
│    - Encryption in Transit                                      │
│    - Data Masking                                               │
│    - Secure Key Management                                      │
├─────────────────────────────────────────────────────────────────┤
│ 4. Infrastructure Security                                       │
│    - Container Security                                         │
│    - Network Segmentation                                        │
│    - Server Hardening                                            │
│    - Regular Security Updates                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│   User  │───►│ Login   │───►│ Backend │───►│ JWT     │───►│ Session │
│Request  │    │ Form    │    │ Auth    │    │ Token   │    │ Store   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                      │               │               │               │
                      │               │               │               │
                      ▼               ▼               ▼               ▼
               ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
               │Password │    │Credential│    │Token    │    │Secure   │
               │Hashing  │    │Validation│    │Generation│    │Storage  │
               └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

## Deployment Strategies

### 1. Development Deployment

```bash
# Clone repository
git clone <repository-url>
cd <project-name>

# Setup environment
cp infra/.env.docker .env.local

# Start development environment
pnpm install
pnpm infra:up
pnpm dev

# Run tests
pnpm test:all
```

### 2. Staging Deployment

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
        
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
      
    - name: Run tests
      run: pnpm test:all
      
    - name: Build applications
      run: pnpm build
      
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment..."
        # Add deployment commands here
        docker-compose -f docker-compose.staging.yml up -d
```

### 3. Production Deployment

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
        
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
      
    - name: Run tests
      run: pnpm test:all
      
    - name: Build applications
      run: pnpm build
      
    - name: Security scan
      run: pnpm audit --audit-level moderate
      
    - name: Deploy to production
      run: |
        echo "Deploying to production environment..."
        # Add deployment commands here
        docker-compose -f docker-compose.prod.yml pull
        docker-compose -f docker-compose.prod.yml up -d
        
    - name: Health check
      run: |
        timeout 300 bash -c 'until curl -f http://yourapp.com/api/health; do sleep 10; done'
```

### 4. Blue-Green Deployment

```yaml
# docker-compose.blue-green.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx-blue-green.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend-blue
      - frontend-green
      - backend-blue
      - backend-green

  frontend-blue:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DEPLOYMENT_COLOR=blue

  frontend-green:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DEPLOYMENT_COLOR=green

  backend-blue:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DEPLOYMENT_COLOR=blue

  backend-green:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DEPLOYMENT_COLOR=green
```

## Infrastructure as Code

### Terraform Configuration

```hcl
# infrastructure/main.tf
provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "app-vpc"
  }
}

# Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "private-subnet-${count.index + 1}"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "app-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "app-alb"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier     = "app-postgres"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.medium"

  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "app_db"
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true

  tags = {
    Name = "app-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "app-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "app-redis"
  description                = "Redis cluster for app"
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  automatic_failover_enabled = true
  multi_az_enabled           = true
  num_cache_clusters         = 2
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  security_group_ids        = [aws_security_group.redis.id]
}

# S3 Bucket for file storage
resource "aws_s3_bucket" "app_storage" {
  bucket = "app-storage-${random_string.bucket_suffix.result}"
}

resource "aws_s3_bucket_versioning" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/app"
  retention_in_days = 14
}
```

## Monitoring and Observability

### Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Grafana Dashboards

```json
{
  "dashboard": {
    "title": "Application Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ]
  }
}
```

## Disaster Recovery

### Backup Strategy

```bash
#!/bin/bash
# scripts/backup.sh

# Database backup
pg_dump $DATABASE_URL > "backup_$(date +%Y%m%d_%H%M%S).sql"

# File storage backup
aws s3 sync s3://app-storage s3://app-backup/$(date +%Y%m%d_%H%M%S) --delete

# Configuration backup
kubectl get configmaps -o yaml > configmaps_$(date +%Y%m%d_%H%M%S).yaml
kubectl get secrets -o yaml > secrets_$(date +%Y%m%d_%H%M%S).yaml
```

### Recovery Procedures

```bash
#!/bin/bash
# scripts/recover.sh

# Database recovery
psql $DATABASE_URL < backup_20231201_120000.sql

# File storage recovery
aws s3 sync s3://app-backup/20231201_120000 s3://app-storage --delete

# Application recovery
kubectl apply -f configmaps_20231201_120000.yaml
kubectl apply -f secrets_20231201_120000.yaml
kubectl rollout restart deployment/app-backend
kubectl rollout restart deployment/app-frontend
```

## Performance Optimization

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                        Caching Layers                         │
├─────────────────────────────────────────────────────────────────┤
│ 1. Browser Cache                                               │
│    - Static assets (CSS, JS, images)                           │
│    - Cache-Control headers                                      │
├─────────────────────────────────────────────────────────────────┤
│ 2. CDN Cache                                                    │
│    - Global content distribution                                │
│    - Edge caching                                              │
├─────────────────────────────────────────────────────────────────┤
│ 3. Application Cache                                            │
│    - Redis for session data                                    │
│    - In-memory cache for frequent queries                      │
├─────────────────────────────────────────────────────────────────┤
│ 4. Database Cache                                                │
│    - Query result caching                                       │
│    - Connection pooling                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Database Optimization

```sql
-- Indexes for performance
CREATE INDEX CONCURRENTLY idx_files_user_id ON files(user_id);
CREATE INDEX CONCURRENTLY idx_files_status ON files(status);
CREATE INDEX CONCURRENTLY idx_files_created_at ON files(created_at DESC);

-- Partitioning for large tables
CREATE TABLE files_2023 PARTITION OF files
FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

-- Query optimization
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM files WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20;
```

## Scaling Strategy

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  frontend:
    build: ./apps/frontend
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production

  backend:
    build: ./apps/backend
    deploy:
      replicas: 5
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: app_db
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: repl_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  postgres-replica:
    image: postgres:15-alpine
    environment:
      PGUSER: postgres
      POSTGRES_MASTER_SERVICE: postgres
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: repl_password
    depends_on:
      - postgres

  redis:
    image: redis:7-alpine
    deploy:
      replicas: 3

volumes:
  postgres_data:
```

### Auto-scaling Configuration

```yaml
# kubernetes/hpa.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Cost Optimization

### Resource Allocation

```yaml
# Production resource limits
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  postgres:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

### Monitoring Costs

```yaml
# Cost monitoring dashboard
panels:
  - title: "Monthly Cost by Service"
    type: "stat"
    targets:
      - expr: "aws_cost_by_service"

  - title: "Cost Trend"
    type: "graph"
    targets:
      - expr: "increase(aws_cost_total[30d])"

  - title: "Resource Utilization"
    type: "graph"
    targets:
      - expr: "avg(container_memory_usage_bytes / container_spec_memory_limit_bytes)"
```

This comprehensive architecture and deployment guide provides the foundation for building, deploying, and maintaining a scalable, secure, and reliable full-stack application. The modular design allows for easy scaling and maintenance while ensuring high availability and performance.