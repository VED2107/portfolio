import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  webServer: {
    command: "npm run start -- -p 3210",
    url: "http://localhost:3210",
    reuseExistingServer: true,
    timeout: 180_000,
  },
  use: {
    baseURL: "http://localhost:3210",
    channel: "chrome",
    launchOptions: {
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
    },
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 }, channel: "chrome" } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        channel: "chrome",
        deviceScaleFactor: 2,
      },
    },
  ],
});
