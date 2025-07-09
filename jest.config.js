module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testEnvironment: "jsdom",

  // Module resolution
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@app/(.*)$": "<rootDir>/src/app/$1",
    "^@shared/(.*)$": "<rootDir>/src/app/shared/$1",
    "^@core/(.*)$": "<rootDir>/src/app/core/$1",
  },

  // Test file patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(ts|js)",
    "<rootDir>/src/**/*.(test|spec).(ts|js)",
  ],

  // Exclude problematic SSR files
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/coverage/",
    "<rootDir>/src/app/app.config.server.spec.ts",
  ],

  // Transform files
  transform: {
    "^.+\\.(ts|mjs|js|html)$": [
      "jest-preset-angular",
      {
        tsconfig: "tsconfig.spec.json",
        stringifyContentPathRegex: "\\.(html|svg)$",
      },
    ],
  },

  // File extensions
  moduleFileExtensions: ["ts", "html", "js", "json", "mjs"],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text-summary", "lcov", "cobertura"],
  collectCoverageFrom: [
    "src/app/**/*.ts",
    "!src/app/**/*.spec.ts",
    "!src/app/**/*.d.ts",
    "!src/app/**/index.ts",
    "!src/app/**/*.module.ts",
    "!src/app/**/*.interface.ts",
    "!src/app/**/*.model.ts",
    "!src/app/**/*.enum.ts",
    "!src/app/**/*.config.ts",
    "!src/app/**/*.routes.ts",
    "!src/main.ts",
    "!src/main.server.ts",
    "!src/server.ts",
  ],

  // Coverage thresholds - Set to current baseline
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },

  // Transform ignore patterns
  transformIgnorePatterns: [
    "node_modules/(?!(@angular|@ngrx|ngx-|@sweetalert2|sweetalert2|ngx-toastr|ngx-image-cropper)/)",
  ],

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Error handling
  errorOnDeprecated: true,

  // Performance
  maxWorkers: "50%",

  // Timeout
  testTimeout: 10000,
};
