import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/evals/**/*.eval.test.ts"],
    testTimeout: 120000,
    hookTimeout: 30000,
    setupFiles: ["src/evals/setup.ts"],
    globalSetup: ["src/evals/global-setup.ts"],
  },
});
