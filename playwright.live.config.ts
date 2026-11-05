import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
const serverEnv = parseEnv(
  readFileSync(new URL("../bookbar-server/.env", import.meta.url), "utf8"),
);

// Opt-in real providers/Atlas. Do not save auth traces, cookies or request bodies.
export default defineConfig({
  testDir: "./tests/live",
  outputDir: ".cache/playwright-live",
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    headless: true,
    locale: "en-US",
    timezoneId: "Asia/Dhaka",
    viewport: { width: 1440, height: 1000 },
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: [
    {
      command: "npm run start",
      url: "http://127.0.0.1:3000",
      timeout: 30_000,
      reuseExistingServer: false,
      env: {
        NODE_ENV: "production",
        NEXT_TELEMETRY_DISABLED: "1",
        NODE_TLS_REJECT_UNAUTHORIZED: "1",
      },
    },
    {
      command: "npm run start",
      cwd: "../bookbar-server",
      url: "http://localhost:5000/books",
      timeout: 45_000,
      reuseExistingServer: false,
      env: {
        ...serverEnv,
        NODE_ENV: "production",
        NODE_TLS_REJECT_UNAUTHORIZED: "1",
      },
    },
  ],
});
