import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

function getTelemetryMode(): string | undefined {
  const configPath = path.join(__dirname, '../../tina/config.js');
  const content = fs.readFileSync(configPath, 'utf8');
  const match = content.match(/telemetry:\s*["']([^"']+)["']/);
  return match?.[1];
}

test('PostHog telemetry - TinaCMS Started Event', async ({ page }) => {
  const telemetryMode = getTelemetryMode();
  const isDisabled = telemetryMode === 'disabled';

  console.log(
    `Telemetry mode from config: ${telemetryMode ?? 'undefined (defaults to anonymous)'}`
  );

  await page.goto('http://localhost:3000/admin/index.html#/~');

  if (isDisabled) {
    // Disabled: ensure no requests are sent
    let posthogRequestSent = false;
    page.on('request', (request) => {
      if (request.url().startsWith('https://us.i.posthog.com/')) {
        posthogRequestSent = true;
      }
    });

    await page.getByRole('button', { name: 'Enter Edit Mode' }).click();
    await page.waitForTimeout(3000);

    expect(posthogRequestSent).toBe(false);
    console.log('PASS: Telemetry disabled - no PostHog requests made');
  } else {
    // Enabled: wait for PostHog request
    const requestPromise = page.waitForRequest((request) =>
      request.url().startsWith('https://us.i.posthog.com/')
    );

    await page.getByRole('button', { name: 'Enter Edit Mode' }).click();
    await requestPromise;

    console.log('PASS: Telemetry enabled - PostHog request sent');
  }
});
