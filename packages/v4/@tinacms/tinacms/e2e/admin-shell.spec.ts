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

const NARROW_VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
];
const SCREEN_ROUTES = ['/#/screens/media', '/#/collections/nope'];

for (const viewport of NARROW_VIEWPORTS) {
  for (const route of SCREEN_ROUTES) {
    test(`${route} shows its content in full at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(route);
      const main = page.locator('[data-slot=sidebar-inset]');
      await expect(main).toBeVisible();
      const box = await main.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(viewport.width - 240);
      const close = main.getByRole('button', { name: 'Close' });
      await expect(close).toBeVisible();
      const closeBox = await close.boundingBox();
      expect((closeBox?.x ?? 0) + (closeBox?.width ?? 0)).toBeLessThanOrEqual(
        viewport.width
      );
    });
  }
}
