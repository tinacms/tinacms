import { createServer } from 'node:net';
import { defineConfig, devices } from '@playwright/test';

const freePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close(() => {
        if (address && typeof address === 'object') resolve(address.port);
        else reject(new Error('Probe server reported no port'));
      });
    });
  });

const pinned = process.env.TINA_E2E_PORT;
const pinnedPort = pinned ? Number.parseInt(pinned, 10) : Number.NaN;
if (pinned && !Number.isInteger(pinnedPort)) {
  throw new Error(`TINA_E2E_PORT must be an integer, got "${pinned}".`);
}
const PORT = Number.isInteger(pinnedPort) ? pinnedPort : await freePort();
process.env.TINA_E2E_PORT = String(PORT);

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
    reuseExistingServer: !process.env.CI && Boolean(pinned),
    timeout: 60000,
  },
});
