# Backend API

NestJS-based backend API with TypeScript, validation, health checks, and comprehensive error handling.

## Features

- 🚀 NestJS with TypeScript
- ✅ Global validation pipe with class-validator
- 🛡️ Security with Helmet middleware
- 🌐 CORS configuration
- 📝 Comprehensive logging
- 🏥 Health check endpoint at `/health`
- ⚙️ Environment variable validation
- 🧪 Unit testing with Jest

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
```

### Development

```bash
# Run in development mode
pnpm start:dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:cov
```

### Production

```bash
# Build for production
pnpm build

# Start production server
pnpm start:prod
```

## API Endpoints

- `GET /` - Hello endpoint
- `GET /health` - Health check endpoint

## Environment Variables

See `.env.example` for available environment variables.

## Project Structure

```
src/
├── common/           # Shared utilities and filters
├── config/           # Configuration and validation
├── health/           # Health check module
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts           # Application entry point
```