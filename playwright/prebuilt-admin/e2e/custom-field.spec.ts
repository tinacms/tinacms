import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  ADMIN_INDEX,
  DEVTOOLS_HOOK_STUB,
  assertHealthyRender,
  clickSave,
  enterEditMode,
  trackConsoleErrors,
  waitForAdminShell,
} from './utils/admin-helpers';

// This is the only spec that mutates fixture content on disk. It has its own
// document (roundtrip.mdx) — separate from hello.mdx, which boot.spec and
// tailwind.spec read — so it never races a read-only spec over the same file
// under `fullyParallel: true`.
const ROUNDTRIP_PATH = join(
  __dirname,
  '..',
  'content',
  'post',
  'roundtrip.mdx'
);

// The colocated custom field component must render through the schema seam in
// the production bundle, and a save must round-trip its value to disk.
test.describe('custom field', () => {
  let original: string;

  // Snapshot/restore per attempt, not just per suite: with CI's `retries: 2`,
  // an attempt that saves successfully and then fails a later assertion (a
  // slow disk write racing `toPass`) would otherwise leave the file mutated
  // going into the retry, turning a transient flake into a deterministic
  // failure of the `toHaveValue('initial-marker')` assertion below.
  test.beforeEach(() => {
    original = readFileSync(ROUNDTRIP_PATH, 'utf8');
  });

  test.afterEach(() => {
    writeFileSync(ROUNDTRIP_PATH, original, 'utf8');
  });

  test('renders and round-trips a save to disk', async ({ page }) => {
    await page.addInitScript(DEVTOOLS_HOOK_STUB);
    const consoleErrors = trackConsoleErrors(page);

    await page.goto(`${ADMIN_INDEX}#/collections/edit/post/roundtrip`, {
      waitUntil: 'domcontentloaded',
    });
    await waitForAdminShell(page);
    await enterEditMode(page);

    const input = page.getByTestId('fixture-field-input');
    await expect(input).toBeVisible({ timeout: 30000 });
    await expect(input).toHaveValue('initial-marker');

    // The killer trap (next/image dragging a second React copy) only fires
    // once FixtureField actually renders, which only happens on this edit
    // form — boot.spec's collection list never mounts it.
    await assertHealthyRender(page, consoleErrors);

    const nextValue = `roundtrip-${Date.now()}`;
    await input.fill(nextValue);
    await clickSave(page);

    // The mutation writes back through the filesystem bridge; give the write a
    // beat then assert the new value is on disk.
    await expect(async () => {
      const onDisk = readFileSync(ROUNDTRIP_PATH, 'utf8');
      expect(onDisk).toContain(`marker: ${nextValue}`);
    }).toPass({ timeout: 10000 });
  });
});
