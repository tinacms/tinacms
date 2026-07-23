import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  ADMIN_INDEX,
  clickSave,
  enterEditMode,
  waitForAdminShell,
} from './utils/admin-helpers';

const HELLO_PATH = join(__dirname, '..', 'content', 'post', 'hello.mdx');

// The colocated custom field component must render through the schema seam in
// the production bundle, and a save must round-trip its value to disk.
test.describe
  .serial('custom field', () => {
    let original: string;

    test.beforeAll(() => {
      original = readFileSync(HELLO_PATH, 'utf8');
    });

    test.afterAll(() => {
      // Restore the fixture content so the round-trip leaves no residue.
      writeFileSync(HELLO_PATH, original, 'utf8');
    });

    test('renders and round-trips a save to disk', async ({ page }) => {
      await page.goto(`${ADMIN_INDEX}#/collections/edit/post/hello`, {
        waitUntil: 'domcontentloaded',
      });
      await waitForAdminShell(page);
      await enterEditMode(page);

      const input = page.getByTestId('fixture-field-input');
      await expect(input).toBeVisible({ timeout: 30000 });
      await expect(input).toHaveValue('initial-marker');

      const nextValue = `roundtrip-${Date.now()}`;
      await input.fill(nextValue);
      await clickSave(page);

      // The mutation writes back through the filesystem bridge; give the write a
      // beat then assert the new value is on disk.
      await expect(async () => {
        const onDisk = readFileSync(HELLO_PATH, 'utf8');
        expect(onDisk).toContain(`marker: ${nextValue}`);
      }).toPass({ timeout: 10000 });
    });
  });
