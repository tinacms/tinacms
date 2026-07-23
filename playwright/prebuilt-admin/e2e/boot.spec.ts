import { expect, test } from '@playwright/test';
import {
  ADMIN_INDEX,
  DEVTOOLS_HOOK_STUB,
  enterEditMode,
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

  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`pageerror: ${err.message}`);
  });

  await page.goto(`${ADMIN_INDEX}#/collections/post`, {
    waitUntil: 'domcontentloaded',
  });
  await waitForAdminShell(page);
  await enterEditMode(page);

  // Collection list renders — the seeded document appears in the table.
  await expect(page.getByText('Hello Prebuilt')).toBeVisible();

  // Exactly one react-dom registered with the DevTools hook. A second React
  // dragged in through a CJS dep (e.g. next/image) would push this to 2.
  const renderers = await page.evaluate(
    () =>
      (
        window as unknown as {
          __REACT_DEVTOOLS_GLOBAL_HOOK__: { renderers: Map<number, unknown> };
        }
      ).__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.size
  );
  expect(renderers).toBe(1);

  expect(
    consoleErrors,
    `console errors during boot:\n${consoleErrors.join('\n')}`
  ).toEqual([]);
});
