import { expect, test } from '@playwright/test';
import {
  ADMIN_INDEX,
  DEVTOOLS_HOOK_STUB,
  assertHealthyRender,
  enterEditMode,
  trackConsoleErrors,
  waitForAdminShell,
} from './utils/admin-helpers';

// The admin build runs a second Tailwind pass over the colocated field code.
// This proves that pass ran AND that it used Tina's theme rather than stock
// Tailwind: `aspect-w-9` only exists because @tailwindcss/aspect-ratio was in
// the pass, and `bg-blue-500` resolves to Tina's blue, not #3b82f6.
test('fixture Tailwind classes compile with Tina theme', async ({ page }) => {
  await page.addInitScript(DEVTOOLS_HOOK_STUB);
  const consoleErrors = trackConsoleErrors(page);

  await page.goto(`${ADMIN_INDEX}#/collections/edit/post/hello`, {
    waitUntil: 'domcontentloaded',
  });
  await waitForAdminShell(page);
  await enterEditMode(page);

  // The custom field renders once the form loads; its text input is the
  // reliable "form is ready" signal.
  await expect(page.getByTestId('fixture-field-input')).toBeVisible({
    timeout: 30000,
  });

  // The killer trap (next/image dragging a second React copy) only fires
  // once FixtureField actually renders, which only happens on this edit
  // form — boot.spec's collection list never mounts it.
  await assertHealthyRender(page, consoleErrors);

  // The probe is an empty aspect-ratio div (0 height), so assert attachment
  // rather than visibility — computed styles read fine either way.
  const probe = page.getByTestId('tw-probe');
  await expect(probe).toBeAttached();

  const styles = await probe.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      backgroundColor: cs.backgroundColor,
      position: cs.position,
      aspectW: cs.getPropertyValue('--tw-aspect-w').trim(),
    };
  });

  // Tina's blue.500 is #0084FF.
  expect(styles.backgroundColor).toBe('rgb(0, 132, 255)');
  // aspect-w-9 from @tailwindcss/aspect-ratio.
  expect(styles.position).toBe('relative');
  expect(styles.aspectW).toBe('9');
});
