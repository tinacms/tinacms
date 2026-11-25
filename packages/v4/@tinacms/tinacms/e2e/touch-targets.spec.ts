import { type Page, expect, test } from '@playwright/test';

const HELLO = 'content/posts/hello-world.mdx';
const url = `/?preview=${encodeURIComponent(`/declared.html?post=${HELLO}`)}#/collections/post/${encodeURIComponent(HELLO)}`;

const open = async (page: Page, width: number, height: number) => {
  await page.setViewportSize({ width, height });
  await page.goto(url);
  await expect(page.locator('#title')).toBeVisible({ timeout: 30_000 });
};

// Layout height: a menu draws at 95% scale while it opens, which shrinks its bounding box.
const heightOf = (locator: ReturnType<Page['locator']>) =>
  locator.evaluate((element) => (element as HTMLElement).offsetHeight);

for (const [width, height] of [
  [390, 844],
  [1440, 900],
] as const) {
  test.describe(`at ${width}px`, () => {
    test.describe('with a finger', () => {
      test.use({ hasTouch: true });

      test('the Discard unsaved edits item and the Add a block button are at least 40px tall', async ({
        page,
      }) => {
        await open(page, width, height);
        await page.locator('#title').fill('Edited');
        await page.locator('[aria-label="Document actions"]').click();
        const discard = page.getByRole('menuitem', {
          name: 'Discard unsaved edits',
        });
        expect(await heightOf(discard)).toBeGreaterThanOrEqual(40);
        await page.keyboard.press('Escape');
        const add = page.getByRole('button', { name: 'Add a block' });
        await add.scrollIntoViewIfNeeded();
        expect(await heightOf(add)).toBeGreaterThanOrEqual(40);
      });
    });

    test('without a finger the Add a block button keeps its mouse height', async ({
      page,
    }) => {
      await open(page, width, height);
      const add = page.getByRole('button', { name: 'Add a block' });
      await add.scrollIntoViewIfNeeded();
      expect(await heightOf(add)).toBeLessThan(40);
    });
  });
}
