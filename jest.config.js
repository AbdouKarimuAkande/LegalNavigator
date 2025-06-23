
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'node',
  roots: ['<rootDir>/server', '<rootDir>/client/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true
    }],
  },
  collectCoverageFrom: [
    'server/**/*.{ts,tsx}',
    'client/src/**/*.{ts,tsx}',
    '!server/**/*.d.ts',
    '!client/src/**/*.d.ts',
    '!server/index.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  testTimeout: 30000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(wouter|node-fetch|nanoid)/)'
  ]
};
