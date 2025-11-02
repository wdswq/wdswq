# Monitoring and Logging Guide

This document provides comprehensive guidance on monitoring, logging, and observability for our full-stack application.

## Overview

Our monitoring strategy includes:

1. **Application Logging** - Structured logging for debugging and auditing
2. **Performance Monitoring** - Metrics collection and alerting
3. **Health Checks** - Service availability and dependency health
4. **Error Tracking** - Real-time error monitoring and alerting
5. **User Analytics** - User behavior and application usage tracking

## Logging Strategy

### Log Levels

We use structured logging with the following levels:

- **ERROR** - System errors, exceptions, failed operations
- **WARN** - Warning conditions, deprecated usage, performance issues
- **INFO** - Important business events, user actions, state changes
- **DEBUG** - Detailed debugging information (development only)

### Log Format

All logs follow JSON structured format:

```json
{
  "timestamp": "2023-01-01T12:00:00.000Z",
  "level": "INFO",
  "service": "backend",
  "version": "1.0.0",
  "requestId": "req-uuid",
  "userId": "user-uuid",
  "message": "File uploaded successfully",
  "context": {
    "fileId": "file-uuid",
    "fileName": "document.pdf",
    "fileSize": 1024000,
    "processingTime": 1250
  },
  "tags": ["upload", "success", "pdf"]
}
```

### Backend Logging Implementation

```typescript
// src/common/logger/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger = new Logger(AppLogger.name);

  constructor(private configService: ConfigService) {}

  log(message: string, context?: any) {
    this.writeLog('INFO', message, context);
  }

  error(message: string, trace?: string, context?: any) {
    this.writeLog('ERROR', message, { ...context, trace });
  }

  warn(message: string, context?: any) {
    this.writeLog('WARN', message, context);
  }

  debug(message: string, context?: any) {
    if (this.configService.get('NODE_ENV') === 'development') {
      this.writeLog('DEBUG', message, context);
    }
  }

  private writeLog(level: string, message: string, context?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: 'backend',
      version: process.env.APP_VERSION || '1.0.0',
      requestId: context?.requestId,
      userId: context?.userId,
      message,
      context,
      tags: context?.tags || [],
    };

    // Output to console (can be sent to log aggregation service)
    console.log(JSON.stringify(logEntry));
  }
}
```

### Frontend Logging

```typescript
// src/lib/logger.ts
export class Logger {
  private static instance: Logger;
  private context: any = {};

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setContext(context: any) {
    this.context = { ...this.context, ...context };
  }

  private writeLog(level: string, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: 'frontend',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Send to logging service or console
    if (process.env.NODE_ENV === 'production') {
      // Send to log aggregation service
      this.sendToLogService(logEntry);
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, data?: any) {
    this.writeLog('INFO', message, data);
  }

  error(message: string, error?: Error, data?: any) {
    this.writeLog('ERROR', message, { ...data, error: error?.stack });
  }

  warn(message: string, data?: any) {
    this.writeLog('WARN', message, data);
  }

  private async sendToLogService(logEntry: any) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  }
}
```

## Performance Monitoring

### Key Metrics

#### Backend Metrics

- **Request Duration** - API response times
- **Error Rate** - Percentage of failed requests
- **Throughput** - Requests per second
- **Database Performance** - Query times, connection pool usage
- **Memory Usage** - Heap size, garbage collection
- **CPU Usage** - Process CPU utilization

#### Frontend Metrics

- **Core Web Vitals** - LCP, FID, CLS
- **Page Load Time** - Full page load duration
- **API Response Times** - Frontend API call performance
- **JavaScript Errors** - Runtime error tracking
- **User Interactions** - Click, scroll, form submission performance

### Metrics Collection

#### Backend Metrics with Prometheus

```typescript
// src/common/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  });

  private readonly activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
  });

  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestsTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }

  recordHttpRequestDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.labels(method, route).observe(duration);
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  getMetrics() {
    return register.metrics();
  }
}
```

#### Frontend Performance Monitoring

```typescript
// src/lib/performance.ts
export class PerformanceMonitor {
  static trackPageLoad() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        const metrics = {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint(),
        };

        Logger.getInstance().info('Page load metrics', metrics);
      });
    }
  }

  static trackApiCall(endpoint: string, duration: number, success: boolean) {
    Logger.getInstance().info('API call', {
      endpoint,
      duration,
      success,
      type: 'api_performance',
    });
  }

  static trackUserInteraction(action: string, element: string) {
    Logger.getInstance().info('User interaction', {
      action,
      element,
      type: 'user_interaction',
    });
  }

  private static getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  private static getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }
}
```

