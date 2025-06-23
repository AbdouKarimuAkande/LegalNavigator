
import { storage } from '../storage';

export async function createTestDatabase() {
  // Initialize test database
  try {
    // Storage is already initialized in memory
    console.log('Test database initialized');
  } catch (error) {
    console.error('Failed to initialize test database:', error);
  }
}

export async function cleanupTestDatabase() {
  // Clean up test data
  try {
    // Add cleanup logic here if needed
    console.log('Test database cleaned up');
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
  }
}

export function createTestUser(overrides = {}) {
  return {
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    isLawyer: false,
    twoFactorEnabled: false,
    emailVerified: true,
    ...overrides
  };
}

export function createTestMessage(overrides = {}) {
  return {
    sessionId: 'test-session-id',
    content: 'Test message',
    role: 'user' as const,
    userId: 'test-user-id',
    sender: 'user',
    ...overrides
  };
}
