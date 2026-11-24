import { type Page, expect, test } from '@playwright/test';
import { formScroller } from './form-column';

const HELLO = 'content/posts/hello-world.mdx';
const POST_01 =
  '/branches.html?docs=1#/collections/post/content%2Fposts%2Fpost-01.mdx';
const PHONE = { width: 390, height: 844 };
const TABLET = { width: 768, height: 1024 };
const WIDE_TABLET = { width: 1024, height: 600 };
const DESKTOP = { width: 1440, height: 900 };

const documentHash = (flag = '') =>
  `/collections/post/${encodeURIComponent(HELLO)}${flag}`;
const adminUrl = (hash: string, preview = `/declared.html?post=${HELLO}`) =>
  `/?preview=${encodeURIComponent(preview)}#${hash}`;

const frame = (page: Page) => page.frameLocator('iframe[title="Preview"]');
const iframe = (page: Page) => page.locator('iframe[title="Preview"]');
const title = (page: Page) => page.locator('#title');
const form = (page: Page) =>
  page.getByRole('complementary', { name: 'Document form' });
const navigator = (page: Page) =>
  page.getByRole('complementary', { name: 'Navigator' });
const toolbar = (page: Page) =>
  page.getByRole('group', { name: 'Preview toolbar' });
const viewSwitch = (page: Page) =>
  page.getByRole('group', { name: 'View', exact: true });
const rail = (page: Page, name: string) =>
  page.locator(`[data-rail-row][aria-label="${name}"]`);

const open = async (
  page: Page,
  size: { width: number; height: number },
  hash = documentHash()
) => {
  await page.setViewportSize(size);
  await page.goto(adminUrl(hash));
  await expect(frame(page).getByTestId('post-title')).toBeAttached({
    timeout: 30_000,
  });
  await expect(title(page)).toBeAttached();
};

/** Presses a rail entry, opening the side nav first where it is a sheet. */
const pressRail = async (page: Page, name: string) => {
  const toggle = page.getByRole('button', { name: 'Open side nav' });
  if (await toggle.isVisible()) await toggle.click();
  await rail(page, name).click();
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

const width = async (locator: ReturnType<Page['locator']>) =>
  (await locator.boundingBox())?.width;

const breakpoint = (page: Page) =>
  page.evaluate(() =>
    document.querySelector('[data-breakpoint]')?.getAttribute('data-breakpoint')
  );

const setStored = (page: Page, key: string, value: string) =>
  page.evaluate(([k, v]) => window.localStorage.setItem(k, v), [key, value]);
const getStored = (page: Page, key: string) =>
  page.evaluate((k) => window.localStorage.getItem(k), key);

test.describe('AC2 breakpoints', () => {
  for (const [w, expected] of [
    [767, 'phone'],
    [768, 'tablet'],
    [1279, 'tablet'],
    [1280, 'desktop'],
  ] as const) {
    test(`AC2: ${w}px is ${expected}, on first load and after a resize`, async ({
      page,
    }) => {
      await open(page, { width: w, height: 900 });
      expect(await breakpoint(page)).toBe(expected);
      const other = w < 1000 ? DESKTOP : PHONE;
      await page.setViewportSize(other);
      await page.setViewportSize({ width: w, height: 900 });
      await expect.poll(() => breakpoint(page)).toBe(expected);
    });
  }

  test('AC2: the first paint at 390px never shows desktop', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const seen: string[] = [];
      (window as unknown as { __bp: string[] }).__bp = seen;
      const record = () => {
        const value = document
          .querySelector('[data-breakpoint]')
          ?.getAttribute('data-breakpoint');
        if (value) seen.push(value);
      };
      new MutationObserver(record).observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-breakpoint'],
      });
    });
    await open(page, PHONE);
    const seen = await page.evaluate(
      () => (window as unknown as { __bp: string[] }).__bp
    );
    expect(seen.length).toBeGreaterThan(0);
    expect(new Set(seen)).toEqual(new Set(['phone']));
  });
});

