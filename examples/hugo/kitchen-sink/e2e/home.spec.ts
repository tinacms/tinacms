import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load without errors', async ({ page }) => {
    await expect(page.locator('text=Error')).not.toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Tina/);
  });

  test('should render the header with site name', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should render at least one block on the page', async ({ page }) => {
    const sections = page.locator('section');
    await expect(sections.first()).toBeVisible();
  });

  test('should render the footer', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
  });
});
