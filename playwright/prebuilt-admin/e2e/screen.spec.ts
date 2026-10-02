import { expect, test } from '@playwright/test';
import {
  ADMIN_INDEX,
  enterEditMode,
  trackConsoleErrors,
  waitForAdminShell,
} from './utils/admin-helpers';

// The `cmsCallback` ingredient (tina/config.tsx) registers a screen plugin via
// the raw `{ __type: 'screen' }` literal. It exists to catch a second
// react-router-dom instance breaking `useNavigate`/`NavLink` — a bundling bug
// that only shows up on a real navigation through the admin's own router, not
// when the URL is deep-linked directly. So this spec drives the sidebar nav
// (open the menu, click the screen link) rather than going straight to
// `#/screens/fixture_screen`.
test('screen plugin renders after navigating through the admin nav', async ({
  page,
}) => {
  const consoleErrors = trackConsoleErrors(page);

  await page.goto(`${ADMIN_INDEX}#/collections/post`, {
    waitUntil: 'domcontentloaded',
  });
  await waitForAdminShell(page);
  await enterEditMode(page);

  await page.getByRole('button', { name: 'Toggle navigation menu' }).click();
  await page.getByRole('link', { name: 'Fixture Screen' }).click();

  await expect(page.getByTestId('fixture-screen')).toBeVisible({
    timeout: 30000,
  });

  expect(
    consoleErrors,
    `console errors navigating to the screen:\n${consoleErrors.join('\n')}`
  ).toEqual([]);
});
