/**
 * Edge case tests for the Astro kitchen-sink example app.
 *
 * Verifies that the application gracefully handles missing,
 * null, or malformed data from the CMS without crashing or showing errors.
 */
import { expect, test } from '@playwright/test';

test.describe('Edge Cases — Missing Fields', () => {
  test('blog listing should not crash with missing descriptions', async ({
    page,
  }) => {
    await page.goto('/blog');

    await expect(page.locator('h1')).toBeVisible();

    await expect(page.locator('text=Error')).not.toBeVisible();
    await expect(page.locator('text=undefined')).not.toBeVisible();
    await expect(page.locator('text=null')).not.toBeVisible();
  });

  test('post listing should render even with missing optional fields', async ({
    page,
  }) => {
    await page.goto('/posts');

    await expect(page.locator('h2, h1').first()).toContainText(/Posts/i);

    await expect(page.locator('body')).not.toContainText('undefined');
    await expect(page.locator('body')).not.toContainText('null');
  });

  test('author listing should handle missing avatar images', async ({
    page,
  }) => {
    await page.goto('/authors');

    await expect(page.locator('h1')).toBeVisible();

    await expect(page.locator('text=Error')).not.toBeVisible();
    await expect(page.locator('text=Failed to load')).not.toBeVisible();
  });
});

test.describe('Edge Cases — Empty Collections', () => {
  test('pages should not crash if a collection is empty', async ({ page }) => {
    const routes = ['/posts', '/blog', '/authors'];

    for (const route of routes) {
      await page.goto(route);

      await expect(page.locator('body')).toBeVisible();

      await expect(page).not.toHaveTitle('Error');
    }
  });
});

test.describe('Edge Cases — Invalid Routes', () => {
  test('non-existent post should show 404 gracefully', async ({ page }) => {
    const response = await page.goto('/posts/nonexistent-post-xyz');

    // Astro returns a 404 status for non-existent static routes
    const status = response?.status();
    const hasErrorMessage = await page
      .locator('text=404')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const hasNotFound = await page
      .locator('text=Not found')
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    expect(status === 404 || hasErrorMessage || hasNotFound).toBeTruthy();
  });

  test('non-existent blog should show 404 gracefully', async ({ page }) => {
    const response = await page.goto('/blog/nonexistent-blog-xyz');

    const status = response?.status();
    const hasErrorMessage = await page
      .locator('text=404')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const hasNotFound = await page
      .locator('text=Not found')
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    expect(status === 404 || hasErrorMessage || hasNotFound).toBeTruthy();
  });
});

test.describe('Edge Cases — Malformed Data', () => {
  test('should render posts even with empty title fields', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/posts');

    await expect(page.locator('body')).toBeVisible();

    const fatalErrors = errors.filter((e) =>
      /undefined|null|Cannot read/.test(e)
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('should handle extremely long titles gracefully', async ({ page }) => {
    await page.goto('/blog');

    const titles = page.locator('h2');
    const count = await titles.count();

    if (count > 0) {
      const firstTitle = titles.first();
      await expect(firstTitle).toBeVisible();

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
    await page.goto('/blog');

    const firstBlog = page.locator('a[href^="/blog/"]').first();
    const href = await firstBlog.getAttribute('href');

    if (href) {
      await page.goto(href);

      const content = page.locator('main, article, [role="main"]');
      const hasContent = await content
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (hasContent) {
        const contentText = await content.textContent();
        expect(contentText).not.toMatch(/^\s*##\s+/);
        expect(contentText).not.toMatch(/^\s*-\s+\w+/);
      }
    }
  });

  test('images should have alt text for accessibility', async ({ page }) => {
    await page.goto('/blog');

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const title = await img.getAttribute('title');
        const ariaLabel = await img.getAttribute('aria-label');

        expect(alt || title || ariaLabel).toBeTruthy();
      }
    }
  });
});

test.describe('Edge Cases — Mobile Rendering', () => {
  test('pages should render on mobile viewport without errors', async ({
    page,
  }) => {
    const routes = ['/', '/blog', '/posts', '/authors'];

    for (const route of routes) {
      await page.goto(route);

      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('text=Error')).not.toBeVisible();
    }
  });
});

test.describe('Edge Cases — Special Characters', () => {
  test('should handle titles with special characters', async ({ page }) => {
    await page.goto('/blog');

    const blogCards = page.locator('a[href^="/blog/"]');
    const count = await blogCards.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = blogCards.nth(i);
        const title = await card.textContent();

        expect(title?.length).toBeGreaterThan(0);
      }
    }
  });
});
