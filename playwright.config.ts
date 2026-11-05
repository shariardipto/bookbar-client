import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: ".cache/playwright",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 8_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    channel: "chrome",
    headless: true,
    locale: "en-US",
    timezoneId: "Asia/Dhaka",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
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
});
