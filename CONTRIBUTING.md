# Contributing to Monorepo

Thank you for your interest in contributing! This document provides guidelines and best practices for contributing to this monorepo.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose (for local development)

### Setup

1. **Fork and clone** the repository
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```
4. **Start infrastructure** (optional but recommended):
   ```bash
   docker-compose -f infra/docker-compose.yml up -d
   ```

## 📁 Project Structure

Understanding the monorepo structure is essential for effective contributions:

- **`apps/`**: Complete applications (web frontend, API backend)
- **`packages/`**: Shared libraries and utilities
- **`infra/`**: Infrastructure configuration and scripts
- **`docs/`**: Project documentation

## 🛠️ Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

### 2. Make Changes

- Follow existing code patterns and conventions
- Add tests for new functionality
- Update documentation as needed

### 3. Run Quality Checks

```bash
# Lint and fix issues
pnpm lint:fix

# Format code
pnpm format

# Type check
pnpm typecheck

# Run tests
pnpm test
```

### 4. Test Your Changes

```bash
# Start development servers
pnpm dev

# Or test specific packages
pnpm --filter @monorepo/web dev
pnpm --filter @monorepo/api dev
```

### 5. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add user authentication feature
fix: resolve memory leak in data processing
docs: update API documentation
chore: upgrade dependencies
```

### 6. Open a Pull Request

- Provide a clear description of changes
- Link related issues
- Ensure all CI checks pass

## 📦 Package Development

### Creating New Packages

1. **Create package directory**:

   ```bash
   mkdir packages/new-package
   cd packages/new-package
   ```

2. **Initialize package.json**:

   ```bash
   pnpm init
   ```

3. **Configure TypeScript** (if applicable):

   ```json
   {
     "extends": "@monorepo/typescript-config/base.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src"
     }
   }
   ```

4. **Add to root workspace** (if needed):
   ```json
   // root package.json
   "workspaces": [
     "packages/*",
     "apps/*"
   ]
   ```

### Package Dependencies

- **Internal dependencies**: Use workspace protocol

  ```json
  {
    "dependencies": {
      "@monorepo/utils": "workspace:*"
    }
  }
  ```

- **External dependencies**: Add to specific package, not root
  ```bash
  pnpm --filter @monorepo/ui add framer-motion
  ```

## 🎨 Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Prefer explicit return types for public APIs
- Use functional programming patterns where appropriate
- Avoid `any` type - use `unknown` or proper typing

### React Components

- Use functional components with hooks
- Follow TypeScript best practices
- Use proper prop typing with interfaces
- Implement proper error boundaries

### File Naming

- **Components**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`, `apiClient.ts`)
- **Types**: camelCase with `.types.ts` suffix (`user.types.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

## 🧪 Testing

### Test Structure

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── utils/
│   ├── formatDate.ts
│   └── formatDate.test.ts
```

### Testing Guidelines

- Write unit tests for utility functions
- Test React components with appropriate testing library
- Mock external dependencies
- Aim for high test coverage on critical paths

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests for specific package
pnpm --filter @monorepo/utils test
```

## 📝 Documentation

### Code Documentation

- Use JSDoc comments for public APIs
- Document complex business logic
- Provide examples for utility functions

### README Updates

- Update README.md for significant changes
- Document new packages in the structure section
- Update environment variable documentation

## 🔄 Release Process

This project uses Changesets for version management:

### Adding Changesets

```bash
# Add a changeset for your changes
pnpm changeset
```

Follow the prompts to describe your changes and choose version bump type.

### Version Bumping

```bash
# Update versions based on changesets
pnpm version-packages
```

### Publishing

```bash
# Build and publish all packages
pnpm release
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**: Node version, pnpm version, OS
2. **Reproduction steps**: Minimal reproduction example
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Error messages**: Full error stack traces

## 💡 Feature Requests

Feature requests should:

1. **Describe the problem**: What problem are you trying to solve?
2. **Propose a solution**: How do you envision the solution?
3. **Consider alternatives**: What other approaches were considered?
4. **Provide context**: Why is this feature important?

## 🤝 Code Review

### Review Guidelines

- **Be constructive**: Focus on improving the code
- **Be thorough**: Check for bugs, performance, and maintainability
- **Be respectful**: Maintain a positive and collaborative tone

### Getting Reviews

- Request reviews from relevant team members
- Address feedback promptly
- Explain complex changes in comments

## 🏆 Recognition

Contributors are recognized in:

- **AUTHORS.md**: List of all contributors
- **Release notes**: Mentioned in relevant changelogs
- **GitHub**: Recognized through merge commits

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check existing docs first

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to this monorepo! Your contributions help make this project better for everyone.