test.describe('AC12 column widths', () => {
  test('AC12: a stored tablet width of 9999 opens at 480px and "abc" at 360px', async ({
    page,
  }) => {
    await open(page, TABLET);
    for (const [stored, expected] of [
      ['9999', 480],
      ['abc', 360],
    ] as const) {
      await setStored(page, 'tina-form-column-width-tablet', stored);
      await page.reload();
      await expect(title(page)).toBeVisible();
      expect(await width(form(page))).toBe(expected);
    }
  });

  test('AC12: a stored overlay width of 9999 opens at 480px and "abc" at 440px', async ({
    page,
  }) => {
    await open(page, WIDE_TABLET);
    for (const [stored, expected] of [
      ['9999', 480],
      ['abc', 440],
    ] as const) {
      await setStored(page, 'tina-navigator-column-width', stored);
      await page.reload();
      await expect(title(page)).toBeAttached();
      await pressRail(page, 'Collections');
      await expect(navigator(page)).toBeVisible();
      expect(await width(navigator(page))).toBe(expected);
    }
  });

  test('AC12: a tablet width survives a reload and leaves the desktop width alone, and the reverse', async ({
    page,
  }) => {
    await open(page, TABLET);
    const handle = page.getByRole('separator', {
      name: 'Resize the form column',
    });
    await handle.focus();
    await page.keyboard.press('ArrowRight');
    const tablet = await width(form(page));
    expect(tablet).toBe(376);
    await page.reload();
    await expect(title(page)).toBeVisible();
    expect(await width(form(page))).toBe(376);

    await page.setViewportSize(DESKTOP);
    await expect.poll(() => width(form(page))).toBe(352);
    expect(await getStored(page, 'tina-form-column-width')).toBe('352');

    await handle.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => width(form(page))).toBe(368);
    await page.setViewportSize(TABLET);
    await expect.poll(() => width(form(page))).toBe(376);
    expect(await getStored(page, 'tina-form-column-width')).toBe('368');
  });
});

