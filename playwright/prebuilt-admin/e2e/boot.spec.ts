import { expect, test } from '@playwright/test';
import {
  ADMIN_INDEX,
  DEVTOOLS_HOOK_STUB,
  assertHealthyRender,
  enterEditMode,
  trackConsoleErrors,
  waitForAdminShell,
} from './utils/admin-helpers';

// Boots the PRODUCTION admin bundle and asserts the health invariants that a
// broken bundling of the hostile config would violate: the collection list
// renders, exactly one React reconciler is live, and nothing logs an error
// while the shell comes up.
test('admin boots clean: collection list, single React, zero console errors', async ({
  page,
}) => {
  await page.addInitScript(DEVTOOLS_HOOK_STUB);
  const consoleErrors = trackConsoleErrors(page);

  await page.goto(`${ADMIN_INDEX}#/collections/post`, {
    waitUntil: 'domcontentloaded',
  });
  await waitForAdminShell(page);
  await enterEditMode(page);

  // Collection list renders — the seeded document appears in the table.
  await expect(page.getByText('Hello Prebuilt')).toBeVisible();

  await assertHealthyRender(page, consoleErrors);
});
