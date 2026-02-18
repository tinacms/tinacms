import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@playwright/test';

/**
 * Force the entire file to run serially on a single worker.
 * Both describe blocks mutate the shared tina config and dev server,
 * so they must not run in parallel.
 */
test.describe.configure({ mode: 'serial' });

const CONFIG_PATH = path.join(__dirname, '../../tina/config.js');
const PREBUILD_PATH = path.join(
  __dirname,
  '../../tina/__generated__/config.prebuild.jsx'
);

/** Returns true if the config was actually changed. */
function setTelemetryMode(mode: 'anonymous' | 'disabled'): boolean {
  const currentMode = getTelemetryMode();
  if (currentMode === mode) return false;
  const content = fs.readFileSync(CONFIG_PATH, 'utf8');
  const updated = content.replace(
    /telemetry:\s*["'][^"']*["']/,
    `telemetry: "${mode}"`
  );
  fs.writeFileSync(CONFIG_PATH, updated, 'utf8');
  return true;
}

function getTelemetryMode(): string | undefined {
  const content = fs.readFileSync(CONFIG_PATH, 'utf8');
  const match = content.match(/telemetry:\s*["']([^"']+)["']/);
  return match?.[1];
}

/**
 * Wait for the prebuild file to be regenerated after a config change.
 * The TinaCMS CLI watches the tina config and regenerates
 * config.prebuild.jsx, which Vite then picks up via HMR.
 */
async function waitForRebuild(
  previousMtime: number,
  timeoutMs = 10000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const stat = fs.statSync(PREBUILD_PATH);
      if (stat.mtimeMs > previousMtime) return;
    } catch {
      // File may not exist briefly during rebuild
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `Timed out waiting for prebuild to regenerate after ${timeoutMs}ms`
  );
}

const originalMode = getTelemetryMode();

test.describe('PostHog telemetry - enabled', () => {
  test.beforeAll(async () => {
    const mtime = fs.statSync(PREBUILD_PATH).mtimeMs;
    const changed = setTelemetryMode('anonymous');
    if (changed) await waitForRebuild(mtime);
  });

  test('sends PostHog request when telemetry is enabled', async ({ page }) => {
    test.setTimeout(30000);

    const requestPromise = page.waitForRequest((request) =>
      request.url().startsWith('https://us.i.posthog.com/')
    );

    await page.goto('http://localhost:3000/admin/index.html#/~');
    await page.getByRole('button', { name: 'Enter Edit Mode' }).click();

    await requestPromise;
  });
});

test.describe('PostHog telemetry - disabled', () => {
  test.beforeAll(async () => {
    const mtime = fs.statSync(PREBUILD_PATH).mtimeMs;
    const changed = setTelemetryMode('disabled');
    if (changed) await waitForRebuild(mtime);
  });

  test('does not send PostHog requests when telemetry is disabled', async ({
    page,
  }) => {
    test.setTimeout(30000);

    let posthogRequestSent = false;
    page.on('request', (request) => {
      if (request.url().startsWith('https://us.i.posthog.com/')) {
        posthogRequestSent = true;
      }
    });

    await page.goto('http://localhost:3000/admin/index.html#/~');
    await page.getByRole('button', { name: 'Enter Edit Mode' }).click();
    await page.waitForTimeout(3000);

    expect(posthogRequestSent).toBe(false);
  });
});

// Restore the original config value after all tests complete
test.afterAll(async () => {
  setTelemetryMode((originalMode as 'anonymous' | 'disabled') ?? 'anonymous');
});