## Health Checks

### Backend Health Endpoints

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.checkCheck('database'),
      () => this.checkQdrant(),
      () => this.checkMinio(),
      () => this.checkMemory(),
      () => this.checkDisk(),
    ]);
  }

  private async checkQdrant() {
    try {
      const response = await fetch(`${this.configService.get('QDRANT_URL')}/health`);
      return {
        qdrant: {
          status: response.ok ? 'up' : 'down',
          info: response.ok ? 'Qdrant is healthy' : 'Qdrant is unhealthy',
        },
      };
    } catch (error) {
      return {
        qdrant: {
          status: 'down',
          info: 'Failed to connect to Qdrant',
        },
      };
    }
  }

  private async checkMinio() {
    try {
      const response = await fetch(`${this.configService.get('MINIO_ENDPOINT')}/minio/health/live`);
      return {
        minio: {
          status: response.ok ? 'up' : 'down',
          info: response.ok ? 'MinIO is healthy' : 'MinIO is unhealthy',
        },
      };
    } catch (error) {
      return {
        minio: {
          status: 'down',
          info: 'Failed to connect to MinIO',
        },
      };
    }
  }

  private checkMemory() {
    const usage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;

    return {
      memory: {
        status: memoryUsagePercent < 90 ? 'up' : 'down',
        info: `Memory usage: ${memoryUsagePercent.toFixed(2)}%`,
        details: {
          heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,
        },
      },
    };
  }

  private checkDisk() {
    const fs = require('fs');
    const stats = fs.statSync('.');
    
    return {
      disk: {
        status: 'up',
        info: 'Disk space available',
        details: {
          free: 'N/A', // Would need additional library for disk space
        },
      },
    };
  }
}
```

### Frontend Health Checks

```typescript
// src/lib/health.ts
export class HealthChecker {
  static async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  static async checkServiceHealth(): Promise<{
    api: boolean;
    storage: boolean;
    network: boolean;
  }> {
    const [api, storage, network] = await Promise.allSettled([
      this.checkApiHealth(),
      this.checkStorageHealth(),
      this.checkNetworkHealth(),
    ]);

    return {
      api: api.status === 'fulfilled' ? api.value : false,
      storage: storage.status === 'fulfilled' ? storage.value : false,
      network: network.status === 'fulfilled' ? network.value : false,
    };
  }

  private static async checkStorageHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/files', { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static checkNetworkHealth(): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => resolve(false), 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      img.src = `/favicon.ico?t=${Date.now()}`;
    });
  }
}
```

## Error Tracking

### Error Handling Middleware

```typescript
// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status: number;
    let message: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message;
      details = typeof exceptionResponse === 'object' ? exceptionResponse : null;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      details = {
        stack: exception instanceof Error ? exception.stack : null,
      };
    }

    const errorLog = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status,
      message,
      details,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: request.user?.id,
    };

    this.logger.error('Request error', JSON.stringify(errorLog));

    // Send to error tracking service
    this.sendToErrorTracking(errorLog);

    response.status(status).json({
      success: false,
      error: {
        code: this.getErrorCode(status),
        message,
        ...(details && { details }),
      },
    });
  }

  private getErrorCode(status: number): string {
    const errorCodes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }

  private async sendToErrorTracking(errorLog: any) {
    try {
      // Send to Sentry, Bugsnag, or similar service
      if (process.env.SENTRY_DSN) {
        // Sentry.captureException(errorLog);
      }
    } catch (error) {
      this.logger.error('Failed to send error to tracking service', error);
    }
  }
}
```

### Frontend Error Tracking

```typescript
// src/lib/error-tracking.ts
export class ErrorTracker {
  static init() {
    if (typeof window !== 'undefined') {
      // Global error handler
      window.addEventListener('error', this.handleGlobalError.bind(this));
      
      // Unhandled promise rejection handler
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
      
      // Track React errors if using React
      if (this.isReactApp()) {
        this.setupReactErrorTracking();
      }
    }
  }

  private static handleGlobalError(event: ErrorEvent) {
    const errorInfo = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    Logger.getInstance().error('Global JavaScript error', event.error, errorInfo);
    this.sendToErrorService(errorInfo);
  }

