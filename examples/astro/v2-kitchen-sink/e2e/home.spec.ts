/**
 * Home-page smoke tests. CMS-controlled text isn't asserted directly —
 * users can change it in the editor — so we check structural elements
 * only.
 */
import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads without an error block', async ({ page }) => {
    await expect(page.locator('text=Error loading')).not.toBeVisible();
    await expect(page.locator('text=No blocks to render')).not.toBeVisible();
  });

  test('has a Tina-prefixed page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Tina/);
  });

  test('renders the global header and footer', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();
  });

  test('renders at least one block section', async ({ page }) => {
    await expect(page.locator('section').first()).toBeVisible();
  });
});