test.describe('AC13 Collections over a document', () => {
  test('AC13: opens a 440px column beside the preview, moves stay local, Close returns to the form with edit, scroll and focus kept', async ({
    page,
  }) => {
    await open(page, WIDE_TABLET);
    const loads = await countLoads(page);
    await title(page).fill('Edited before Collections');
    const scroller = formScroller(page);
    const scrollable = await scroller.evaluate(
      (node) => node.scrollHeight > node.clientHeight
    );
    expect(scrollable).toBe(true);
    await scroller.evaluate((node) => {
      node.scrollTop = 120;
    });
    const scrolled = await scroller.evaluate((node) => node.scrollTop);
    expect(scrolled).toBeGreaterThan(0);
    await title(page).focus();

    await pressRail(page, 'Collections');
    await expect(page).toHaveURL(
      new RegExp(
        `#${documentHash().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?nav$`
      )
    );
    await expect(navigator(page)).toBeVisible();
    expect(await width(navigator(page))).toBe(440);
    await expect(iframe(page)).toBeVisible();
    const nav = await navigator(page).boundingBox();
    const preview = await iframe(page).boundingBox();
    expect(nav && preview && preview.x).toBeGreaterThanOrEqual(
      (nav?.x ?? 0) + (nav?.width ?? 0) - 1
    );
    expect(preview?.width).toBeGreaterThan(100);
    await expect(form(page)).toBeHidden();
    expect(
      await navigator(page).evaluate((node) =>
        node.contains(document.activeElement)
      )
    ).toBe(true);

    const stillOnDocument = async () => {
      await expect(page).toHaveURL(
        /collections\/post\/.*hello-world\.mdx\?nav$/
      );
      await expect(title(page)).toHaveValue('Edited before Collections');
    };
    await navigator(page).getByRole('button', { name: 'Pages' }).click();
    await stillOnDocument();
    await navigator(page).getByRole('button', { name: 'Posts' }).click();
    await navigator(page).getByRole('button', { name: 'guides' }).click();
    await stillOnDocument();
    await navigator(page)
      .getByRole('button', { name: 'Collections menu' })
      .click();
    await page.getByRole('menuitem', { name: 'Show unsaved only' }).click();
    await stillOnDocument();
    await expect(navigator(page)).toBeVisible();

    await navigator(page).getByRole('button', { name: 'Close' }).click();
    await expect(page).not.toHaveURL(/\?nav/);
    await expect(form(page)).toBeVisible();
    await expect(iframe(page)).toBeVisible();
    await expect(title(page)).toHaveValue('Edited before Collections');
    await expect(title(page)).toBeFocused();
    expect(await scroller.evaluate((node) => node.scrollTop)).toBe(scrolled);
    expect(await loads()).toBe(0);
  });

  test('AC13: browser Back returns to the form and the preview with the edit and scroll kept', async ({
    page,
  }) => {
    await open(page, WIDE_TABLET);
    const loads = await countLoads(page);
    await title(page).fill('Edited before Back');
    const scroller = formScroller(page);
    await scroller.evaluate((node) => {
      node.scrollTop = 80;
    });
    const scrolled = await scroller.evaluate((node) => node.scrollTop);
    expect(scrolled).toBeGreaterThan(0);
    await pressRail(page, 'Collections');
    await expect(navigator(page)).toBeVisible();
    await page.goBack();
    await expect(navigator(page)).toBeHidden();
    await expect(page).not.toHaveURL(/\?nav/);
    await expect(iframe(page)).toBeVisible();
    await expect(title(page)).toHaveValue('Edited before Back');
    expect(await scroller.evaluate((node) => node.scrollTop)).toBe(scrolled);
    expect(await loads()).toBe(0);
  });

  test('AC13: the handle drags the column between 320px and 480px', async ({
    page,
  }) => {
    await open(page, WIDE_TABLET);
    await pressRail(page, 'Collections');
    await expect(navigator(page)).toBeVisible();
    const handle = page.getByRole('separator', {
      name: 'Resize the Collections column',
    });
    await expect(handle).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Content' })
    ).toBeHidden();
    await expect.poll(() => width(navigator(page))).toBe(440);
    const drag = async (by: number) => {
      const box = await handle.boundingBox();
      if (!box) throw new Error('no handle');
      await page.mouse.move(box.x + 4, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + 4 + by, box.y + 100, { steps: 5 });
      await page.mouse.up();
    };
    await drag(100);
    await expect.poll(() => width(navigator(page))).toBe(480);
    await drag(-200);
    await expect.poll(() => width(navigator(page))).toBe(320);
  });

  test('AC13: Maximise opens the collection table', async ({ page }) => {
    await open(page, WIDE_TABLET);
    await pressRail(page, 'Collections');
    await navigator(page).getByRole('button', { name: 'Maximise' }).click();
    await expect(page).toHaveURL(/#\/collections\/post\?max$/);
  });

  test('AC13: picking another document opens it', async ({ page }) => {
    await open(page, WIDE_TABLET);
    await pressRail(page, 'Collections');
    await navigator(page)
      .getByRole('button', { name: 'second-post.mdx' })
      .click();
    await expect(page).toHaveURL(/second-post\.mdx$/);
    await expect(title(page)).toBeVisible();
  });

  test('AC13: from Home, Collections opens #/collections and Close goes Home', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE_TABLET);
    await page.goto(adminUrl('/', '/plain.html'));
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
    await pressRail(page, 'Collections');
    await expect(page).toHaveURL(/#\/collections$/);
    await expect(navigator(page)).toBeVisible();
    await navigator(page).getByRole('button', { name: 'Close' }).click();
    await expect(page).toHaveURL(/#\/(screens\/home)?$/);
  });
});

test.describe('AC14 Media', () => {
  test('AC14: on a tablet Media has Close and no Maximise, and Close keeps the edit', async ({
    page,
  }) => {
    await open(page, TABLET);
    await title(page).fill('Kept through Media');
    await pressRail(page, 'Media');
    const pane = page.getByRole('complementary', { name: 'Media' });
    await expect(pane).toBeVisible();
    await expect(pane.getByRole('button', { name: 'Maximise' })).toHaveCount(0);
    const box = await pane.boundingBox();
    expect(box?.width).toBe(TABLET.width);
    await pane.getByRole('button', { name: 'Close' }).click();
    await expect(pane).toBeHidden();
    await expect(title(page)).toHaveValue('Kept through Media');
  });

  test('AC14: at desktop the Media pane has Maximise as before', async ({
    page,
  }) => {
    await open(page, DESKTOP);
    await pressRail(page, 'Media');
    const pane = page.getByRole('complementary', { name: 'Media' });
    await expect(pane.getByRole('button', { name: 'Maximise' })).toBeVisible();
  });
});

