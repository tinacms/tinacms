import { defineConfig, devices } from '@playwright/test';

// A browser is the only place two of this package's guarantees can be observed:
// layout (happy-dom has no layout engine, so an overflow is invisible to vitest)
// and Plate editing (Slate needs real beforeinput events, which synthetic
// keystrokes don't produce). Everything else stays in the vitest suite.
//
// The harness is the playground — the same app `pnpm dev` serves.
const PORT = 5174;

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite playground --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
