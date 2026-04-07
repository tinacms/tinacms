import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the Hugo kitchen-sink E2E tests.
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 60000,
  expect: {
    timeout: 30000,
  },
  reporter: [
    ['list', { printSteps: true }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: undefined,
  use: {
    baseURL: 'http://localhost:1313',
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
    command:
      process.platform === 'win32'
        ? 'set MONOREPO_DEV=true && pnpm tinacms dev -c "hugo-extended server"'
        : 'pnpm dev',
    url: 'http://localhost:1313',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
