import { type Locator, type Page, expect, test } from '@playwright/test';

const PAGE = `/#/collections/page/${encodeURIComponent('content/pages/home.mdx')}`;
const OPTION = /^Add Template/;
const LAST = /^Add Template number 10 /;
const PANEL_MAX_HEIGHT = 320;
const OPTION_ROW = 36;
const KEYBOARD_VIEWPORT_HEIGHT = 420;
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

/** Puts `button` `top` pixels below the viewport top: scrolls the form column up, or pads it above to push the button down. */
async function placeAt(button: Locator, top: number) {
  await button.scrollIntoViewIfNeeded();
  await button.evaluate((el, wanted) => {
    const scroller = el.closest('aside');
    if (!scroller) throw new Error('no scrolling form column');
    const spacer = document.createElement('div');
    spacer.style.flex = 'none';
    const gap = el.getBoundingClientRect().top - wanted;
    if (gap > 0) {
      spacer.style.height = `${gap + 1200}px`;
      scroller.append(spacer);
      scroller.scrollTop += gap;
    } else {
      spacer.style.height = `${-gap}px`;
      scroller.prepend(spacer);
      scroller.scrollTop = 0;
    }
  }, top);
  expect((await boxOf(button)).y).toBeCloseTo(top, -1);
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

      test('the results stay visible and usable when the viewport shrinks to keyboard size while the panel is open', async ({
        page,
      }) => {
        const panel = await openPicker(page, trigger);
        await page.setViewportSize({
          width: viewport.width,
          height: KEYBOARD_VIEWPORT_HEIGHT,
        });
        await settled(panel);
        const results = panel.locator('[data-slot=block-picker-results]');
        expect((await boxOf(results)).height).toBeGreaterThan(OPTION_ROW);
        const first = panel.getByRole('button', { name: OPTION }).first();
        expect(await inside(first, results)).toBe(true);
        const hit = await first.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return el.contains(
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
          );
        });
        expect(hit).toBe(true);
        const last = panel.getByRole('button', { name: LAST });
        const box = await boxOf(panel);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height - 30);
        await page.mouse.wheel(0, 5000);
        await expect.poll(() => inside(last, results)).toBe(true);
        await last.click();
        await expect(panel).toBeHidden();
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

/**
 * A phone's on-screen keyboard shrinks the visual viewport and leaves the
 * layout viewport alone. This test fakes exactly that: the page keeps its
 * 844px layout while `visualViewport` reports a shorter height.
 */
test.describe('the keyboard shrinks only the visual viewport at 390px', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const TRIGGER_TOP = 200;

  for (const { look, trigger } of looks) {
    for (const when of [
      'while the panel is open',
      'before it opens',
    ] as const) {
      test(`${look} look, shrunk ${when}: title, search and results stay on screen`, async ({
        page,
      }) => {
        await page.addInitScript(() => {
          const fake = Object.assign(new EventTarget(), {
            width: window.innerWidth,
            height: window.innerHeight,
            offsetLeft: 0,
            offsetTop: 0,
            pageLeft: 0,
            pageTop: 0,
            scale: 1,
          });
          Object.defineProperty(window, 'visualViewport', { get: () => fake });
          Object.defineProperty(window, '__shrinkVisualViewport', {
            value: (height: number) => {
              fake.height = height;
              fake.dispatchEvent(new Event('resize'));
            },
          });
        });
        await page.goto(PAGE);
        const button = page
          .getByRole('button', { name: 'Add a block' })
          .nth(trigger);
        await placeAt(button, TRIGGER_TOP);
        const shrink = () =>
          page.evaluate((height) => {
            const keyboard = Reflect.get(window, '__shrinkVisualViewport');
            if (typeof keyboard !== 'function')
              throw new Error('no fake keyboard');
            keyboard(height);
          }, KEYBOARD_VIEWPORT_HEIGHT);
        const panel = page.getByRole('dialog', { name: 'Choose a block' });
        if (when === 'before it opens') await shrink();
        await button.click();
        await expect(panel).toBeVisible();
        await settled(panel);
        if (when === 'while the panel is open') await shrink();
        await settled(panel);

        const onScreen = async (locator: Locator) => {
          const box = await boxOf(locator);
          return (
            box.y >= -0.5 &&
            box.y + box.height <= KEYBOARD_VIEWPORT_HEIGHT + 0.5
          );
        };
        const results = panel.locator('[data-slot=block-picker-results]');
        expect(await onScreen(panel)).toBe(true);
        expect(await onScreen(panel.getByText('Choose a block'))).toBe(true);
        expect(
          await onScreen(
            panel.getByRole('searchbox', { name: 'Search blocks' })
          )
        ).toBe(true);
        expect((await boxOf(results)).height).toBeGreaterThan(OPTION_ROW);
        expect(
          await onScreen(panel.getByRole('button', { name: OPTION }).first())
        ).toBe(true);
        if (when === 'before it opens') {
          await expect(panel).toHaveAttribute('data-side', 'top');
        }
      });
    }
  }
});

