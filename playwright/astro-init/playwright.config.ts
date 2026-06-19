import { defineConfig, devices } from '@playwright/test';

/**
 * E2E for the output of `tinacms init` on an Astro project.
 *
 * The project under test is GENERATED (scaffold-and-init.sh), not committed —
 * its path comes in via INIT_PROJECT_DIR, and Playwright's webServer boots that
 * project's `pnpm dev` (tinacms dev -c "astro dev") before the specs run.
 */
const projectDir = process.env.INIT_PROJECT_DIR;
if (!projectDir) {
  throw new Error(
    'INIT_PROJECT_DIR must point to a project created by scaffold-and-init.sh'
  );
}

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 30000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list', { printSteps: true }]],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    cwd: projectDir,
    url: 'http://localhost:4321/tinacms-demo',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
