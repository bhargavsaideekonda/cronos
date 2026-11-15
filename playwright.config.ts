import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 90_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3100", viewport: { width: 1280, height: 800 }, trace: "retain-on-failure" },
  webServer: { command: "npm.cmd run start -- -p 3100", url: "http://localhost:3100", reuseExistingServer: true, timeout: 240_000 },
});