test.describe('the layout viewport is very short at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const SHORT_VIEWPORT_HEIGHT = 300;

  for (const { look, trigger } of looks) {
    test(`${look} look: the panel stays on screen with room for results`, async ({
      page,
    }) => {
      await page.goto(PAGE);
      const button = page
        .getByRole('button', { name: 'Add a block' })
        .nth(trigger);
      await placeAt(button, 150);
      await button.click();
      const panel = page.getByRole('dialog', { name: 'Choose a block' });
      await expect(panel).toBeVisible();
      await settled(panel);
      await page.setViewportSize({
        width: 390,
        height: SHORT_VIEWPORT_HEIGHT,
      });
      await settled(panel);
      const box = await boxOf(panel);
      expect(box.y).toBeGreaterThanOrEqual(-0.5);
      expect(box.y + box.height).toBeLessThanOrEqual(
        SHORT_VIEWPORT_HEIGHT + 0.5
      );
      const search = panel.getByRole('searchbox', { name: 'Search blocks' });
      expect((await boxOf(search)).y).toBeGreaterThanOrEqual(0);
      const results = panel.locator('[data-slot=block-picker-results]');
      expect((await boxOf(results)).height).toBeGreaterThan(2 * OPTION_ROW);
    });
  }
});

test.describe('the keyboard-sized visual viewport at 390px, the button anywhere on the screen', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const BUTTON_TOPS = [60, 140, 220, 300, 380, 460, 540, 620, 700, 780];

  for (const { look, trigger } of looks) {
    test(`${look} look: the panel fits the visible area and shows results at every button position`, async ({
      page,
    }) => {
      await page.addInitScript(() => {
        const fake = Object.assign(new EventTarget(), {
          width: window.innerWidth,
          height: window.innerHeight,
          offsetLeft: 0,
          offsetTop: 0,
          pageLeft: 0,
          pageTop: 0,
          scale: 1,
        });
        Object.defineProperty(window, 'visualViewport', { get: () => fake });
        Object.defineProperty(window, '__setKeyboard', {
          value: (height: number) => {
            fake.height = height;
            fake.dispatchEvent(new Event('resize'));
          },
        });
      });
      const misfits: string[] = [];
      for (const top of BUTTON_TOPS) {
        await page.goto('about:blank');
        await page.goto(PAGE);
        await page.evaluate((height) => {
          const keyboard = Reflect.get(window, '__setKeyboard');
          if (typeof keyboard !== 'function')
            throw new Error('no fake keyboard');
          keyboard(height);
        }, KEYBOARD_VIEWPORT_HEIGHT);
        const button = page
          .getByRole('button', { name: 'Add a block' })
          .nth(trigger);
        await placeAt(button, top);
        await button.click();
        const panel = page.getByRole('dialog', { name: 'Choose a block' });
        await expect(panel).toBeVisible();
        await settled(panel);
        const box = await boxOf(panel);
        const title = await boxOf(panel.getByText('Choose a block'));
        const search = await boxOf(
          panel.getByRole('searchbox', { name: 'Search blocks' })
        );
        const results = await boxOf(
          panel.locator('[data-slot=block-picker-results]')
        );
        const fits =
          box.y >= -0.5 &&
          box.y + box.height <= KEYBOARD_VIEWPORT_HEIGHT + 0.5 &&
          title.y >= 0 &&
          search.y + search.height <= KEYBOARD_VIEWPORT_HEIGHT &&
          results.height >= 2 * OPTION_ROW;
        if (!fits) {
          misfits.push(
            `button at ${top}: panel ${Math.round(box.y)}..${Math.round(box.y + box.height)}, results ${Math.round(results.height)}px`
          );
        }
      }
      expect(misfits).toEqual([]);
    });
  }
});
