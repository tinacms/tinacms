import { expect, test } from '@playwright/test';
import {
  ADMIN_INDEX,
  enterEditMode,
  waitForAdminShell,
} from './utils/admin-helpers';

// The media library is backed by `media.loadCustomStore`'s dynamic import.
// The Media Manager screen must list the item the custom store returns. We
// route to the screen directly (`slugify('Media Manager') === 'media_manager'`)
// so the assertion doesn't depend on the responsive nav drawer.
test('media manager lists via the custom store', async ({ page }) => {
  await page.goto(`${ADMIN_INDEX}#/screens/media_manager`, {
    waitUntil: 'domcontentloaded',
  });
  await waitForAdminShell(page);
  await enterEditMode(page);

  await expect(page.getByText('prebuilt-fixture-media.png')).toBeVisible({
    timeout: 30000,
  });
});
