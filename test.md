# LawHelp - Test Documentation

## Overview
This document describes the comprehensive testing strategy for the LawHelp legal assistant application, including unit tests, integration tests, and end-to-end tests.

## Test Architecture

### Testing Stack
- **Test Runner**: Jest
- **Testing Library**: @testing-library/react (for React components)
- **HTTP Testing**: Supertest (for API testing)
- **Type Safety**: TypeScript with Jest type definitions
- **Test Environment**: jsdom for browser simulation

### Test Categories

## 1. Unit Tests

### 1.1 Storage Layer Tests (`server/__tests__/storage.test.ts`)
Tests the in-memory storage implementation for data persistence.

**Test Coverage:**
- User Operations
  - Create new users with proper schema validation
  - Retrieve users by email
  - Update user information
  - Handle duplicate email prevention

- Chat Operations
  - Create chat sessions for users
  - Retrieve chat sessions by user ID
  - Create and retrieve chat messages
  - Maintain proper session-message relationships

- Lawyer Operations
  - Create lawyer profiles with verification status
  - Search lawyers by specialization, location, language
  - Update lawyer information and ratings
  - Filter lawyers by minimum rating

- Verification Operations
  - Create verification codes for email/2FA
  - Validate verification codes with expiration
  - Mark codes as used to prevent reuse

- Notification System
  - Create user notifications
  - Retrieve notifications by user
  - Mark notifications as read

**Key Test Scenarios:**
```javascript
// Example: User creation validation
const userData = {
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: 'hashedpassword123',
  firstName: 'Test',
  lastName: 'User',
  isLawyer: false,
  twoFactorEnabled: false,
  emailVerified: false
};
```

### 1.2 Authentication Tests (`client/src/__tests__/auth.test.tsx`)
Tests the authentication hook and user state management.

**Test Coverage:**
- Authentication state initialization
- Login flow validation
- Registration flow validation
- Logout functionality
- Token-based authentication
- Error handling for invalid credentials

## 2. Integration Tests

### 2.1 API Routes Integration (`server/__tests__/integration/routes.integration.test.ts`)
Tests the complete API endpoints with database integration.

**Test Coverage:**

#### Authentication Routes
- **User Registration**
  - Validates new user creation
  - Prevents duplicate email registration
  - Returns proper user data structure
  - Excludes sensitive information (passwords)

- **User Login**
  - Authenticates valid credentials
  - Rejects invalid credentials
  - Returns JWT tokens
  - Handles email verification requirements

- **Session Management**
  - Token validation middleware
  - Session persistence
  - Logout functionality

#### Health Check Routes
- **System Health**
  - Returns application status
  - Provides timestamp information
  - Validates service availability

- **Metrics Endpoint**
  - Returns Prometheus-compatible metrics
  - Includes system performance data
  - Monitors application health

**Example Integration Test:**
```javascript
it('should register a new user', async () => {
  const userData = {
    email: 'test@example.com',
    password: 'securePassword123',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User'
  };

  const response = await request(app)
    .post('/api/register')
    .send(userData)
    .expect(201);

  expect(response.body.user.email).toBe(userData.email);
  expect(response.body.user.name).toBe(userData.name);
  expect(response.body.user.password).toBeUndefined();
});
```

### 2.2 Database Storage Integration (`tests/unit/storage.test.ts`)
Tests database operations with PostgreSQL integration.

**Test Coverage:**
- Database connection validation
- CRUD operations for all entities
- Transaction handling
- Concurrent operation support
- Performance benchmarking
- Error handling and recovery

## 3. Service Layer Tests

### 3.1 AI Legal Service Tests
Tests the AI-powered legal assistance functionality.

**Test Coverage:**
- Query processing and categorization
- Cameroon law context integration
- Multi-language support (English/French)
- Response confidence scoring
- Legal disclaimer generation
- Custom model integration

### 3.2 Two-Factor Authentication Service Tests
Tests the 2FA implementation for enhanced security.

**Test Coverage:**
- TOTP secret generation
- QR code creation for authenticator apps
- Email verification code generation
- Backup code generation and validation
- Code verification and expiration handling

### 3.3 Metrics Collection Tests
Tests system monitoring and performance tracking.

**Test Coverage:**
- Request/response time tracking
- Error rate calculation
- Memory and CPU usage monitoring
- Prometheus metrics format validation
- Real-time metrics updates

## 4. Component Tests

### 4.1 Authentication Components
- Auth modal functionality
- Login/registration forms
- Two-factor setup wizard
- Error state handling

### 4.2 Chat Interface Components
- Message rendering and formatting
- Real-time WebSocket communication
- Chat session management
- AI response display

### 4.3 Lawyer Directory Components
- Lawyer profile cards
- Search and filtering
- Rating and review system
- Contact functionality

## 5. End-to-End Test Scenarios

### 5.1 User Journey Tests
- Complete user registration flow
- Legal consultation workflow
- Lawyer discovery and contact
- Profile management

### 5.2 Security Tests
- Authentication boundary testing
- Authorization validation
- Input sanitization
- XSS and injection prevention

## Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },
  collectCoverageFrom: [
    'server/**/*.{ts,tsx}',
    'client/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Test Setup (`test/setup.ts`)
- Global test environment configuration
- Jest DOM matchers
- Mock implementations for external services
- Environment variable configuration

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e        # End-to-end tests only
```

### Test Scripts
- `test`: Runs all tests once
- `test:watch`: Runs tests in watch mode for development
- `test:coverage`: Generates coverage reports
- `test:unit`: Runs unit tests only
- `test:integration`: Runs integration tests only
- `test:e2e`: Runs end-to-end tests only

## Coverage Requirements

### Minimum Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports
Coverage reports are generated in HTML format and include:
- Line-by-line coverage visualization
- Function coverage analysis
- Branch coverage tracking
- Uncovered code identification

## Continuous Integration

### Test Pipeline
1. **Lint Check**: Code style and quality validation
2. **Type Check**: TypeScript compilation verification
3. **Unit Tests**: Fast-running isolated tests
4. **Integration Tests**: API and database tests
5. **Coverage Validation**: Ensures minimum coverage thresholds
6. **Build Verification**: Confirms application builds successfully

### Test Data Management
- Tests use isolated in-memory storage
- Database tests use transaction rollbacks
- Test fixtures provide consistent data
- Mock services prevent external dependencies

## Best Practices

### Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the scenario
- Follow AAA pattern: Arrange, Act, Assert
- Keep tests isolated and independent

### Test Data
- Use realistic but non-sensitive test data
- Create reusable test fixtures
- Avoid hardcoded values in assertions
- Use factories for complex object creation

### Error Testing
- Test both success and failure scenarios
- Validate error messages and status codes
- Test edge cases and boundary conditions
- Ensure proper error handling and recovery

### Performance Testing
- Include performance benchmarks for critical paths
- Test concurrent user scenarios
- Validate memory usage and cleanup
- Monitor test execution time

## Test Maintenance

### Regular Tasks
- Update test data to match schema changes
- Refactor tests when implementation changes
- Add tests for new features and bug fixes
- Review and update coverage requirements

### Test Debugging
- Use descriptive assertion messages
- Implement proper test logging
- Utilize debugging tools and breakpoints
- Maintain clear test documentation

This comprehensive testing strategy ensures the LawHelp application maintains high quality, reliability, and security standards while providing legal assistance to users in Cameroon.