/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'jsdom',
  rootDir: '.',
  testMatch: [
    '<rootDir>/lib/**/*.(test|spec).ts',
    '<rootDir>/app/**/*.(test|spec).(ts|tsx)',
    '<rootDir>/tests/unit/**/*.(test|spec).ts',
    '<rootDir>/tests/integration/**/*.(test|spec).ts'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/components/(.*)$': '<rootDir>/app/components/$1',
    '^@/game/(.*)$': '<rootDir>/lib/game/$1',
    '^@/utils/(.*)$': '<rootDir>/lib/utils/$1',
    '^@/test-utils/(.*)$': '<rootDir>/test-utils/$1'
  },
  setupFilesAfterEnv: [
    '<rootDir>/test-utils/jest-setup.ts'
  ],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'app/**/*.{ts,tsx}',
    '!lib/**/*.d.ts',
    '!app/**/*.d.ts',
    '!**/*.stories.{ts,tsx}'
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
  setupFiles: [
    '<rootDir>/test-utils/jest-canvas-mock.ts'
  ]
};