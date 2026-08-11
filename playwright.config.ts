import { defineConfig, devices } from "@playwright/test";

// Původně tu byl Lovable preset `lovable-agent-playwright-config`, který ale
// na veřejném npm neexistuje (404) a není v package.json — config se nedal
// načíst. Nahrazeno standardní konfigurací nad @playwright/test.
const PORT = Number(process.env.PORT) || 8080;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Na CI si dev server nastartuj sám; lokálně se přípoj na už běžící.
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