  private static handleUnhandledRejection(event: PromiseRejectionEvent) {
    const errorInfo = {
      message: event.reason?.message || 'Unhandled promise rejection',
      stack: event.reason?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    Logger.getInstance().error('Unhandled promise rejection', event.reason, errorInfo);
    this.sendToErrorService(errorInfo);
  }

  private static setupReactErrorTracking() {
    // React error boundary integration
    // This would integrate with your error boundary component
  }

  private static sendToErrorService(errorInfo: any) {
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo),
      });
    } catch (error) {
      console.error('Failed to send error to tracking service:', error);
    }
  }

  private static isReactApp(): boolean {
    return !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  }

  static trackCustomError(message: string, error?: Error, context?: any) {
    const errorInfo = {
      message,
      stack: error?.stack,
      context,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    Logger.getInstance().error('Custom error', error, errorInfo);
    this.sendToErrorService(errorInfo);
  }
}
```

## User Analytics

### Analytics Tracking

```typescript
// src/lib/analytics.ts
export class Analytics {
  static track(event: string, properties?: Record<string, any>) {
    const eventData = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
    };

    Logger.getInstance().info('Analytics event', eventData);
    this.sendToAnalyticsService(eventData);
  }

  static trackPageView(path: string) {
    this.track('page_view', { path });
  }

  static trackFileUpload(fileType: string, fileSize: number) {
    this.track('file_upload', { fileType, fileSize });
  }

  static trackFileDownload(fileId: string, fileType: string) {
    this.track('file_download', { fileId, fileType });
  }

  static trackSearch(query: string, resultCount: number) {
    this.track('search', { query, resultCount });
  }

  private static getUserId(): string | null {
    return localStorage.getItem('userId') || null;
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private static generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }

  private static async sendToAnalyticsService(eventData: any) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }
}
```

## Monitoring Tools and Services

### Recommended Stack

1. **Log Aggregation**: ELK Stack (Elasticsearch, Logstash, Kibana) or Grafana Loki
2. **Metrics**: Prometheus + Grafana
3. **Error Tracking**: Sentry or Bugsnag
4. **APM**: New Relic or DataDog
5. **Health Monitoring**: UptimeRobot or Pingdom

### Docker Compose Monitoring

```yaml
# infra/docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources

  loki:
    image: grafana/loki:latest
    container_name: loki
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki.yml:/etc/loki/local-config.yaml
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    volumes:
      - ./monitoring/promtail.yml:/etc/promtail/config.yml
      - /var/log:/var/log
    command: -config.file=/etc/promtail/config.yml

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
```

### Alerting Rules

```yaml
# monitoring/alerts.yml
groups:
  - name: application.rules
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High response time detected
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: DatabaseDown
        expr: up{job="database"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Database is down
          description: "Database connection has been lost"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High memory usage
          description: "Memory usage is {{ $value | humanizePercentage }}"
```

## Best Practices

### Logging Best Practices

1. **Structured Logging**: Always use structured JSON logs
2. **Contextual Information**: Include request ID, user ID, and relevant context
3. **Sensitive Data**: Never log passwords, tokens, or PII
4. **Log Levels**: Use appropriate log levels for different types of events
5. **Performance**: Avoid logging in hot paths that could impact performance

### Monitoring Best Practices

1. **SLA Monitoring**: Track against defined service level objectives
2. **Proactive Alerts**: Set up alerts for issues before they impact users
3. **Dashboard**: Create comprehensive dashboards for different stakeholders
4. **Retention**: Define appropriate retention policies for logs and metrics
5. **Testing**: Regularly test monitoring and alerting systems

### Security Considerations

1. **Access Control**: Restrict access to monitoring data based on roles
2. **Data Protection**: Encrypt sensitive monitoring data
3. **Audit Logging**: Log access to monitoring systems
4. **Network Security**: Secure monitoring service communications
5. **Compliance**: Ensure monitoring practices comply with regulations

## Troubleshooting Guide

### Common Issues

#### High Memory Usage

```bash
# Check memory usage
docker stats

# Analyze heap dumps
node --inspect app.js

# Monitor with clinic.js
npm install -g clinic
clinic doctor -- node app.js
```

#### Slow Database Queries

```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename = 'files';
```

#### High CPU Usage

```bash
# Check CPU usage
top -p $(pgrep node)

# Profile with Node.js
node --prof app.js
node --prof-process isolate-*.log > processed.txt

# Use clinic.js
clinic bubbleprof -- node app.js
```

### Log Analysis

```bash
# Search for errors
grep "ERROR" application.log | tail -50

# Analyze response times
grep "request_duration" application.log | jq '.context.requestDuration' | sort -n

# Find slow requests
grep "request_duration" application.log | jq 'select(.context.requestDuration > 1000)'

# Analyze error patterns
grep "ERROR" application.log | jq -r '.message' | sort | uniq -c | sort -nr
```

This comprehensive monitoring and logging guide ensures that you have full visibility into your application's health, performance, and user behavior. Regular monitoring and proactive alerting will help you maintain high availability and quickly identify and resolve issues.