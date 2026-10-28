import { defineConfig, devices } from "@playwright/test";
import os from "node:os";
import path from "node:path";

const PORT = 3100;
export const E2E_DATABASE_URL = process.env.E2E_DATABASE_URL ?? "postgresql://clair:clair_dev@localhost:5432/clair_e2e";

const serverEnv = {
  DATABASE_URL: E2E_DATABASE_URL,
  CLAIR_ENCRYPTION_KEY: Buffer.alloc(32, 9).toString("base64"),
  CLAIR_STORAGE_DIR: path.join(os.tmpdir(), "clair-e2e-storage"),
  CLAIR_AI_PROVIDER: "mock",
  ANTHROPIC_API_KEY: "",
  CLAIR_APP_URL: `http://localhost:${PORT}`,
  CLAIR_INSECURE_COOKIES: "1",
};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "fr-CH",
    timezoneId: "Europe/Zurich",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "ordinateur", use: { ...devices["Desktop Chrome"] }, testIgnore: /mobile\.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec/ },
  ],
  webServer: {
    command: `npx prisma migrate deploy && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: serverEnv,
  },
});
