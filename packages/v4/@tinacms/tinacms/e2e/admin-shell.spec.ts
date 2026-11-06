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

const topBarCases = [
  { name: 'a project name and a protected branch', query: 'protected=1' },
  {
    name: 'a long project and branch name',
    query:
      'project=A%20very%20long%20project%20name%20for%20the%20site&branch=feature/a-really-long-branch-name',
  },
  { name: 'a project name and a short branch', query: '' },
];

for (const width of [320, 375, 414]) {
  for (const { name, query } of topBarCases) {
    test(`the Top bar keeps the branch name readable with ${name} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`/branches.html?${query}#/`);
      const branch = page.getByRole('button', { name: /^Branch:/ });
      const label = branch.locator('span.font-mono');
      const search = page.getByRole('button', { name: 'Search' });
      await expect(branch).toBeVisible();
      const [b, l, s, bar] = await Promise.all([
        branch.boundingBox(),
        label.boundingBox(),
        search.boundingBox(),
        page.getByRole('banner', { name: 'Top bar' }).boundingBox(),
      ]);
      expect(l?.width).toBeGreaterThanOrEqual(32);
      expect((b?.x ?? 0) + (b?.width ?? 0)).toBeLessThanOrEqual(s?.x ?? 0);
      expect((s?.x ?? 0) + (s?.width ?? 0)).toBeLessThanOrEqual(
        (bar?.x ?? 0) + (bar?.width ?? 0)
      );
    });
  }
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
