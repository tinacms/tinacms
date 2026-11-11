import { type Locator, type Page, expect, test } from '@playwright/test';

const PR = encodeURIComponent('https://github.com/acme/site/pull/128');
const LONG_BRANCH =
  'feature/a-really-long-branch-name-that-must-wrap-on-a-phone-screen-without-overflow';

const panel = (page: Page, name: string | RegExp) =>
  page.getByRole('main').getByRole('region', { name });

const boxOf = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error('The element has no box.');
  return box;
};

const expectNoSidewaysScroll = async (page: Page) => {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
  ).toBeLessThanOrEqual(0);
};

test('Home on a branch has two columns at 1280px and wider', async ({
  page,
}) => {
  for (const width of [1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/branches.html?docs=12&pr=${PR}#/`);
    const [collections, recent, branch] = await Promise.all([
      boxOf(panel(page, /^Collections/)),
      boxOf(panel(page, 'Recent documents')),
      boxOf(panel(page, 'Branch')),
    ]);
    expect(recent.x).toBeGreaterThanOrEqual(collections.x + collections.width);
    expect(Math.abs(recent.y - collections.y)).toBeLessThan(2);
    expect(branch.x).toBe(recent.x);
    expect(branch.y).toBeGreaterThanOrEqual(recent.y + recent.height);
    expect(recent.width).toBe(400);
    await expect(
      page.getByRole('main').getByRole('button', { name: /^Review/ })
    ).toHaveCount(0);
    await expectNoSidewaysScroll(page);
  }
});

for (const width of [1279, 1024, 390]) {
  test(`Home on a branch is one column from Branch down at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/branches.html?docs=12&pr=${PR}#/`);
    const [branch, recent, collections] = await Promise.all([
      boxOf(panel(page, 'Branch')),
      boxOf(panel(page, 'Recent documents')),
      boxOf(panel(page, /^Collections/)),
    ]);
    expect(recent.y).toBeGreaterThanOrEqual(branch.y + branch.height);
    expect(collections.y).toBeGreaterThanOrEqual(recent.y + recent.height);
    expect(recent.x).toBe(branch.x);
    expect(recent.width).toBe(branch.width);
    expect(collections.width).toBe(branch.width);
    await expectNoSidewaysScroll(page);
  });
}

test('Home in local files starts the one column at Recent documents', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/#/');
  const [recent, collections] = await Promise.all([
    boxOf(panel(page, 'Recent documents')),
    boxOf(panel(page, /^Collections/)),
  ]);
  expect(collections.y).toBeGreaterThanOrEqual(recent.y + recent.height);
  await expect(panel(page, 'Branch')).toHaveCount(0);
  await expect(
    page.getByText('Local files: Tina writes edits straight to disk.')
  ).toBeVisible();
});

test('Recent documents scrolls inside itself on a desktop and adds rows at the end, by wheel and by keyboard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const contentRequests: string[] = [];
  await page.goto('/branches.html?docs=65#/');
  page.on('request', (request) => {
    if (request.url().includes('/api/')) contentRequests.push(request.url());
  });
  const recent = panel(page, 'Recent documents');
  const list = recent.getByRole('list', { name: 'Recent documents' });
  const rows = list.getByRole('button');
  await expect(rows).toHaveCount(20);
  const before = await boxOf(recent);
  expect(
    await list.evaluate((node) => node.scrollHeight > node.clientHeight)
  ).toBe(true);

  await list.hover();
  await page.mouse.wheel(0, 5000);
  await expect(rows).toHaveCount(40);

  await rows.nth(39).focus();
  await expect(rows).toHaveCount(60);
  await rows.nth(59).focus();
  await expect(rows).toHaveCount(65);

  expect((await boxOf(recent)).height).toBe(before.height);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(contentRequests).toEqual([]);
});

