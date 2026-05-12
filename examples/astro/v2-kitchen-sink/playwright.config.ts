/**
 * Playwright configuration for the Astro visual-editing example.
 *
 * Smoke-level coverage: page renders, bridge form payloads are present and
 * well-formed, island markers wire up. Doesn't yet exercise the full
 * postMessage handshake — that needs a fake admin iframe and is a
 * follow-up.
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  expect: { timeout: 30000 },
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
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'frontend',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Use non-default datalayer port so the suite can run alongside
    // a sibling `tinacms dev` already holding port 9000.
    command:
      'cross-env MONOREPO_DEV=true tinacms dev --datalayer-port 9100 --port 4101 -c "astro dev"',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
