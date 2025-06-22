import '@testing-library/jest-dom';

// Global test setup
global.console = {
  ...console,
  // Uncomment to silence console logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock fetch for Node.js environment
global.fetch = jest.fn();

// Mock TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Setup environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';