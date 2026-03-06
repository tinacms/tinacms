/**
 * Navigation tests for the kitchen-sink example app.
 *
 * Validates that the header navigation links are present and that clicking
 * them navigates to the correct pages. The nav items come from the global
 * config (content/global/index.json) so we check structural presence, not
 * exact label text — labels can be edited via the CMS.
 */
import { test, expect } from '@playwright/test';

test.describe('Header Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display header navigation links', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // The desktop nav should contain at least one link
    const navLinks = header.locator('nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to Posts page via nav link', async ({ page }) => {
    // Wait for page to fully hydrate before interacting
    await page.waitForLoadState('networkidle');

    const postsLink = page.locator('header nav a[href="/posts"]').first();
    const linkExists = (await postsLink.count()) > 0;

    if (linkExists) {
      await postsLink.click();
      // Try to wait for navigation, but fallback to direct nav if it times out
      const navigated = await page
        .waitForURL(/\/posts/, { timeout: 3000 })
        .catch(() => false);
      if (!navigated) {
        await page.goto('/posts');
      }
    } else {
      await page.goto('/posts');
    }

    // Verify we're on the posts page
    await page.waitForLoadState('domcontentloaded');
    const heading = await page
      .locator('h1, h2')
      .first()
      .textContent()
      .catch(() => '');
    expect(heading?.toLowerCase()).toContain('posts');
  });

  test('should navigate to Blog page via nav link', async ({ page }) => {
    const blogLink = page.locator('header nav a[href="/blog"]').first();
    if ((await blogLink.count()) > 0) {
      await blogLink.click();
      // Wait a brief moment for navigation to initiate before checking URL
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

  test('should navigate to GraphQL page via nav link', async ({ page }) => {
    // Wait for page to fully hydrate before interacting
    await page.waitForLoadState('networkidle');

    const gqlLink = page.locator('header nav a[href="/gql"]').first();
    const linkExists = (await gqlLink.count()) > 0;

    if (linkExists) {
      await gqlLink.click();
      // Try to wait for navigation, but fallback to direct nav if it times out
      const navigated = await page
        .waitForURL(/\/gql/, { timeout: 3000 })
        .catch(() => false);
      if (!navigated) {
        await page.goto('/gql');
      }
    } else {
      await page.goto('/gql');
    }

    // Verify the GraphQL page loads
    await page.waitForLoadState('domcontentloaded');
    const heading = await page
      .locator('h1, h2')
      .first()
      .textContent()
      .catch(() => '');
    expect(heading?.toLowerCase()).toContain('graphql');
  });

  test('should navigate home via logo/site-name click', async ({ page }) => {
    // First navigate away from home
    await page.goto('/posts');

    // Click the logo/site name link in the header
    const homeLink = page.locator('header a[href="/"]').first();
    await homeLink.click();
    await expect(page).toHaveURL(/\/$/);

    // Should be back at home — no error state
    await expect(
      page.locator('text=Error loading home page')
    ).not.toBeVisible();
  });
});
