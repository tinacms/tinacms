import { type Locator, type Page, expect, test } from '@playwright/test';

const MANY = `/?preview=${encodeURIComponent('/declared.html?post=content/posts/hello-world.mdx')}#/collections/manyrequired/content%2Fmanyrequired%2Ftwelve.mdx`;
const LISTS = '/#/collections/lockable/content%2Flockable%2Flists.mdx';
const LONG_POST = `/#/collections/post/${encodeURIComponent('content/posts/long-post.mdx')}`;
const P375 = { width: 375, height: 812 };

const formBar = (page: Page) => page.locator('[data-slot=form-bar]');
const resolve = (page: Page) => formBar(page).locator('[data-resolve]');

const inside = async (child: Locator, parent: Locator) => {
  await expect
    .poll(async () => (await child.boundingBox()) !== null)
    .toBe(true);
  const [c, p] = await Promise.all([child.boundingBox(), parent.boundingBox()]);
  if (!c || !p) throw new Error('not drawn');
  expect(c.x).toBeGreaterThanOrEqual(p.x - 0.5);
  expect(c.x + c.width).toBeLessThanOrEqual(p.x + p.width + 0.5);
};

const opacity = (locator: Locator) =>
  locator.evaluate((node) => Number(getComputedStyle(node).opacity));

test.describe('error counts fit the phone form bar at 375px', () => {
  test.use({ viewport: P375 });

  const open = async (page: Page, filled: number) => {
    await page.goto(MANY);
    await page.getByRole('textbox', { name: 'Note' }).fill('x');
    for (let index = 1; index <= filled; index++) {
      await page
        .getByRole('textbox', {
          name: `Field ${index} (required)`,
          exact: true,
        })
        .fill('x');
    }
  };

  const expectFits = async (page: Page, text: string) => {
    await formBar(page)
      .getByRole('button', { name: /^(Save|\d+ errors?)$/ })
      .click();
    const button = resolve(page);
    await expect(button).toHaveText(text);
    const bar = formBar(page);
    await inside(button, bar);
    await inside(bar.locator('[data-slot=segmented]'), bar);
    await inside(bar.locator('[aria-label="Document actions"]'), bar);
    const clipped = await button.evaluate((node) =>
      [node, ...node.querySelectorAll('*')].some(
        (el) => el.scrollWidth > el.clientWidth + 1
      )
    );
    expect(clipped).toBe(false);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(375);
  };

  test('3 errors', async ({ page }) => {
    await open(page, 9);
    await expectFits(page, '3 errors');
  });

  test('12 errors', async ({ page }) => {
    await open(page, 0);
    await expectFits(page, '12 errors');
  });

  test('1 error', async ({ page }) => {
    await open(page, 11);
    await expectFits(page, '1 error');
  });
});

for (const touch of [true, false]) {
  test.describe(`List card and table row reveal with${touch ? '' : 'out'} touch`, () => {
    test.use({
      hasTouch: touch,
      isMobile: touch,
      viewport: touch
        ? { width: 390, height: 844 }
        : { width: 1280, height: 900 },
    });

    test(`list card ⋯: enabled ${touch ? 'shows' : 'hides until hover or focus'}, disabled stays hidden`, async ({
      page,
    }) => {
      await page.goto(LISTS);
      const open = page
        .getByRole('group', { name: 'Open list' })
        .locator('[data-more]');
      const locked = page
        .getByRole('group', { name: 'Locked list' })
        .locator('[data-more]');
      await expect(open).toHaveCount(2);
      await expect(locked).toHaveCount(2);
      await expect(locked.first()).toBeDisabled();

      await expect.poll(() => opacity(open.first())).toBe(touch ? 1 : 0);
      expect(await opacity(locked.first())).toBe(0);

      if (!touch) {
        await open.first().scrollIntoViewIfNeeded();
        await open
          .first()
          .locator('xpath=ancestor::*[contains(@class,"group/list-card")][1]')
          .hover();
        await expect.poll(() => opacity(open.first())).toBe(1);
        await page.mouse.move(2, 2);
        await expect.poll(() => opacity(open.first())).toBe(0);
        await open.first().focus();
        await expect.poll(() => opacity(open.first())).toBe(1);

        const lockedCard = locked
          .first()
          .locator('xpath=ancestor::*[contains(@class,"group/list-card")][1]');
        await lockedCard.hover();
        expect(await opacity(locked.first())).toBe(0);
      }
    });

    test('rich-text table row handle follows the active cell, not hover or touch', async ({
      page,
    }) => {
      await page.goto(LONG_POST);
      const body = page.getByRole('textbox', { name: /^Body/ });
      const cell = body.getByText('Ada').first();
      await cell.scrollIntoViewIfNeeded();
      const handle = page.getByRole('button', { name: 'Row 2 actions' });
      await expect(handle).toHaveCount(0);
      if (touch) await cell.tap();
      else await cell.click();
      await expect(handle).toBeVisible();
      expect(await opacity(handle)).toBe(1);
    });
  });
}
