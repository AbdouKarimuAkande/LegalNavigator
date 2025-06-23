
# Testing Documentation - LawHelp Application

## Table of Contents
1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Testing Levels Implementation](#testing-levels-implementation)
3. [Test Configuration](#test-configuration)
4. [Unit Tests](#unit-tests)
5. [Integration Tests](#integration-tests)
6. [End-to-End Tests](#end-to-end-tests)
7. [Coverage Reports](#coverage-reports)
8. [Test Automation](#test-automation)
9. [Sample Test Cases](#sample-test-cases)
10. [Running Tests](#running-tests)
11. [Continuous Integration](#continuous-integration)

## Testing Strategy Overview

The LawHelp application implements a comprehensive three-tier testing strategy to ensure robust functionality, security, and performance across all components.

### Testing Objectives
- **Quality Assurance**: Ensure all features work as expected
- **Security Validation**: Verify authentication, authorization, and data protection
- **Performance Monitoring**: Validate response times and system stability
- **Regression Prevention**: Catch breaking changes early
- **Code Coverage**: Target minimum 80% code coverage across all modules

### Testing Principles
- **Test Pyramid**: Focus on unit tests, supported by integration tests, with critical E2E flows
- **Continuous Testing**: Automated test execution on every commit
- **Test-Driven Development**: Write tests alongside feature development
- **Quality Gates**: Enforce coverage thresholds and test passage for deployments

## Testing Levels Implementation

### 1. Unit Tests (Foundation Level)
**Purpose**: Test individual components, functions, and services in isolation
**Coverage Target**: 85%+
**Location**: `server/__tests__/`, `client/src/__tests__/`

**Focus Areas**:
- Authentication service logic
- 2FA implementation (TOTP & Email verification)
- AI legal service processing
- Data validation and sanitization
- Business logic components
- Individual React components
- Utility functions and helpers

### 2. Integration Tests (Service Level)
**Purpose**: Test interactions between different modules and external services
**Coverage Target**: Key API endpoints and service integrations
**Location**: `server/__tests__/integration/`

**Focus Areas**:
- API route functionality end-to-end
- Database interactions and queries
- Service-to-service communication
- WebSocket real-time features
- External API integrations
- Authentication middleware
- Error handling across layers

### 3. End-to-End Tests (User Journey Level)
**Purpose**: Test complete user workflows from frontend to backend
**Coverage Target**: Critical user paths
**Location**: `client/src/__tests__/e2e/`

**Focus Areas**:
- User registration and login flows
- Chat functionality with AI responses
- Lawyer search and filtering
- Profile management
- Two-factor authentication setup
- Error state handling
- Cross-browser compatibility

## Test Configuration

### Jest Configuration
```javascript
// jest.config.cjs
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/server', '<rootDir>/client/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/?(*.)+(spec|test).{ts,tsx}'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'server/**/*.ts',
    'client/src/**/*.{ts,tsx}',
    '!server/index.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!client/src/main.tsx',
    '!client/src/test-setup.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'cobertura'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/client/src/test-setup.ts', '<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  verbose: true,
  collectCoverage: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};
```

### Test Environment Setup
```typescript
// tests/setup.ts
import { jest } from '@jest/globals';

// Global test setup
beforeAll(async () => {
  // Initialize test database
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterAll(async () => {
  // Cleanup test resources
});

// Global test utilities
global.createTestUser = async () => {
  const testUser = {
    name: 'Test User',
    email: `user-${Date.now()}@example.com`,
    passwordHash: 'hashed-password',
    isLawyer: false,
    emailVerified: true,
    twoFactorEnabled: false
  };
  
  return testUser;
};

global.createTestLawyer = async () => {
  const testLawyer = {
    name: 'Test Lawyer',
    email: `lawyer-${Date.now()}@example.com`,
    passwordHash: 'hashed-password',
    isLawyer: true,
    emailVerified: true,
    specialization: 'Contract Law',
    location: 'Yaoundé',
    licenseNumber: 'TEST123',
    experience: 5,
    rating: 4.5,
    languages: ['French', 'English']
  };
  
  return testLawyer;
};
```

## Unit Tests

### Authentication Service Tests
```typescript
// server/__tests__/auth-service.test.ts
import { validatePassword, generateJWT } from '../auth-service';

describe('Authentication Service', () => {
  describe('Password Validation', () => {
    it('should validate strong passwords', async () => {
      const result = await validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
    });

    it('should reject weak passwords', async () => {
      const result = await validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password too short');
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT tokens', async () => {
      const user = { id: '1', email: 'test@example.com' };
      const token = generateJWT(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });
});
```

### AI Service Tests
```typescript
// server/__tests__/ai-service.test.ts
import { processLegalQuery } from '../ai-service';

describe('AI Legal Service', () => {
  describe('Query Processing', () => {
    it('should process legal queries correctly', async () => {
      const query = 'What are marriage requirements in Cameroon?';
      const response = await processLegalQuery(query, 'en');
      
      expect(response.answer).toBeDefined();
      expect(response.category).toBe('Family Law');
      expect(response.confidence).toBeGreaterThan(0.7);
      expect(response.disclaimer).toBeDefined();
    });

    it('should handle multilingual queries', async () => {
      const query = 'Quelles sont les conditions pour créer une entreprise?';
      const response = await processLegalQuery(query, 'fr');
      
      expect(response.answer).toBeDefined();
      expect(response.language).toBe('fr');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid queries gracefully', async () => {
      const response = await processLegalQuery('', 'en');
      expect(response.error).toBeDefined();
    });
  });
});
```

### React Component Tests
```typescript
// client/src/__tests__/auth.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../hooks/use-auth';

describe('Authentication Components', () => {
  describe('Login Form', () => {
    it('should render login form correctly', () => {
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
      const user = userEvent.setup();
      const mockLogin = jest.fn();
      
      render(
        <AuthProvider>
          <LoginForm onLogin={mockLogin} />
        </AuthProvider>
      );
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));
      
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should handle login with 2FA requirement', async () => {
      // Test 2FA flow
      global.fetch = jest.fn().mockResolvedValueOnce({
        json: () => Promise.resolve({
          requiresTwoFactor: true,
          userId: 'user-123'
        })
      });

      const user = userEvent.setup();
      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(screen.getByText(/two-factor/i)).toBeInTheDocument();
      });
    });
  });
});
```

## Integration Tests

### API Route Integration Tests
```typescript
// server/__tests__/integration/auth.integration.test.ts
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../routes';

describe('Authentication API Integration', () => {
  let app: express.Application;
  let authToken: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    await registerRoutes(app);
  });

  describe('User Registration', () => {
    it('should register new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toContain('registered successfully');
      expect(response.body.userId).toBeDefined();
    });

    it('should prevent duplicate email registration', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User 2',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('User Authentication', () => {
    it('should authenticate user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      authToken = response.body.token;
    });

    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });

  describe('Protected Endpoints', () => {
    it('should create chat session with authentication', async () => {
      const response = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Legal Consultation' })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe('Legal Consultation');
    });

    it('should reject requests without authentication', async () => {
      await request(app)
        .post('/api/chat/sessions')
        .send({ title: 'Legal Consultation' })
        .expect(401);
    });
  });
});
```

## End-to-End Tests

### Complete User Journey Tests
```typescript
// client/src/__tests__/e2e/user-flow.e2e.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('End-to-End User Flows', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should complete registration to consultation flow', async () => {
    const user = userEvent.setup();

    // Mock API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Registration successful', userId: '123' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'test-token', user: { id: '123', email: 'user@example.com' } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          id: 'session-123',
          answer: 'Marriage requirements in Cameroon include...',
          category: 'Family Law'
        })
      });

    render(<App />);

    // Registration flow
    await user.click(screen.getByRole('button', { name: /get started/i }));
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    // Verify registration success
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });

    // Login flow
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Navigate to chat
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /chat/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('link', { name: /chat/i }));
    
    // Send legal query
    await user.type(
      screen.getByPlaceholderText(/ask a legal question/i),
      'What are the requirements for marriage in Cameroon?'
    );
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Verify AI response
    await waitFor(() => {
      expect(screen.getByText(/marriage requirements/i)).toBeInTheDocument();
    });
  });

  it('should handle error states gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock API error response
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await user.click(screen.getByRole('button', { name: /get started/i }));
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
    });
  });
});
```

## Coverage Reports

### Current Coverage Status
Based on actual test execution results:

```
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
------------------------|---------|----------|---------|---------|----------------
server/__tests__/       |    0.0  |   100.0  |    0.0  |    0.0  | 1-39
client/src/components/  |   12.5  |    8.3   |   14.3  |   12.8  | Various
client/src/hooks/       |   25.0  |   16.7   |   33.3  |   24.1  | Various
server/db-mysql.ts     |   60.0  |   50.0   |   66.7  |   58.3  | 15-25,35-40
server/db.ts           |   75.0  |   62.5   |   80.0  |   73.9  | 45-50,60-65
------------------------|---------|----------|---------|---------|----------------
TOTAL                  |   28.4  |   24.1   |   31.8  |   27.6  | 
```

### Current Status Analysis
- **Overall Coverage**: 27.6% (below 80% target)
- **Statement Coverage**: 28.4% - Needs significant improvement
- **Branch Coverage**: 24.1% - Conditional logic coverage lacking
- **Function Coverage**: 31.8% - Many functions untested
- **Line Coverage**: 27.6% - Comprehensive testing needed

### Critical Coverage Gaps
1. **AI Service Tests**: Currently 0% coverage on test files
2. **Authentication Tests**: Partial implementation
3. **Storage Layer**: Database operations need more coverage
4. **Error Handling**: Exception paths not adequately tested
5. **React Components**: UI component testing incomplete

## Test Automation

### Automated Test Execution
```bash
# Run all tests with coverage
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Generate detailed coverage report
npm run test:coverage

# Run tests in watch mode for development
npm run test:watch

# Generate JUnit XML for CI/CD
npm run test:ci
```

### Package Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --reporters=default --reporters=jest-junit",
    "test:unit": "jest --testPathPattern=__tests__/.*\\.test\\.(ts|tsx)$",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e"
  }
}
```

## Sample Test Cases

### Security Test Cases
```typescript
describe('Security Testing', () => {
  it('should prevent SQL injection attacks', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: maliciousInput, password: 'password' });
    
    expect(response.status).toBe(400);
    // Verify users table still exists
    const users = await storage.getAllUsers();
    expect(users).toBeDefined();
  });

  it('should enforce rate limiting', async () => {
    // Attempt multiple rapid requests
    const requests = Array(10).fill(null).map(() =>
      request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrong'
      })
    );

    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.status === 429);
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });

  it('should validate JWT tokens properly', async () => {
    const invalidToken = 'invalid.jwt.token';
    await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
  });
});
```

### Performance Test Cases
```typescript
describe('Performance Testing', () => {
  it('should respond to AI queries within 3 seconds', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .post('/api/ai/legal-query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        question: 'What are business registration requirements?',
        language: 'en'
      });

    const responseTime = Date.now() - startTime;
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(3000);
  });

  it('should handle concurrent user sessions', async () => {
    const concurrentRequests = Array(20).fill(null).map((_, index) =>
      request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: `Session ${index}` })
    );

    const responses = await Promise.all(concurrentRequests);
    const successfulResponses = responses.filter(r => r.status === 201);
    expect(successfulResponses.length).toBe(20);
  });
});
```

## Running Tests

### Local Development
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests in watch mode
npm run test:watch

# Debug tests
npm run test:debug
```

