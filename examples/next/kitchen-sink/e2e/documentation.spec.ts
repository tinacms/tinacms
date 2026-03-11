/**
 * Documentation listing & detail page tests.
 *
 * Validates that the documentation listing renders doc links and that
 * clicking a doc navigates to a valid detail page.
 */
import { test, expect } from '@playwright/test';

test.describe('Documentation Listing Page', () => {
  test('should load the documentation page', async ({ page }) => {
    await page.goto('/documentation');
    await expect(page.locator('h1')).toContainText(/Documentation/i);
  });

  test('should display at least one documentation link', async ({ page }) => {
    await page.goto('/documentation');
    const docLinks = page.locator('a[href^="/documentation/"]');
    const count = await docLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display documentation titles', async ({ page }) => {
    await page.goto('/documentation');
    // Wait for at least one title to be rendered
    await page.waitForSelector('a[href^="/documentation/"] h2', {
      timeout: 10000,
    });
    const titles = page.locator('a[href^="/documentation/"] h2');
    const count = await titles.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should navigate to a documentation detail page', async ({ page }) => {
    await page.goto('/documentation');
    const firstDoc = page.locator('a[href^="/documentation/"]').first();
    const href = await firstDoc.getAttribute('href');
    expect(href).toBeTruthy();

    await firstDoc.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toContainText('404');
  });
});

test.describe('Documentation Detail Page', () => {
  test('should render documentation content with a title', async ({ page }) => {
    await page.goto('/documentation');
    const firstDoc = page.locator('a[href^="/documentation/"]').first();
    const href = await firstDoc.getAttribute('href');

    await page.goto(href!, { timeout: 60000 });
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});
