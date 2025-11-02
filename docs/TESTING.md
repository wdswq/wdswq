# Testing Strategy and Guide

This document outlines the comprehensive testing strategy for our full-stack application, including unit tests, integration tests, and end-to-end (E2E) tests.

## Overview

Our testing pyramid consists of three main layers:

1. **Unit Tests** - Fast, isolated tests for individual functions and components
2. **Integration Tests** - Tests that verify interaction between different parts of the system
3. **End-to-End Tests** - Full user journey tests that simulate real user interactions

## Test Structure

```
project/
├── apps/
│   ├── frontend/
│   │   ├── __tests__/           # Unit tests
│   │   ├── e2e/                # E2E tests
│   │   │   ├── auth.spec.ts
│   │   │   ├── upload.spec.ts
│   │   │   ├── processing.spec.ts
│   │   │   ├── library.spec.ts
│   │   │   ├── preview.spec.ts
│   │   │   └── fixtures.ts
│   │   └── playwright.config.ts
│   └── backend/
│       ├── src/
│       │   ├── *.spec.ts       # Unit tests
│       └── test/
│           └── e2e/            # Integration tests
└── .github/workflows/
    └── ci-cd.yml               # CI/CD pipeline
```

## Unit Tests

### Frontend Unit Tests

- **Framework**: Jest + React Testing Library
- **Location**: `apps/frontend/__tests__/`
- **Coverage**: Components, hooks, utilities, and business logic
- **Command**: `pnpm --filter frontend test`

#### Example Unit Test

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Backend Unit Tests

- **Framework**: Jest + Supertest
- **Location**: `apps/backend/src/**/*.spec.ts`
- **Coverage**: Controllers, services, repositories, and utilities
- **Command**: `pnpm --filter backend test`

#### Example Unit Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should return welcome message', () => {
    expect(service.getHello()).toBe('Hello World!');
  });
});
```

## Integration Tests

### Backend Integration Tests

- **Framework**: Jest + Supertest
- **Location**: `apps/backend/test/e2e/`
- **Purpose**: Test API endpoints with real database connections
- **Command**: `pnpm --filter backend test:e2e`

#### Example Integration Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

## End-to-End Tests

### E2E Test Framework

- **Tool**: Playwright
- **Location**: `apps/frontend/e2e/`
- **Purpose**: Test complete user workflows
- **Command**: `pnpm --filter frontend test:e2e`

### Test Coverage Areas

#### 1. Authentication Flow (`auth.spec.ts`)

- User registration
- User login/logout
- Session management
- Protected route access
- Invalid credential handling

#### 2. Upload Flow (`upload.spec.ts`)

- File drag and drop
- File selection via browser
- Multiple file uploads
- File type validation
- File size validation
- Upload progress tracking

#### 3. Processing Flow (`processing.spec.ts`)

- Real-time processing status
- Processing stages
- Error handling and retry
- Completion notifications
- Different file type processing

#### 4. Library/Retrieval Flow (`library.spec.ts`)

- File listing and display
- Search functionality
- Filtering by type
- Sorting options
- File metadata display
- Batch operations
- File deletion

#### 5. Preview Flow (`preview.spec.ts`)

- File preview for different types
- Zoom controls for PDFs
- Fullscreen mode
- Metadata editing
- File sharing
- Keyboard navigation

### Running E2E Tests

#### Local Development

```bash
# Install dependencies
pnpm install

# Start infrastructure services
pnpm infra:up

# Run E2E tests in headed mode
pnpm --filter frontend test:e2e:ui

# Run E2E tests in headless mode
pnpm --filter frontend test:e2e

