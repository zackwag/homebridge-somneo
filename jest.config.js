/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  clearMocks: true,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      // ts-jest transpiles per-file (module: node16 normally requires
      // isolatedModules for that), but the codebase also relies on an
      // ambient const enum (hap-nodejs's HAPStatus) that isolatedModules
      // can't support project-wide, so this warning is a known, harmless
      // mismatch rather than a real problem.
      diagnostics: { ignoreCodes: [151002] },
    }],
  },
};
