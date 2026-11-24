import { type Page, expect, test } from '@playwright/test';

const HELLO = 'content/posts/hello-world.mdx';
const url = `/?preview=${encodeURIComponent(`/declared.html?post=${HELLO}`)}#/collections/post/${encodeURIComponent(HELLO)}`;

const open = async (page: Page, width: number, height: number) => {
  await page.setViewportSize({ width, height });
  await page.goto(url);
  await expect(page.locator('#title')).toBeVisible({ timeout: 30_000 });
};

const countLoads = async (page: Page) => {
  await page.evaluate(() => {
    const target = window as unknown as { __loads: number };
    target.__loads = 0;
    document
      .querySelector('iframe[title="Preview"]')
      ?.addEventListener('load', () => {
        target.__loads += 1;
      });
  });
  return () =>
    page.evaluate(() => (window as unknown as { __loads: number }).__loads);
};

const openCollections = async (page: Page) => {
  await page.getByRole('button', { name: 'Open side nav' }).click();
  await page.locator('[data-rail-row][aria-label="Collections"]').click();
  await expect(page).toHaveURL(/\?nav$/);
};

const expectColumnBesidePreview = async (page: Page) => {
  const column = page.getByRole('complementary', { name: 'Navigator' });
  await expect(column).toBeVisible();
  expect((await column.boundingBox())?.width).toBe(440);
  const frame = await page.locator('iframe[title="Preview"]').boundingBox();
  expect(frame?.width ?? 0).toBeGreaterThan(100);
  expect(frame?.height ?? 0).toBeGreaterThan(100);
  await expect(
    page.getByRole('group', { name: 'View', exact: true })
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Restore/ })).toHaveCount(0);
};

const expectSplitWithEdit = async (page: Page, edit: string) => {
  await expect(page.locator('#title')).toHaveValue(edit);
  await expect(page.locator('iframe[title="Preview"]')).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'View', exact: true })
  ).toHaveCount(0);
};

for (const [name, maximise] of [
  ['Maximise form', 'Maximise form'],
  ['Maximise preview', 'Maximise preview'],
] as const) {
  test(`Collections after ${name} on a tablet leaves one view and shows the column beside the preview`, async ({
    page,
  }) => {
    await open(page, 1024, 768);
    await page.locator('#title').fill(`Edited after ${name}`);
    const loads = await countLoads(page);
    await page.getByRole('button', { name: maximise }).click();
    await openCollections(page);
    await expectColumnBesidePreview(page);
    await expect(
      page
        .getByRole('complementary', { name: 'Navigator' })
        .locator('[aria-current=page]')
    ).toBeFocused();
    await page
      .getByRole('complementary', { name: 'Navigator' })
      .getByRole('button', { name: 'Close' })
      .click();
    await expectSplitWithEdit(page, `Edited after ${name}`);
    expect(await loads()).toBe(0);
  });
}

test('browser Back from Collections after Maximise form shows the split with the edit', async ({
  page,
}) => {
  await open(page, 1024, 768);
  await page.locator('#title').fill('Back keeps the edit');
  await page.getByRole('button', { name: 'Maximise form' }).click();
  await openCollections(page);
  await page.goBack();
  await expectSplitWithEdit(page, 'Back keeps the edit');
});

test('widening from a phone with Collections open shows the column beside the preview', async ({
  page,
}) => {
  await open(page, 390, 844);
  await page.locator('#title').fill('Edited on a phone');
  const loads = await countLoads(page);
  await openCollections(page);
  await page.setViewportSize({ width: 1024, height: 768 });
  await expectColumnBesidePreview(page);
  await page
    .getByRole('complementary', { name: 'Navigator' })
    .getByRole('button', { name: 'Close' })
    .click();
  await expectSplitWithEdit(page, 'Edited on a phone');
  expect(await loads()).toBe(0);
});
