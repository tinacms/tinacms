/**
 * Posts listing & detail page tests.
 *
 * Validates that the posts listing page renders posts from the CMS and that
 * individual post detail pages load correctly. Content text may change, so
 * we assert on structural elements rather than exact wording.
 */
import { test, expect } from '@playwright/test';

test.describe('Posts Listing Page', () => {
  test('should load the posts page', async ({ page }) => {
    await page.goto('/posts');
    // Page heading
    await expect(page.locator('h2, h1').first()).toContainText(/Posts/i);
  });

  test('should display at least one post link', async ({ page }) => {
    await page.goto('/posts');
    // Wait for at least one post link to be rendered
    await page.waitForSelector('a[href^="/posts/"]', { timeout: 10000 });
    // Each post is rendered as an <a> tag wrapping an article-like block
    const postLinks = page.locator('a[href^="/posts/"]');
    const count = await postLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display post titles', async ({ page }) => {
    await page.goto('/posts');
    // Wait for at least one title to be rendered
    await page.waitForSelector('a[href^="/posts/"] h3', { timeout: 10000 });
    // Each post card has an h3 title
    const postTitles = page.locator('a[href^="/posts/"] h3');
    const count = await postTitles.count();
    expect(count).toBeGreaterThan(0);

    // Each title should have non-empty text
    for (let i = 0; i < count; i++) {
      const text = await postTitles.nth(i).textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should navigate to a post detail page when clicked', async ({
    page,
  }) => {
    await page.goto('/posts');
    const firstPost = page.locator('a[href^="/posts/"]').first();
    const href = await firstPost.getAttribute('href');
    expect(href).toBeTruthy();

    await firstPost.click();
    await page.waitForLoadState('domcontentloaded');
    // The detail page should have loaded (no Next.js error page)
    await expect(page.locator('body')).not.toContainText('404');
  });
});

test.describe('Post Detail Page', () => {
  test('should render post content structure', async ({ page }) => {
    // Navigate via the listing to get a valid slug
    await page.goto('/posts');
    const firstPost = page.locator('a[href^="/posts/"]').first();
    const href = await firstPost.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href!);
    // A post detail page should contain a title (h1 or h2) and some body content
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});
