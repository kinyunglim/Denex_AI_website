/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS config file */
const nextJest = require('next/jest');

// Configure Jest to work with Next.js and the local project setup.
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'node',
  testTimeout: 30000,
  globalSetup: '<rootDir>/src/test/global-setup.mjs',
  globalTeardown: '<rootDir>/src/test/global-teardown.mjs',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/e2e/'],
};

module.exports = createJestConfig(customJestConfig);