test.describe('AC15 AC16 AC43 one view on a tablet', () => {
  test('AC15: Maximise preview closes an open Collections column and shows the preview with Restore preview', async ({
    page,
  }) => {
    await open(page, WIDE_TABLET);
    await pressRail(page, 'Collections');
    await expect(navigator(page)).toBeVisible();
    await toolbar(page)
      .getByRole('button', { name: 'Maximise preview' })
      .click();
    await expect(navigator(page)).toBeHidden();
    await expect(page).not.toHaveURL(/\?nav/);
    await expect(iframe(page)).toBeVisible();
    await expect(title(page)).toBeHidden();
    await expect(
      toolbar(page).getByRole('button', { name: 'Restore preview' })
    ).toBeVisible();
  });

  test('AC15 AC16: Maximise form shows the View switch, Restore form and Restore preview each return to the split at the same width with the scroll kept', async ({
    page,
  }) => {
    await open(page, WIDE_TABLET);
    await expect(viewSwitch(page)).toHaveCount(0);
    const before = await width(form(page));
    const scroller = formScroller(page);
    await scroller.evaluate((node) => {
      node.scrollTop = 90;
    });
    const scrolled = await scroller.evaluate((node) => node.scrollTop);
    expect(scrolled).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'Maximise form' }).click();
    await expect(viewSwitch(page)).toBeVisible();
    await expect(iframe(page)).toBeHidden();
    await page.getByRole('button', { name: 'Restore form' }).click();
    await expect(iframe(page)).toBeVisible();
    expect(await width(form(page))).toBe(before);
    expect(await scroller.evaluate((node) => node.scrollTop)).toBe(scrolled);

    await page.getByRole('button', { name: 'Maximise form' }).click();
    await viewSwitch(page).getByRole('button', { name: 'Preview' }).click();
    await expect(iframe(page)).toBeVisible();
    await expect(title(page)).toBeHidden();
    await toolbar(page)
      .getByRole('button', { name: 'Restore preview' })
      .click();
    await expect(viewSwitch(page)).toHaveCount(0);
    await expect(title(page)).toBeVisible();
    await expect(iframe(page)).toBeVisible();
    expect(await width(form(page))).toBe(before);
    expect(await scroller.evaluate((node) => node.scrollTop)).toBe(scrolled);
  });

  test('AC15: Escape restores the split and focuses Maximise form', async ({
    page,
  }) => {
    await open(page, WIDE_TABLET);
    await toolbar(page)
      .getByRole('button', { name: 'Maximise preview' })
      .click();
    await expect(title(page)).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(title(page)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Maximise form' })
    ).toBeFocused();
  });

  test('AC15 AC43: no form Maximise at desktop or phone, and desktop keeps Expand preview and Collapse preview', async ({
    page,
  }) => {
    await open(page, DESKTOP);
    await expect(page.getByRole('button', { name: /^Maximise/ })).toHaveCount(
      0
    );
    await toolbar(page).getByRole('button', { name: 'Expand preview' }).click();
    await expect(
      toolbar(page).getByRole('button', { name: 'Collapse preview' })
    ).toBeVisible();
    await expect(
      toolbar(page).getByRole('button', {
        name: /^(Expand|Collapse|Maximise|Restore) preview$/,
      })
    ).toHaveCount(1);
    await page.setViewportSize(PHONE);
    await expect(page.getByRole('button', { name: /^Maximise/ })).toHaveCount(
      0
    );
    await expect(page.getByRole('button', { name: /^Restore/ })).toHaveCount(0);
  });

  test('AC43: at tablet the toolbar button is Maximise preview and then Restore preview, at desktop Expand preview', async ({
    page,
  }) => {
    await open(page, WIDE_TABLET);
    const button = (name: string) =>
      toolbar(page).getByRole('button', { name });
    await expect(button('Maximise preview')).toBeVisible();
    await expect(button('Expand preview')).toHaveCount(0);
    await button('Maximise preview').click();
    await expect(button('Restore preview')).toBeVisible();
    await page.setViewportSize(DESKTOP);
    await expect(button('Expand preview')).toBeVisible();
  });
});