for (const width of [1024, 390]) {
  test(`Recent documents shows five rows and Show more at ${width}px, with no inner scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/branches.html?docs=12#/');
    const recent = panel(page, 'Recent documents');
    const list = recent.getByRole('list', { name: 'Recent documents' });
    const rows = list.getByRole('button');
    const more = recent.getByRole('button', { name: 'Show more' });
    await expect(rows).toHaveCount(5);
    await more.click();
    await expect(rows).toHaveCount(10);
    await expect(more).toBeFocused();
    expect(
      await list.evaluate((node) => node.scrollHeight <= node.clientHeight)
    ).toBe(true);
    await more.press('Enter');
    await expect(rows).toHaveCount(12);
    await expect(more).toHaveCount(0);
    await expect(rows.nth(10)).toBeFocused();
  });
}

test('Recent documents has no Show more for five rows', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/branches.html?docs=5#/');
  const recent = panel(page, 'Recent documents');
  await expect(recent.getByRole('list').getByRole('button')).toHaveCount(5);
  await expect(recent.getByRole('button', { name: 'Show more' })).toHaveCount(
    0
  );
});

test('Collections are one-line rows with the count and no New on a phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/branches.html?docs=12#/');
  const collections = panel(page, /^Collections/);
  const posts = collections.getByRole('button', { name: /^Posts/ });
  await expect(posts).toContainText('12 documents');
  expect((await boxOf(posts)).height).toBeLessThan(60);
  await expect(collections.getByRole('button', { name: /^New/ })).toHaveCount(
    0
  );
  await expect(collections.locator('[data-slot=tile]')).toHaveCount(0);
});

test('Collections are tiles with New on a tablet', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/branches.html?docs=12#/');
  const collections = panel(page, /^Collections/);
  await expect(collections.locator('[data-slot=tile]')).toHaveCount(2);
  await expect(
    collections.getByRole('button', { name: 'New Posts document' })
  ).toBeDisabled();
});

test('Review N unsaved is full width under the local-files line on a phone, and at the right of the head on a desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    `/#/collections/post/${encodeURIComponent('content/posts/hello-world.mdx')}`
  );
  await page.getByRole('textbox', { name: /^Title/ }).fill('Unsaved title');
  await page.goto('/#/');
  const main = page.getByRole('main');
  const review = main.getByRole('button', { name: 'Review 1 unsaved' });
  const line = main.getByText(
    'Local files: Tina writes edits straight to disk.'
  );
  const [reviewBox, lineBox, recentBox] = await Promise.all([
    boxOf(review),
    boxOf(line),
    boxOf(panel(page, 'Recent documents')),
  ]);
  expect(reviewBox.y).toBeGreaterThanOrEqual(lineBox.y + lineBox.height);
  expect(reviewBox.width).toBe(recentBox.width);
  await expect(
    panel(page, 'Recent documents').getByRole('button', {
      name: /^hello-world.*Unsaved/,
    })
  ).toBeVisible();
  await expectNoSidewaysScroll(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  const [wideReview, heading] = await Promise.all([
    boxOf(review),
    boxOf(main.getByRole('heading', { name: 'Home' })),
  ]);
  expect(wideReview.x).toBeGreaterThan(heading.x + heading.width);
  expect(wideReview.width).toBeLessThan(300);

  await review.click();
  await expect(page).toHaveURL(/#\/collections\?unsaved$/);
  await page.evaluate(() => localStorage.clear());
});

test('long names wrap and nothing overflows sideways at 390px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    `/branches.html?docs=7&long=1&branch=${encodeURIComponent(LONG_BRANCH)}#/`
  );
  const main = page.getByRole('main');
  const texts = [
    main.getByText(LONG_BRANCH),
    main.getByText(
      'Posts-and-announcements-and-a-really-long-collection-name-without-a-space'
    ),
    main
      .getByText(
        'a-document-with-a-really-long-file-name-that-must-wrap-on-a-phone-number-1'
      )
      .first(),
  ];
  for (const text of texts) {
    await expect(text).toBeVisible();
    const fits = await text.evaluate((node) => {
      const box = node.getBoundingClientRect();
      return (
        node.scrollWidth <= node.clientWidth + 1 &&
        box.left >= 0 &&
        box.right <= window.innerWidth &&
        box.height > 30
      );
    });
    expect(fits).toBe(true);
  }
  await expectNoSidewaysScroll(page);
});

test('a long collection name wraps in its tile at 1440px', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/branches.html?docs=2&long=1#/');
  const name = page.getByRole('main').getByRole('button', {
    name: 'Posts-and-announcements-and-a-really-long-collection-name-without-a-space',
    exact: true,
  });
  const tile = page.locator('[data-slot=tile]').first();
  const [nameBox, tileBox] = await Promise.all([boxOf(name), boxOf(tile)]);
  expect(nameBox.x + nameBox.width).toBeLessThanOrEqual(
    tileBox.x + tileBox.width
  );
  await expectNoSidewaysScroll(page);
});

test('the pull request opens in a new tab', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/branches.html?pr=${PR}#/`);
  const link = panel(page, 'Branch').getByRole('link', {
    name: /^Pull request #128/,
  });
  await expect(link).toHaveAttribute(
    'href',
    'https://github.com/acme/site/pull/128'
  );
  await expect(link).toHaveAttribute('target', '_blank');
});

test('Home reaches every tile, row and button by Tab, and Enter opens a collection', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/branches.html?docs=2&pr=${PR}#/`);
  const main = page.getByRole('main');
  const posts = main.getByRole('button', { name: 'Posts', exact: true });
  await posts.focus();
  const stops = ['Posts'];
  for (let step = 0; step < 4; step += 1) {
    await page.keyboard.press('Tab');
    stops.push(
      await page.evaluate(
        () => document.activeElement?.textContent?.trim() ?? ''
      )
    );
  }
  expect(stops[1]).toBe('Pages');
  expect(stops[2]).toMatch(/^post-01/);
  expect(stops[3]).toMatch(/^post-02/);
  expect(stops[4]).toMatch(/^Pull request #128/);
  await posts.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/collections\/post$/);
});
