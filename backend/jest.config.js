module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!src/utils/simulate.ts"],
  coverageThreshold: { global: { lines: 50, functions: 50, branches: 30, statements: 50 } }
};
