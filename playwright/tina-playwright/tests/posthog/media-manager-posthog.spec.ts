import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@playwright/test';

/**
 * Force the entire file to run serially on a single worker.
 * These tests mutate the shared tina config and dev server,
 * so they must not run in parallel.
 */
test.describe.configure({ mode: 'serial' });

const CONFIG_PATH = path.join(__dirname, '../../tina/config.js');
const PREBUILD_PATH = path.join(
  __dirname,
  '../../tina/__generated__/config.prebuild.jsx'
);
const POSTHOG_URL_PREFIX = 'https://us.i.posthog.com/';
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

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

/**
 * Create a small test image file in-memory for upload.
 */
function createTestImageBuffer(): Buffer {
  // Minimal valid 1x1 PNG
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64'
  );
}

const originalMode = getTelemetryMode();
const TEST_UPLOAD_FILENAME = 'playwright-test-upload.png';

test.describe('PostHog Media Manager events - telemetry enabled', () => {
  test.beforeAll(async () => {
    const mtime = fs.statSync(PREBUILD_PATH).mtimeMs;
    const changed = setTelemetryMode('anonymous');
    if (changed) await waitForRebuild(mtime);
  });

  test('sends PostHog event when media is uploaded', async ({ page }) => {
    test.setTimeout(30000);

    // Navigate to admin and enter edit mode
    await page.goto('http://localhost:3000/admin/index.html#/~');
    await page.getByRole('button', { name: 'Enter Edit Mode' }).click();

    // Wait for CMS to initialize
    await page.waitForTimeout(2000);

    // Open the Media Manager via the sidebar
    await page.getByRole('button', { name: 'Media Manager' }).click();
    await page.waitForTimeout(1000);

    // Set up listener for PostHog requests containing the upload event
    const uploadEventPromise = page.waitForRequest((request) => {
      if (!request.url().startsWith(POSTHOG_URL_PREFIX)) return false;
      const postData = request.postData();
      if (!postData?.includes('media-manager-content-uploaded')) return false;
      // Verify the payload includes fileType and fileCount properties
      expect(postData).toContain('fileType');
      expect(postData).toContain('fileCount');
      return true;
    });

    // Create a test file and trigger upload via the file input
    const fileInput = page.locator('input[type="file"]');
    const testImageBuffer = createTestImageBuffer();
    const testImagePath = path.join(UPLOADS_DIR, TEST_UPLOAD_FILENAME);
    fs.writeFileSync(testImagePath, testImageBuffer);

    await fileInput.setInputFiles(testImagePath);

    // Wait for the PostHog upload event to be sent
    await uploadEventPromise;

    // Clean up the uploaded test file
    try {
      fs.unlinkSync(testImagePath);
    } catch {
      // Ignore cleanup errors
    }
  });

  test('sends PostHog event when media is deleted', async ({ page }) => {
    test.setTimeout(30000);

    // Ensure a test file exists to delete
    const testImageBuffer = createTestImageBuffer();
    const testImagePath = path.join(UPLOADS_DIR, TEST_UPLOAD_FILENAME);
    fs.writeFileSync(testImagePath, testImageBuffer);

    // Navigate to admin and enter edit mode
    await page.goto('http://localhost:3000/admin/index.html#/~');
    await page.getByRole('button', { name: 'Enter Edit Mode' }).click();

    // Wait for CMS to initialize
    await page.waitForTimeout(2000);

    // Open the Media Manager via the sidebar
    await page.getByRole('button', { name: 'Media Manager' }).click();
    await page.waitForTimeout(1000);

    // Click on the test file to select it
    await page
      .getByText(TEST_UPLOAD_FILENAME)
      .first()
      .click();
    await page.waitForTimeout(500);

    // Set up listener for PostHog requests containing the delete event
    const deleteEventPromise = page.waitForRequest((request) => {
      if (!request.url().startsWith(POSTHOG_URL_PREFIX)) return false;
      const postData = request.postData();
      if (!postData?.includes('media-manager-content-deleted')) return false;
      // Verify the payload includes fileType property
      expect(postData).toContain('fileType');
      return true;
    });

    // Click the Delete button
    await page.getByRole('button', { name: 'Delete' }).click();

    // Confirm the deletion in the modal
    await page.getByRole('button', { name: 'Delete' }).nth(1).click();

    // Wait for the PostHog delete event to be sent
    await deleteEventPromise;
  });
});

test.describe('PostHog Media Manager events - telemetry disabled', () => {
  test.beforeAll(async () => {
    const mtime = fs.statSync(PREBUILD_PATH).mtimeMs;
    const changed = setTelemetryMode('disabled');
    if (changed) await waitForRebuild(mtime);
  });

  test('does not send PostHog media events when telemetry is disabled', async ({
    page,
  }) => {
    test.setTimeout(30000);

    let posthogMediaEventSent = false;
    page.on('request', (request) => {
      if (!request.url().startsWith(POSTHOG_URL_PREFIX)) return;
      const postData = request.postData();
      if (
        postData?.includes('media-manager-content-uploaded') ||
        postData?.includes('media-manager-content-deleted')
      ) {
        posthogMediaEventSent = true;
      }
    });

    // Ensure a test file exists to upload/delete
    const testImageBuffer = createTestImageBuffer();
    const testImagePath = path.join(UPLOADS_DIR, TEST_UPLOAD_FILENAME);
    fs.writeFileSync(testImagePath, testImageBuffer);

    // Navigate to admin and enter edit mode
    await page.goto('http://localhost:3000/admin/index.html#/~');
    await page.getByRole('button', { name: 'Enter Edit Mode' }).click();
    await page.waitForTimeout(2000);

    // Open the Media Manager
    await page.getByRole('button', { name: 'Media Manager' }).click();
    await page.waitForTimeout(1000);

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    await page.waitForTimeout(3000);

    expect(posthogMediaEventSent).toBe(false);

    // Clean up
    try {
      fs.unlinkSync(testImagePath);
    } catch {
      // Ignore cleanup errors
    }
  });
});

// Restore the original config value after all tests complete
test.afterAll(async () => {
  setTelemetryMode((originalMode as 'anonymous' | 'disabled') ?? 'anonymous');

  // Clean up any leftover test files
  const testImagePath = path.join(UPLOADS_DIR, TEST_UPLOAD_FILENAME);
  try {
    fs.unlinkSync(testImagePath);
  } catch {
    // File may not exist
  }
});