test.describe('AC40 crossing breakpoints', () => {
  test('AC40: 390 to 1024 to 1440 to 390 keeps the edit, the focused field value and the preview frame', async ({
    page,
  }) => {
    await open(page, PHONE);
    const loads = await countLoads(page);
    await title(page).fill('Across every size');
    await title(page).focus();
    for (const size of [{ width: 1024, height: 800 }, DESKTOP, PHONE]) {
      await page.setViewportSize(size);
      await expect(title(page)).toBeAttached();
      await expect(title(page)).toHaveValue('Across every size');
    }
    expect(await loads()).toBe(0);
  });

  test('AC40: an open branch switcher stays open across sizes', async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    await page.goto(POST_01);
    const titleField = page.locator('#title');
    await titleField.fill('Edited with the switcher open');
    await page.getByRole('button', { name: /^Branch: / }).click();
    const search = page.getByRole('searchbox');
    await expect(search).toBeVisible();
    for (const size of [{ width: 1024, height: 800 }, DESKTOP, PHONE]) {
      await page.setViewportSize(size);
      await expect(page.getByRole('searchbox')).toBeVisible();
    }
    await expect(titleField).toHaveValue('Edited with the switcher open');
  });
});

test('AC41: on a tablet a plugin screen fills the width between the bars and Close goes Home', async ({
  page,
}) => {
  await page.setViewportSize(TABLET);
  await page.goto('/branches.html?docs=1&home=long#/screens/plain');
  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { name: 'Plain' })).toBeVisible();
  const box = await main.boundingBox();
  expect(box?.x).toBe(0);
  expect(box?.width).toBe(TABLET.width);
  await main.getByRole('button', { name: 'Close' }).click();
  await expect(page).toHaveURL(/#\/(screens\/home)?$/);
  await expect(main.getByRole('heading', { name: 'Plain' })).toBeHidden();
});

test.describe('AC45 the ?nav flag', () => {
  test('AC45: resizing 768 to 1440 to 390 keeps the navigator in place of the form with the edit and the preview kept', async ({
    page,
  }) => {
    await open(page, TABLET);
    const loads = await countLoads(page);
    await title(page).fill('Kept under the flag');
    await pressRail(page, 'Collections');
    await expect(navigator(page)).toBeVisible();
    for (const size of [DESKTOP, PHONE]) {
      await page.setViewportSize(size);
      await expect(navigator(page)).toBeVisible();
      await expect(page).toHaveURL(/\?nav$/);
      await expect(form(page)).toBeHidden();
      await expect(title(page)).toHaveValue('Kept under the flag');
    }
    expect(await loads()).toBe(0);
  });

  test('AC45: at 1440 the rail Collections entry from a document opens #/collections', async ({
    page,
  }) => {
    await open(page, DESKTOP);
    await pressRail(page, 'Collections');
    await expect(page).toHaveURL(/#\/collections$/);
  });

  test('AC45: pressing Collections with the flag set adds no history entry', async ({
    page,
  }) => {
    await open(page, WIDE_TABLET);
    await pressRail(page, 'Collections');
    await expect(page).toHaveURL(/\?nav$/);
    const before = await page.evaluate(() => window.history.length);
    await pressRail(page, 'Collections');
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.history.length)).toBe(before);
    await expect(page).toHaveURL(/\?nav$/);
    await expect(navigator(page)).toBeVisible();
  });

  test('AC45: leaving the document with edits from the overlay, the toast Open lands on the form, not the navigator', async ({
    page,
  }) => {
    await open(page, WIDE_TABLET);
    await title(page).fill('Edited then left');
    await pressRail(page, 'Collections');
    await navigator(page)
      .getByRole('button', { name: 'second-post.mdx' })
      .click();
    await expect(page).toHaveURL(/second-post\.mdx$/);
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await expect(page).toHaveURL(/hello-world\.mdx$/);
    await expect(page).not.toHaveURL(/\?nav/);
    await expect(navigator(page)).toBeHidden();
    await expect(title(page)).toBeVisible();
    await expect(title(page)).toHaveValue('Edited then left');
  });
});
