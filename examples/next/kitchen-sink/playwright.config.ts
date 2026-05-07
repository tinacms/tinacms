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
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'frontend',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /admin\//,
    },
    {
      name: 'admin',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /admin\/.*\.spec\.ts$/,
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
