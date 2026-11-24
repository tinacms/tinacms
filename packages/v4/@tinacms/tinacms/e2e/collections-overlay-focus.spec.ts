import { type Page, expect, test } from '@playwright/test';

const HELLO = 'content/posts/hello-world.mdx';
const previewUrl = (path: string) =>
  `/?preview=${encodeURIComponent(`/declared.html?post=${path}`)}#/collections/post/${encodeURIComponent(path)}`;

const open = async (
  page: Page,
  size: { width: number; height: number },
  path = HELLO
) => {
  await page.setViewportSize(size);
  await page.goto(previewUrl(path));
  await expect(page.locator('#title')).toBeVisible({ timeout: 30_000 });
};

const currentEntry = (page: Page) =>
  page
    .getByRole('complementary', { name: 'Navigator' })
    .locator('[aria-current=page]');

const TABLET = { width: 768, height: 1024 };
const PHONE = { width: 390, height: 844 };

test('a click on Collections in the side nav puts focus on the current document entry', async ({
  page,
}) => {
  await open(page, TABLET);
  await page.getByRole('button', { name: 'Open side nav' }).click();
  await page.locator('[data-rail-row][aria-label="Collections"]').click();
  await expect(currentEntry(page)).toBeFocused();
});

test.describe('with a finger', () => {
  test.use({ hasTouch: true });

  test('a tap on Collections in the side nav puts focus on the current document entry', async ({
    page,
  }) => {
    await open(page, PHONE);
    await page.getByRole('button', { name: 'Open side nav' }).tap();
    await page.locator('[data-rail-row][aria-label="Collections"]').tap();
    await expect(currentEntry(page)).toBeFocused();
  });
});

test('the keyboard opens Collections with focus on the current document entry', async ({
  page,
}) => {
  await open(page, TABLET);
  await page.getByRole('button', { name: 'Open side nav' }).focus();
  await page.keyboard.press('Enter');
  await page.locator('[data-rail-row][aria-label="Collections"]').focus();
  await page.keyboard.press('Enter');
  await expect(currentEntry(page)).toBeFocused();
});
