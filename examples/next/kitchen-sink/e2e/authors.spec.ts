/**
 * Authors listing & detail page tests.
 *
 * Validates that the authors listing renders author cards from the CMS
 * and that detail pages load correctly.
 */
import { test, expect } from '@playwright/test';

test.describe('Authors Listing Page', () => {
  test('should load the authors page', async ({ page }) => {
    await page.goto('/authors');
    await expect(page.locator('h1')).toContainText(/Authors/i);
  });

  test('should display at least one author', async ({ page }) => {
    await page.goto('/authors');
    const authorCards = page.locator('a[href^="/authors/"]');
    const count = await authorCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display author names', async ({ page }) => {
    await page.goto('/authors');
    const names = page.locator('a[href^="/authors/"] h2');
    const count = await names.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const text = await names.nth(i).textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should navigate to an author detail page', async ({ page }) => {
    await page.goto('/authors');
    const firstAuthor = page.locator('a[href^="/authors/"]').first();
    const href = await firstAuthor.getAttribute('href');
    expect(href).toBeTruthy();

    await firstAuthor.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toContainText('404');
  });
});

test.describe('Author Detail Page', () => {
  test('should render author info', async ({ page }) => {
    await page.goto('/authors');
    const firstAuthor = page.locator('a[href^="/authors/"]').first();
    const href = await firstAuthor.getAttribute('href');

    await page.goto(href!, { timeout: 60000 });
    // Author detail should have the author's name visible
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});
