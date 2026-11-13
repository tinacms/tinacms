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
