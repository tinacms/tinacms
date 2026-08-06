import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the prebuilt-admin fixture.
 *
 * Unlike every other suite in the repo, the webServer here serves a PRODUCTION
 * `tinacms build` output — never `tinacms dev`. `pnpm serve:prod` runs
 * `tinacms build --local` (which builds the static admin SPA into
 * public/admin AND keeps the local GraphQL/media server alive on :4001) with a
 * `-c` sub-command that serves the built SPA under /my-site/admin/. The browser
 * therefore loads the production bundle; the API is reached cross-origin on
 * :4001. See README.md.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 30000 },
  reporter: [
    ['list', { printSteps: true }],
    ['json', { outputFile: 'playwright-test-results.json' }],
  ],
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
    command: 'pnpm serve:prod',
    url: 'http://localhost:3000/my-site/admin/',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
});
