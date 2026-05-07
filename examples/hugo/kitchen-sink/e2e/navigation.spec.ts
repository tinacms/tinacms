import { expect, test } from '@playwright/test';

test.describe('Header Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display header navigation links', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const navLinks = header.locator('nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to Posts page via nav link', async ({ page }) => {
    const postsLink = page.locator('header nav a[href="/posts"]').first();

    if ((await postsLink.count()) > 0) {
      await postsLink.click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/posts/);
    } else {
      await page.goto('/posts/');
    }

    await expect(page.locator('h1, h2').first()).toContainText(/posts/i);
  });

  test('should navigate to Blog page via nav link', async ({ page }) => {
    const blogLink = page.locator('header nav a[href="/blog"]').first();
    if ((await blogLink.count()) > 0) {
      await blogLink.click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/blog/);
      await expect(page.locator('h1').first()).toContainText(/Blog/i);
    }
  });

  test('should navigate to Authors page via nav link', async ({ page }) => {
    const authorsLink = page.locator('header nav a[href="/authors"]').first();
    if ((await authorsLink.count()) > 0) {
      await authorsLink.click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/authors/);
      await expect(page.locator('h1').first()).toContainText(/Authors/i);
    }
  });

  test('should navigate home via logo/site-name click', async ({ page }) => {
    await page.goto('/posts/');

    const homeLink = page.locator('header a[href="/"]').first();
    await homeLink.click();
    await expect(page).toHaveURL(/\/$/);

    await expect(page.locator('text=Error')).not.toBeVisible();
  });
});
