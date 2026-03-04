import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for kitchen-sink example app E2E tests.
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 60000,
  expect: {
    timeout: 30000, // Increased from 15s to handle navigation/content loading
  },
  reporter: [
    ['list', { printSteps: true }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command:
      process.platform === 'win32'
        ? 'set MONOREPO_DEV=true && pnpm tinacms dev -c "next dev"'
        : 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
