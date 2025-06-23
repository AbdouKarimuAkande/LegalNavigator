import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock localStorage and other browser APIs
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

// Setup global mocks
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation((callback, options) => ({
    root: options?.root || null,
    rootMargin: options?.rootMargin || '',
    thresholds: options?.thresholds || [],
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(() => [])
  }))
});

// Mock ResizeObserver
Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation((callback) => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }))
});

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  
  console.log('Setting up test environment...');
});

afterAll(async () => {
  console.log('Cleaning up test environment...');
});

beforeEach(async () => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  localStorageMock.clear.mockClear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
});

afterEach(async () => {
  // Clean up any remaining test data
});

// Only mock external services that require API keys or network calls
// Don't mock internal services during unit tests

// Global test utilities
global.createTestUser = async () => {
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    passwordHash: 'hashed-password',
    isLawyer: false,
    emailVerified: true
  };
  
  // Return test user data for use in tests
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