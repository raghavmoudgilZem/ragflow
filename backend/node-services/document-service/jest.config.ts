import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.ts", // changed from *.js to *.ts
    "!src/**/*.d.ts", // exclude declaration files
    "!jest.config.ts",
    "!node_modules/**",
    "!coverage/**",
    "!src/__tests__/**",
    "!src/generated/**",
    "!src/config/constants.ts",
  ],
  coverageReporters: ["text", "lcov"],
  clearMocks: true,
};

export default config;
