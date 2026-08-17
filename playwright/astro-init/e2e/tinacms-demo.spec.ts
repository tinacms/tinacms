import { expect, test } from '@playwright/test';

test.describe('tinacms init — Astro visual-editing demo', () => {
  test('/tinacms-demo renders the fully-editable hero', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/tinacms-demo', { waitUntil: 'load' });

    // headline + tagline + both call-to-action buttons render
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('a.primary')).toBeVisible();
    await expect(page.locator('a.secondary')).toBeVisible();

    // every text element is bound for visual editing:
    // eyebrow, headline, body, + a label per CTA button = 5
    await expect(page.locator('[data-tina-field]')).toHaveCount(5);

    expect(errors, `unexpected page errors: ${errors.join(' | ')}`).toEqual([]);
  });

  test('the CMS admin SPA mounts (guards the react/react-dom blank-admin bug)', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/admin/index.html', { waitUntil: 'load' });

    // a react/react-dom major mismatch crashes the SPA and leaves #root empty
    await expect
      .poll(async () => (await page.locator('#root').innerHTML()).length, {
        timeout: 30000,
      })
      .toBeGreaterThan(100);

    expect(errors, `admin page errors: ${errors.join(' | ')}`).toEqual([]);
  });
});
