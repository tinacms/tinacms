import { expect, test } from '@playwright/test';

test('at 390px the tree reaches the index, a table, Rename and back with no typed address', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/collections');
  const pane = page.getByRole('complementary', { name: 'Navigator' });
  await pane.getByRole('button', { name: 'Maximise' }).click();
  await expect(page).toHaveURL(/#\/collections\?max$/);

  const index = page.getByRole('table', { name: 'Collections' });
  await index.getByRole('button', { name: 'Posts' }).click();
  await expect(page).toHaveURL(/#\/collections\/post\?max$/);

  const table = page.getByRole('region', { name: 'Posts documents' });
  await table
    .getByRole('button', { name: /^Actions for / })
    .first()
    .click();
  await page.getByRole('menuitem', { name: 'Rename' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: 'Restore' }).click();
  await expect(page).toHaveURL(/#\/collections\/post$/);
  await expect(
    page.getByRole('complementary', { name: 'Navigator' })
  ).toBeVisible();
});

test('on a desktop the Home screen sits beside the tree and the icon maximises', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/collections/post');
  const pane = page.getByRole('complementary', { name: 'Navigator' });
  await expect(pane).toBeVisible();
  await expect(page.locator('[data-slot=home-frame]')).toBeVisible();
  await pane.getByRole('button', { name: 'Maximise' }).click();
  await expect(page).toHaveURL(/#\/collections\/post\?max$/);
  await expect(pane).toBeHidden();
  const frame = await page
    .getByRole('region', { name: 'Posts documents' })
    .boundingBox();
  expect(frame?.width).toBeGreaterThan(900);
});

test('at 1280px Home beside the tree keeps its headings, counts and buttons inside the pane', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#/collections/post');
  const frame = page.locator('[data-slot=home-frame]');
  await expect(frame).toBeVisible();
  const box = await frame.boundingBox();
  if (!box) throw new Error('Home has no box');
  const heading = frame.getByRole('heading', { name: 'Collections' }).first();
  await expect(heading).toBeVisible();
  expect((await heading.boundingBox())?.height ?? 99).toBeLessThan(40);
  await expect(frame.getByText(/\d+ documents?/).first()).toBeVisible();
  for (const button of await frame.getByRole('button').all()) {
    if (!(await button.isVisible())) continue;
    const buttonBox = await button.boundingBox();
    expect((buttonBox?.x ?? 0) + (buttonBox?.width ?? 0)).toBeLessThanOrEqual(
      box.x + box.width + 1
    );
  }
  await page.screenshot({ path: test.info().outputPath('home-1280.png') });
});

test('the File path and the exact time show on hover, and a click on the File text opens the row', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/collections/post?max');
  const row = page.getByRole('row').filter({ hasText: 'hello-world' }).first();
  const file = row.getByText(/hello-world\.mdx/).first();
  await file.hover();
  await expect(page.getByText(/hello-world\.mdx/)).toHaveCount(2);
  const time = row.locator('time').first();
  await time.hover();
  await expect(
    page.locator('[data-open][data-slot=tooltip-content]')
  ).toContainText(/\d{4}|\d{1,2}:\d{2}/);
  await file.click();
  await expect(page).toHaveURL(/#\/collections\/post\/.*hello-world/);
});

test('Folder not found links back to the table, at 1440 and at 390', async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const folder of ['nope', 'guides/nope', 'v1.2']) {
      await page.goto(`/#/collections/post/folder/${folder}`);
      await expect(page.getByText('Folder not found.')).toBeVisible();
      await page.getByRole('link', { name: 'Back to Posts' }).click();
      await expect(page).toHaveURL(/#\/collections\/post\?max$/);
      await expect(
        page.getByRole('region', { name: 'Posts documents' })
      ).toBeVisible();
    }
  }
});
