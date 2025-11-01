# Monorepo

A modern pnpm-based monorepo with TypeScript, ESLint, Prettier, and shared configurations.

## 📁 Structure

```
monorepo/
├── apps/                 # Applications
│   ├── web/             # Frontend web application
│   └── api/             # Backend API service
├── packages/            # Shared packages
│   ├── ui/              # UI component library
│   ├── utils/           # Utility functions
│   └── typescript-config/ # Shared TypeScript configs
├── infra/               # Infrastructure as code
│   ├── docker-compose.yml
│   ├── postgres/
│   └── localstack/
├── docs/                # Documentation
└── .github/             # GitHub workflows (if needed)
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose (for local development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd monorepo

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start all services in development mode
pnpm dev

# Start specific app
pnpm --filter @monorepo/web dev
pnpm --filter @monorepo/api dev

# Start infrastructure services
docker-compose -f infra/docker-compose.yml up -d
```

### Building

```bash
# Build all packages and apps
pnpm build

# Build specific package
pnpm --filter @monorepo/ui build
```

## 🛠️ Available Scripts

| Script              | Description                            |
| ------------------- | -------------------------------------- |
| `pnpm dev`          | Start all apps in development mode     |
| `pnpm build`        | Build all packages and apps            |
| `pnpm lint`         | Lint all files                         |
| `pnpm lint:fix`     | Fix linting issues                     |
| `pnpm format`       | Format all files with Prettier         |
| `pnpm format:check` | Check if files are formatted           |
| `pnpm typecheck`    | Type check all TypeScript files        |
| `pnpm test`         | Run all tests                          |
| `pnpm clean`        | Clean build artifacts and node_modules |

## 📦 Package Management

This monorepo uses pnpm with workspaces. Key features:

- **Efficient dependency management**: Shared dependencies are hoisted to the root
- **Fast installation**: pnpm's content-addressable storage
- **Strict peer dependencies**: Ensures compatibility
- **Workspace filtering**: Target specific packages with `--filter`

### Common Commands

```bash
# Add dependency to specific package
pnpm --filter @monorepo/web add react-router-dom

# Add dev dependency to root
pnpm add -D -w eslint-plugin-react-hooks

# Add dependency to all packages
pnpm -r add lodash

# Remove dependency
pnpm remove @monorepo/ui
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

- **Database**: PostgreSQL connection settings
- **Cache**: Redis configuration
- **Storage**: S3-compatible storage settings
- **AI Services**: OpenAI, Anthropic, Google AI API keys
- **Authentication**: JWT and OAuth settings

### TypeScript Configurations

Shared TypeScript configs are available in `@monorepo/typescript-config`:

- `base.json`: Base TypeScript configuration
- `react-library.json`: For React component libraries
- `nextjs.json`: For Next.js applications

Use them in your `tsconfig.json`:

```json
{
  "extends": "@monorepo/typescript-config/react-library.json"
}
```

## 🏗️ Infrastructure

Local development infrastructure is managed via Docker Compose:

- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **LocalStack**: AWS services simulation (S3, SQS, Lambda, DynamoDB)

Start infrastructure services:

```bash
docker-compose -f infra/docker-compose.yml up -d
```

## 📝 Code Quality

### ESLint

- Base configuration extends `eslint:recommended` and `@typescript-eslint/recommended`
- Prettier integration via `eslint-config-prettier`
- Custom rules for consistency

### Prettier

- Opinionated formatting with 2-space indentation
- Single quotes, trailing commas (ES5)
- Consistent line endings and spacing

### TypeScript

- Strict mode enabled
- Path aliases configured (`@/*`, `@packages/*`, `@apps/*`)
- Incremental compilation for faster builds

## 🔄 Workflow

### Feature Development

1. Create a feature branch from `main`
2. Make changes in relevant packages/apps
3. Run linting and type checking: `pnpm lint && pnpm typecheck`
4. Test your changes
5. Commit and open a pull request

### Publishing

This monorepo uses Changesets for version management:

```bash
# Add a changeset for your changes
pnpm changeset

# Version packages based on changesets
pnpm version-packages

# Publish to npm
pnpm release
```

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
