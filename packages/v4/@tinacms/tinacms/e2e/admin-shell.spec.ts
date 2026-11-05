import { expect, test } from '@playwright/test';

test('the rail draws a divider above Tools and Settings', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/');
  const divider = page.locator('[data-slot=sidebar-separator]');
  await expect(divider).toBeVisible();
  const box = await divider.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(1);
});

for (const pane of ['collections', 'media', 'tools', 'settings']) {
  test(`the ${pane} pane keeps its Close button on a 390px screen`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/${pane}`);
    const close = page.getByRole('button', { name: 'Close' }).first();
    await expect(close).toBeVisible();
    const box = await close.boundingBox();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390);
  });
}

test('the rail starts where the Top bar ends', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/');
  const bar = await page.getByRole('banner', { name: 'Top bar' }).boundingBox();
  const rail = await page
    .getByRole('navigation', { name: 'Content' })
    .boundingBox();
  expect(rail?.y).toBeGreaterThanOrEqual((bar?.y ?? 0) + (bar?.height ?? 0));
});
