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
const SCREEN_ROUTES = ['/#/collections/nope'];

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
      const railInline = viewport.width >= 768;
      expect(box?.width).toBeGreaterThanOrEqual(
        railInline ? viewport.width - 240 : viewport.width
      );
      const close = main.getByRole('button', { name: 'Close' });
      await expect(close).toBeVisible();
      const closeBox = await close.boundingBox();
      expect((closeBox?.x ?? 0) + (closeBox?.width ?? 0)).toBeLessThanOrEqual(
        viewport.width
      );
    });
  }
}

test('the Media pane fills the screen below 1024px and hides the main area', async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/#/media');
  await expect(
    page.getByRole('complementary', { name: 'Media' })
  ).toBeVisible();
  await expect(page.locator('[data-slot=sidebar-inset]')).toBeHidden();
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
]) {
  test(`the Media pane does not scroll the page sideways at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/#/screens/media');
    const pane = page.getByRole('complementary', { name: 'Media' });
    await expect(pane).toBeVisible();
    await expect(
      pane.getByRole('button', { name: 'preview.svg' })
    ).toBeVisible();
    for (const view of ['List view', 'Grid view']) {
      await pane.getByRole('button', { name: view }).click();
      const overflow = await page.evaluate(() => {
        const root = document.scrollingElement;
        return root ? root.scrollWidth - root.clientWidth : 0;
      });
      expect(overflow).toBeLessThanOrEqual(0);
    }
    await pane.getByRole('button', { name: 'Select' }).click();
    const overflow = await page.evaluate(() => {
      const root = document.scrollingElement;
      return root ? root.scrollWidth - root.clientWidth : 0;
    });
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

for (const width of [320, 360, 375, 390, 1280]) {
  test(`the Select bar keeps one height and every action inside the Media pane at ${width}px as the count grows past 10`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/#/screens/media');
    const pane = page.getByRole('complementary', { name: 'Media' });
    await pane.getByRole('button', { name: 'Select', exact: true }).click();
    const bar = pane.getByRole('toolbar', { name: 'Selected files' });
    const boxes = pane.getByRole('checkbox');
    expect(await boxes.count()).toBeGreaterThanOrEqual(12);
    const heights: number[] = [];
    for (const count of [0, 1, 10, 12]) {
      while (
        (await pane.getByText(/^\d+ selected$/).innerText()) !==
        `${count} selected`
      ) {
        const selected = Number(
          (await pane.getByText(/^\d+ selected$/).innerText()).split(' ')[0]
        );
        await boxes.nth(selected).click();
      }
      heights.push((await bar.boundingBox())?.height ?? 0);
      const paneBox = await pane.boundingBox();
      for (const button of await bar.getByRole('button').all()) {
        const box = await button.boundingBox();
        expect(box).not.toBeNull();
        expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
          (paneBox?.x ?? 0) + (paneBox?.width ?? 0)
        );
        expect(
          await button.evaluate((el) => el.scrollWidth - el.clientWidth)
        ).toBeLessThanOrEqual(0);
      }
    }
    expect(new Set(heights).size).toBe(1);
  });
}

test('on a desktop the Media pane maximises over the main area and restores', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#/screens/media');
  const pane = page.getByRole('complementary', { name: 'Media' });
  await pane.getByRole('button', { name: 'Maximise' }).click();
  await expect(page.locator('[data-slot=sidebar-inset]')).toBeHidden();
  await pane.getByRole('button', { name: 'Restore' }).click();
  await expect(page.locator('[data-slot=sidebar-inset]')).toBeVisible();
});

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
    name: 'a project name, a protected branch and an account button',
    query: 'protected=1&account=1',
  },
  {
    name: 'a project name, the branch main and an account button',
    query: 'branch=main&account=1',
  },
  {
    name: 'a long project name, a long branch and an account button',
    query:
      'project=A%20very%20long%20project%20name%20for%20the%20site&branch=feature/a-really-long-branch-name&account=1',
  },
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
      const full = await label.evaluate((node) => node.scrollWidth);
      expect(l?.width).toBeGreaterThanOrEqual(Math.min(32, full) - 1);
      expect(await page.locator('[data-slot=top-bar]').innerText()).not.toMatch(
        /\/\s*\/|\/\s*$/
      );
      expect((b?.x ?? 0) + (b?.width ?? 0)).toBeLessThanOrEqual(s?.x ?? 0);
      expect((s?.x ?? 0) + (s?.width ?? 0)).toBeLessThanOrEqual(
        (bar?.x ?? 0) + (bar?.width ?? 0)
      );
    });
  }
}
