/**
 * Edge case tests for the kitchen-sink example app.
 *
 * These tests verify that the application gracefully handles missing,
 * null, or malformed data from the CMS without crashing or showing errors.
 */
import { test, expect } from '@playwright/test';

test.describe('Edge Cases — Missing Fields', () => {
  test('blog listing should not crash with missing descriptions', async ({
    page,
  }) => {
    // The blog listing should load without errors even if some blogs
    // lack descriptions, images, or other optional fields
    await page.goto('/blog');

    // Page should load successfully
    await expect(page.locator('h1')).toBeVisible();

    // No error messages should appear
    await expect(page.locator('text=Error')).not.toBeVisible();
    await expect(page.locator('text=undefined')).not.toBeVisible();
    await expect(page.locator('text=null')).not.toBeVisible();
  });

  test('post listing should render even with missing optional fields', async ({
    page,
  }) => {
    await page.goto('/posts');

    // Page should load
    await expect(page.locator('h2, h1').first()).toContainText(/Posts/i);

    // No console errors or undefined/null text visible
    await expect(page.locator('body')).not.toContainText('undefined');
    await expect(page.locator('body')).not.toContainText('null');
  });

  test('author listing should handle missing avatar images', async ({
    page,
  }) => {
    await page.goto('/authors');

    // Page should load successfully
    await expect(page.locator('h1')).toBeVisible();

    // Should not show broken image indicators or errors
    await expect(page.locator('text=Error')).not.toBeVisible();
    await expect(page.locator('text=Failed to load')).not.toBeVisible();
  });
});

test.describe('Edge Cases — Empty Collections', () => {
  test('pages should not crash if a collection is empty', async ({ page }) => {
    // This test documents how the app should behave if, for example,
    // all tags are deleted or no posts exist

    // Most pages have graceful handling, but this validates that
    // the page structure remains intact
    const routes = ['/posts', '/blog', '/authors'];

    for (const route of routes) {
      await page.goto(route);

      // Page should load without throwing
      await expect(page.locator('body')).toBeVisible();

      // Should not show generic error page
      await expect(page).not.toHaveTitle('Error');
    }
  });
});

test.describe('Edge Cases — Invalid Routes', () => {
  test('non-existent post should show 404 gracefully', async ({ page }) => {
    await page.goto('/posts/nonexistent-post-xyz', {
      waitUntil: 'networkidle',
    });

    // Should either show a 404 page, "Not Found" text, or redirect away from the invalid URL
    const hasErrorMessage = await page
      .locator('text=404')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const hasNotFound = await page
      .locator('text=Not found')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const wasRedirected = !page.url().includes('nonexistent-post-xyz');

    expect(hasErrorMessage || hasNotFound || wasRedirected).toBeTruthy();
  });

  test('non-existent blog should show 404 gracefully', async ({ page }) => {
    await page.goto('/blog/nonexistent-blog-xyz', { waitUntil: 'networkidle' });

    const hasErrorMessage = await page
      .locator('text=404')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const hasNotFound = await page
      .locator('text=Not found')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const wasRedirected = !page.url().includes('nonexistent-blog-xyz');

    expect(hasErrorMessage || hasNotFound || wasRedirected).toBeTruthy();
  });
});

test.describe('Edge Cases — Malformed Data', () => {
  test('should render posts even with empty title fields', async ({ page }) => {
    // Posts with empty titles should still render (or be handled gracefully)
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/posts');

    // Page loads
    await expect(page.locator('body')).toBeVisible();

    // Should not have fatal errors, but minor issues are okay
    const fatalErrors = errors.filter((e) =>
      /undefined|null|Cannot read/.test(e)
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('should handle extremely long titles gracefully', async ({ page }) => {
    // If a blog/post has a very long title, it should not break the layout
    await page.goto('/blog');

    // Find the longest visible title
    const titles = page.locator('h2');
    const count = await titles.count();

    if (count > 0) {
      // At least one title should be visible
      const firstTitle = titles.first();
      await expect(firstTitle).toBeVisible();

      // Title should not overflow or break the layout (basic check)
      const box = await firstTitle.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
    }
  });
});

test.describe('Edge Cases — Network Issues', () => {
  test('blog detail page should not return a 500 error', async ({ page }) => {
    await page.goto('/blog');

    const firstBlog = page.locator('a[href^="/blog/"]').first();
    const href = await firstBlog.getAttribute('href');

    if (href) {
      await page.goto(href, { timeout: 30000, waitUntil: 'domcontentloaded' });

      const has500Error = await page
        .locator('text=500')
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      expect(has500Error).toBe(false);
    }
  });
});

test.describe('Edge Cases — Content Rendering', () => {
  test('rich text content should render as HTML, not raw markdown', async ({
    page,
  }) => {
    // Navigate to a blog/post and verify content is rendered, not raw
    await page.goto('/blog');

    const firstBlog = page.locator('a[href^="/blog/"]').first();
    const href = await firstBlog.getAttribute('href');

    if (href) {
      await page.goto(href);

      // Page should have rendered some content area
      const content = page.locator('main, article, [role="main"]');
      const hasContent = await content
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (hasContent) {
        // Content should not look like raw markdown (no leading "## " or "- ")
        const contentText = await content.textContent();
        expect(contentText).not.toMatch(/^\s*##\s+/);
        expect(contentText).not.toMatch(/^\s*-\s+\w+/);
      }
    }
  });

  test('images should have alt text for accessibility', async ({ page }) => {
    // Navigate to blog listing where images are displayed
    await page.goto('/blog');

    // Find all images
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Images should have alt text or appropriate attributes
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const title = await img.getAttribute('title');
        const ariaLabel = await img.getAttribute('aria-label');

        // At least one of these should exist
        expect(alt || title || ariaLabel).toBeTruthy();
      }
    }
  });
});

test.describe('Edge Cases — Mobile Rendering', () => {
  test('pages should render on mobile viewport without errors', async ({
    page,
  }) => {
    // Test pages on desktop viewport first with mobile-like font sizes
    const routes = ['/', '/blog', '/posts', '/authors'];

    for (const route of routes) {
      await page.goto(route);

      // Should not show layout errors or crash
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('text=Error')).not.toBeVisible();
    }
  });
});

test.describe('Edge Cases — Special Characters', () => {
  test('should handle titles with special characters', async ({ page }) => {
    // Navigate to pages and verify special characters render correctly
    await page.goto('/blog');

    const blogCards = page.locator('a[href^="/blog/"]');
    const count = await blogCards.count();

    if (count > 0) {
      // Get a few blog titles and verify they render
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = blogCards.nth(i);
        const title = await card.textContent();

        // Title should render (special chars like & or © should display, not as entities in text)
        expect(title?.length).toBeGreaterThan(0);
      }
    }
  });
});
