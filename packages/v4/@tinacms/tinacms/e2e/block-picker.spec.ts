import { type Locator, type Page, expect, test } from '@playwright/test';

const PAGE = `/#/collections/page/${encodeURIComponent('content/pages/home.mdx')}`;
const LAST = /^Add Template number 10 /;

const looks = [
  { look: 'visual', trigger: 0 },
  { look: 'plain', trigger: 1 },
] as const;
const viewports = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

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

const inside = async (inner: Locator, outer: Locator) => {
  const [a, b] = await Promise.all([inner.boundingBox(), outer.boundingBox()]);
  if (!a || !b) return false;
  return (
    a.y >= b.y - 0.5 &&
    a.y + a.height <= b.y + b.height + 0.5 &&
    a.x >= b.x - 0.5 &&
    a.x + a.width <= b.x + b.width + 0.5
  );
};

for (const viewport of viewports) {
  for (const { look, trigger } of looks) {
    test.describe(`${look} look at ${viewport.width}px`, () => {
      test.use({ viewport, hasTouch: viewport.width < 600 });

      test('scrolling inside the panel reaches the last option, and clicking it adds the block', async ({
        page,
      }) => {
        const panel = await openPicker(page, trigger);
        const last = panel.getByRole('button', { name: LAST });
        const search = panel.getByRole('searchbox', { name: 'Search blocks' });

        const cutOff = await panel
          .getByRole('button', { name: /^Add Template/ })
          .evaluateAll(
            (buttons) =>
              buttons.filter((b) => {
                const label = b.querySelector('span:last-child');
                return label ? label.scrollWidth > label.clientWidth : false;
              }).length
          );
        expect(cutOff).toBe(0);
        expect(await inside(last, panel)).toBe(false);
        const box = await panel.boundingBox();
        if (!box) throw new Error('panel has no box');
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

      test('keyboard focus on the last option keeps the search box in the panel and the panel still', async ({
        page,
      }) => {
        const panel = await openPicker(page, trigger);
        const search = panel.getByRole('searchbox', { name: 'Search blocks' });
        const before = await panel.boundingBox();
        await panel
          .getByRole('button', { name: LAST })
          .evaluate((el) => el.focus());
        await expect(panel.getByRole('button', { name: LAST })).toBeFocused();
        expect(await inside(search, panel)).toBe(true);
        expect(await panel.evaluate((el) => el.scrollTop)).toBe(0);
        await settled(panel);
        const after = await panel.boundingBox();
        expect(after?.y).toBeCloseTo(before?.y ?? -1, 0);
        expect(after?.height).toBeCloseTo(before?.height ?? -1, 0);
      });

      test('the results leave room for the focus ring around the first and last options', async ({
        page,
      }) => {
        const panel = await openPicker(page, trigger);
        const first = panel
          .getByRole('button', { name: /^Add Template/ })
          .first();
        await first.focus();
        const room = await first.evaluate((el) => {
          const results = el.closest('.overflow-y-auto');
          if (!results) throw new Error('no scroll region');
          const a = el.getBoundingClientRect();
          const b = results.getBoundingClientRect();
          return {
            left: a.left - b.left,
            right: b.right - a.right,
            top: a.top - b.top,
          };
        });
        expect(room.left).toBeGreaterThanOrEqual(3);
        expect(room.right).toBeGreaterThanOrEqual(3);
        expect(room.top).toBeGreaterThanOrEqual(3);
      });

      test('the panel keeps its top and height while a search narrows the list', async ({
        page,
      }) => {
        const panel = await openPicker(page, trigger);
        const search = panel.getByRole('searchbox', { name: 'Search blocks' });
        const before = await panel.boundingBox();
        await search.fill('Template number 10');
        await expect(panel.getByRole('button', { name: LAST })).toBeVisible();
        await settled(panel);
        const after = await panel.boundingBox();
        expect(after?.y).toBeCloseTo(before?.y ?? -1, 0);
        expect(after?.height).toBeCloseTo(before?.height ?? -1, 0);
      });
    });
  }
}
