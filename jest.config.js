
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server', '<rootDir>/client/src'],
  testMatch: [
    '**/__tests__/**/*.test.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'test-utils.ts',
    'setup.ts',
    '.*\\.disabled$'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'server/**/*.{ts,tsx}',
    'client/src/**/*.{ts,tsx}',
    '!server/**/*.d.ts',
    '!client/src/**/*.d.ts',
    '!server/index.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*test-utils*',
    '!**/*setup*'
  ],
  coverageDirectory: 'coverage',
  testTimeout: 10000,
  maxWorkers: 1,
  forceExit: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  }
};
