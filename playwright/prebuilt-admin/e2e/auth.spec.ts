import { expect, test } from '@playwright/test';
import { ADMIN_ROOT } from './utils/admin-helpers';

// The `UsernamePasswordAuthJSProvider` ingredient drags the ESM entry that
// requires CJS `next-auth/react` into the bundle. When that provider is the
// active one, the admin must render its custom username/password login screen
// instead of the local edit-mode flow — proving next-auth/react loaded and ran
// in the browser. The fixture selects this provider at runtime when
// `window.__TINA_FIXTURE_AUTHJS__` is set before boot.
test('custom AuthJS login screen appears', async ({ page }) => {
  await page.addInitScript(() => {
    (
      window as unknown as { __TINA_FIXTURE_AUTHJS__: boolean }
    ).__TINA_FIXTURE_AUTHJS__ = true;
  });

  await page.goto(ADMIN_ROOT, { waitUntil: 'domcontentloaded' });

  // The username/password modal from UsernamePasswordAuthJSProvider.
  await expect(page.getByPlaceholder('Username')).toBeVisible({
    timeout: 30000,
  });
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Login', exact: true })
  ).toBeVisible();
});
