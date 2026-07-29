import { createServer } from 'node:net';
import { defineConfig, devices } from '@playwright/test';

// A browser is the only place two of this package's guarantees can be observed:
// layout (happy-dom has no layout engine, so an overflow is invisible to vitest)
// and Plate editing (Slate needs real beforeinput events, which synthetic
// keystrokes don't produce). Everything else stays in the vitest suite.
//
// The harness is the playground — the same app `pnpm dev` serves.
//
// The port is asked for rather than fixed, so a second run of this suite (another
// checkout, a watch process, two CI shards on one box) doesn't collide with the
// first. Pin it with TINA_E2E_PORT, which also restores `reuseExistingServer`.
const freePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    // Port 0 asks the OS for an unused one, which is free at the moment it's read
    // back — hence --strictPort below. If something claims it in the gap before
    // vite binds, that has to fail loudly rather than drift to a port baseURL
    // isn't pointing at.
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close(() => {
        if (address && typeof address === 'object') resolve(address.port);
        else reject(new Error('Probe server reported no port'));
      });
    });
  });

const pinned = process.env.TINA_E2E_PORT;
const PORT = pinned ? Number(pinned) : await freePort();
// Playwright evaluates this config once in the runner and again in each worker it
// forks. Only the runner starts the server, so the port it picked has to reach the
// workers — otherwise they each probe their own and navigate to a port nothing is
// serving. Workers fork after this line, so they inherit it.
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
    // Only a pinned port can be reused; a probed one is fresh every run by design.
    reuseExistingServer: !process.env.CI && Boolean(pinned),
    timeout: 60000,
  },
});
