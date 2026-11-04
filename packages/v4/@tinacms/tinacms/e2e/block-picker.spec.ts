import { type Locator, type Page, expect, test } from '@playwright/test';

const PAGE = `/#/collections/page/${encodeURIComponent('content/pages/home.mdx')}`;
const OPTION = /^Add Template/;
const LAST = /^Add Template number 10 /;
const PANEL_MAX_HEIGHT = 320;
const RING = 5;

const looks = [
  { look: 'visual', trigger: 0 },
  { look: 'plain', trigger: 1 },
] as const;
const viewports = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

/** Waits out the open transition, which scales the panel for 100ms. */
async function settled(panel: Locator) {
  let last = '';
  await expect
    .poll(async () => {
      const now = JSON.stringify(await panel.boundingBox());
      const same = now === last;
      last = now;
      return same;
    })
    .toBe(true);
}

async function openPicker(page: Page, trigger: number) {
  await page.goto(PAGE);
  const button = page.getByRole('button', { name: 'Add a block' }).nth(trigger);
  await button.scrollIntoViewIfNeeded();
  await button.click();
  const panel = page.getByRole('dialog', { name: 'Choose a block' });
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('data-starting-style', '');
  await settled(panel);
  await expect(
    panel.getByRole('searchbox', { name: 'Search blocks' })
  ).toBeFocused();
  return panel;
}

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('element has no box');
  return box;
}

async function inside(inner: Locator, outer: Locator) {
  const [a, b] = [await boxOf(inner), await boxOf(outer)];
  return (
    a.y >= b.y - 0.5 &&
    a.y + a.height <= b.y + b.height + 0.5 &&
    a.x >= b.x - 0.5 &&
    a.x + a.width <= b.x + b.width + 0.5
  );
}

/** Room between an option and the edges of the scrolling results. */
const roomAround = (option: Locator) =>
  option.evaluate((el) => {
    const results = el.closest('[data-slot=block-picker-results]');
    if (!results) throw new Error('no results region');
    const a = el.getBoundingClientRect();
    const b = results.getBoundingClientRect();
    return {
      left: a.left - b.left,
      right: b.right - a.right,
      top: a.top - b.top,
      bottom: b.bottom - a.bottom,
    };
  });

/** Presses Tab from the search box, calling `visit` on each option reached. */
async function tabThrough(
  page: Page,
  panel: Locator,
  visit: (option: Locator) => Promise<void>
) {
  const last = panel.getByRole('button', { name: LAST });
  for (let step = 0; step < 14; step++) {
    await page.keyboard.press('Tab');
    const focused = panel.locator(':focus');
    await visit(focused);
    if (await last.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error('Tab never reached the last option');
}

for (const viewport of viewports) {
  for (const { look, trigger } of looks) {
    test.describe(`${look} look at ${viewport.width}px`, () => {
      test.use({ viewport, hasTouch: viewport.width < 600 });

      test('the panel stops at its cap, every name wraps, and visual tiles show their preview', async ({
        page,
      }) => {
        const panel = await openPicker(page, trigger);
        expect((await boxOf(panel)).height).toBeLessThanOrEqual(
          PANEL_MAX_HEIGHT
        );
        const cutOff = await panel
          .getByRole('button', { name: OPTION })
          .evaluateAll(
            (buttons) =>
              buttons.filter((b) => {
                const label = b.querySelector('span:last-child');
                return label ? label.scrollWidth > label.clientWidth : false;
              }).length
          );
        expect(cutOff).toBe(0);
        if (look === 'visual') {
          const preview = panel
            .getByRole('button', { name: OPTION })
            .first()
            .locator('img');
          await expect(preview).toBeVisible();
          expect(
            await preview.evaluate((img: HTMLImageElement) => img.naturalWidth)
          ).toBeGreaterThan(0);
        }
      });

      test('scrolling inside the panel reaches the last option, and clicking it adds the block', async ({
        page,
      }) => {
        const panel = await openPicker(page, trigger);
        const last = panel.getByRole('button', { name: LAST });
        const search = panel.getByRole('searchbox', { name: 'Search blocks' });

        expect(await inside(last, panel)).toBe(false);
        const box = await boxOf(panel);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height - 30);
        await page.mouse.wheel(0, 5000);
        await expect.poll(() => inside(last, panel)).toBe(true);
        expect(await inside(search, panel)).toBe(true);

        const hit = await last.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return el.contains(
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
          );
        });
        expect(hit).toBe(true);

        await last.click();
        await expect(panel).toBeHidden();
        await expect(
          page.getByText(/Template number 10 with a rather/).first()
        ).toBeVisible();
      });

      test('Tab reaches the last option with the search box in the panel and the panel still', async ({
        page,
      }) => {
        const panel = await openPicker(page, trigger);
        const search = panel.getByRole('searchbox', { name: 'Search blocks' });
        const before = await boxOf(panel);
        await tabThrough(page, panel, async () => {
          expect(await inside(search, panel)).toBe(true);
        });
        expect(await panel.evaluate((el) => el.scrollTop)).toBe(0);
        await settled(panel);
        const after = await boxOf(panel);
        expect(after.y).toBeCloseTo(before.y, 0);
        expect(after.height).toBeCloseTo(before.height, 0);
      });

      test('the panel keeps its top and height while a search narrows the list', async ({
        page,
      }) => {
        const panel = await openPicker(page, trigger);
        const before = await boxOf(panel);
        await panel
          .getByRole('searchbox', { name: 'Search blocks' })
          .fill('Template number 10');
        await expect(panel.getByRole('button', { name: LAST })).toBeVisible();
        await settled(panel);
        const after = await boxOf(panel);
        expect(after.y).toBeCloseTo(before.y, 0);
        expect(after.height).toBeCloseTo(before.height, 0);
      });

      if (look === 'visual') {
        test('every Tab stop leaves room for the focus ring on all four sides', async ({
          page,
        }) => {
          const panel = await openPicker(page, trigger);
          await tabThrough(page, panel, async (option) => {
            const room = await roomAround(option);
            expect(room.left).toBeGreaterThanOrEqual(RING);
            expect(room.right).toBeGreaterThanOrEqual(RING);
            expect(room.top).toBeGreaterThanOrEqual(RING);
            expect(room.bottom).toBeGreaterThanOrEqual(RING);
          });
          for (let step = 0; step < 14; step++) {
            await page.keyboard.press('Shift+Tab');
            const focused = panel.locator(':focus');
            if (
              await focused.evaluate(
                (el) =>
                  el.tagName !== 'BUTTON' || !el.getAttribute('aria-label')
              )
            )
              break;
            const room = await roomAround(focused);
            expect(room.top).toBeGreaterThanOrEqual(RING);
            expect(room.bottom).toBeGreaterThanOrEqual(RING);
          }
        });
      }
    });
  }
}