# Debug E2E tests
pnpm --filter frontend test:e2e:debug
```

#### CI/CD Pipeline

E2E tests run automatically in the CI pipeline with:
- Dockerized dependencies (PostgreSQL, Qdrant, MinIO)
- Multiple browser engines (Chrome, Firefox, Safari)
- Video recording on failure
- Screenshot capture on failure
- HTML test reports

## Test Data Management

### Fixtures and Test Data

- **Location**: `apps/frontend/e2e/fixtures/`
- **Purpose**: Provide sample files for upload testing
- **Types**: PDF, images, videos, text files

### Database Seeding

```typescript
// Example test database setup
export const setupTestDatabase = async () => {
  const connection = await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'test_db',
    synchronize: true,
  });

  // Seed test data
  await seedTestData(connection);
  
  return connection;
};
```

## Best Practices

### Test Writing Guidelines

1. **Descriptive Test Names**: Use clear, action-oriented test names
2. **Page Object Pattern**: Separate test logic from page interactions
3. **Test Isolation**: Each test should be independent and not rely on others
4. **Proper Assertions**: Use specific assertions with meaningful error messages
5. **Cleanup**: Clean up test data after each test

### Page Object Example

```typescript
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid=email-input]', email);
    await this.page.fill('[data-testid=password-input]', password);
    await this.page.click('[data-testid=login-button]');
  }

  async getErrorMessage() {
    return this.page.locator('[data-testid=error-message]');
  }
}
```

### Test Data Factory

```typescript
export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      id: faker.datatype.uuid(),
      email: faker.internet.email(),
      name: faker.name.fullName(),
      createdAt: new Date(),
      ...overrides,
    };
  }
}
```

## Monitoring and Reporting

### Test Reports

- **HTML Reports**: Generated by Playwright for visual test results
- **JSON Reports**: Machine-readable results for CI integration
- **JUnit Reports**: Compatible with CI/CD systems
- **Coverage Reports**: Generated by Jest for unit test coverage

### CI/CD Integration

- **Parallel Execution**: Tests run in parallel across multiple machines
- **Artifact Storage**: Test reports and videos stored as GitHub artifacts
- **Failure Notifications**: Automatic notifications on test failures
- **Flaky Test Detection**: Automatic retry mechanism for unstable tests

## Debugging Tips

### Local Debugging

1. **Use Playwright Inspector**: `pnpm test:e2e:debug`
2. **Headed Mode**: See browser interactions in real-time
3. **Screenshots**: Automatic capture on failure
4. **Video Recording**: Full test execution video
5. **Trace Viewer**: Detailed execution traces

### Common Issues and Solutions

#### Timing Issues

```typescript
// Use waitFor instead of fixed timeouts
await expect(page.locator('[data-testid=element]')).toBeVisible();
```

#### Network Issues

```typescript
// Mock network responses for consistent testing
await page.route('/api/files', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ files: [] }),
  });
});
```

#### Test Environment Issues

```typescript
// Ensure clean test environment
beforeEach(async () => {
  await resetTestDatabase();
  await clearLocalStorage();
});
```

## Performance Considerations

### Test Optimization

1. **Parallel Execution**: Run tests concurrently when possible
2. **Smart Waiting**: Use intelligent waits instead of fixed delays
3. **Test Isolation**: Avoid shared state between tests
4. **Resource Cleanup**: Properly clean up resources after tests

### CI/CD Optimization

1. **Caching**: Cache dependencies and test artifacts
2. **Service Health Checks**: Wait for services to be ready
3. **Selective Testing**: Run only relevant tests based on changes
4. **Resource Management**: Optimize Docker resource usage

## Future Enhancements

### Planned Improvements

1. **Visual Regression Testing**: Add visual comparison tests
2. **API Testing**: Expand API integration test coverage
3. **Performance Testing**: Add load and stress testing
4. **Accessibility Testing**: Include automated accessibility tests
5. **Mobile Testing**: Expand mobile device coverage

### Tools to Consider

- **Storybook**: Component testing and documentation
- **Cypress**: Alternative E2E testing framework
- **TestCafe**: Cross-browser testing solution
- **Percy**: Visual testing and regression detection

## Conclusion

This comprehensive testing strategy ensures high-quality releases by catching issues early and providing confidence in our application's functionality. The multi-layered approach provides fast feedback during development and thorough validation before deployment.

Regular review and maintenance of tests are essential to keep the test suite effective and relevant as the application evolves.