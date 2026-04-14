import { expect, test } from '@playwright/test';

test.describe('Blog Listing Page', () => {
  test('should load the blog page', async ({ page }) => {
    await page.goto('/blog/');
    await expect(page.locator('h1')).toContainText(/Blog/i);
  });

  test('should display blog cards', async ({ page }) => {
    await page.goto('/blog/');
    await page.waitForSelector('a[href^="/blog/"]', { timeout: 10000 });
    const blogCards = page.locator('a[href^="/blog/"]');
    const count = await blogCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display blog titles in each card', async ({ page }) => {
    await page.goto('/blog/');
    await page.waitForSelector('a[href^="/blog/"] h2', { timeout: 10000 });
    const titles = page.locator('a[href^="/blog/"] h2');
    const count = await titles.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should navigate to a blog detail page', async ({ page }) => {
    await page.goto('/blog/');
    const firstBlog = page.locator('a[href^="/blog/"]').first();
    const href = await firstBlog.getAttribute('href');
    expect(href).toBeTruthy();

    await firstBlog.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toContainText('404');
  });
});

test.describe('Blog Detail Page', () => {
  test('should render blog content with a title', async ({ page }) => {
    await page.goto('/blog/');
    const firstBlog = page.locator('a[href^="/blog/"]').first();
    const href = await firstBlog.getAttribute('href');

    await page.goto(href!, { timeout: 60000 });
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });
});
