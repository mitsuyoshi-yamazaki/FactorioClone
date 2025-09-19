/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'jsdom',
  rootDir: '.',
  testMatch: [
    '<rootDir>/tests/unit/**/*.(test|spec).ts',
    '<rootDir>/tests/integration/**/*.(test|spec).ts'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/systems/(.*)$': '<rootDir>/src/systems/$1',
    '^@/entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/debug/(.*)$': '<rootDir>/src/debug/$1',
    '^@/test-utils/(.*)$': '<rootDir>/test-utils/$1'
  },
  setupFilesAfterEnv: [
    '<rootDir>/test-utils/jest-setup.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'html',
    'json-summary'
  ],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true
    }]
  },
  // Canvas/WebGL関連のモック
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFiles: [
    '<rootDir>/test-utils/jest-canvas-mock.ts'
  ]
};