### Test Results Location
- **Coverage Reports**: `./coverage/`
- **JUnit XML**: `./test-results/junit.xml`
- **Coverage Summary**: `./coverage/coverage-summary.json`

## Continuous Integration

### Quality Gates
- **Test Passage**: All tests must pass before merge
- **Coverage Improvement**: New code must increase overall coverage
- **Security Scans**: No critical vulnerabilities allowed
- **Performance Benchmarks**: Response times within acceptable limits
- **Code Quality**: ESLint and TypeScript compilation must pass

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run lint
      - run: npm run type-check
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

## Test Implementation Status

### Completed ✅
- Basic test infrastructure setup
- Jest configuration
- Test utilities and setup files
- Sample unit tests for authentication
- Integration test framework
- E2E test structure
- Coverage reporting setup

### In Progress 🔄
- Expanding unit test coverage
- Database integration tests
- React component testing
- Error handling tests

### TODO 📋
- Achieve 80%+ code coverage
- Performance testing implementation
- Visual regression testing
- Accessibility testing
- Mobile responsive testing
- Security penetration testing

## Next Steps for Test Coverage Improvement

### Priority 1: Core Service Testing
1. Complete AI service unit tests
2. Expand authentication service tests
3. Add storage layer tests
4. Implement 2FA service tests

### Priority 2: Integration Testing
1. Database operation tests
2. API endpoint comprehensive testing
3. WebSocket communication tests
4. External service integration tests

### Priority 3: Frontend Testing
1. React component unit tests
2. Hook testing with React Testing Library
3. Form validation tests
4. User interaction flows

### Priority 4: Security & Performance
1. Security vulnerability tests
2. Input validation tests
3. Rate limiting tests
4. Performance benchmark tests

This testing documentation reflects the current implementation status and provides a roadmap for achieving comprehensive test coverage across the LawHelp application.
