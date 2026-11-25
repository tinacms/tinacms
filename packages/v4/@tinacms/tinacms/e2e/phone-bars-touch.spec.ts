import { type Locator, type Page, expect, test } from '@playwright/test';
import { formScroller } from './form-column';

const HELLO = 'content/posts/hello-world.mdx';
const POST_01 = 'content%2Fposts%2Fpost-01.mdx';
const LONG_BRANCH = `feature/${'a'.repeat(32)}`;

const P375 = { width: 375, height: 812 };
const P390 = { width: 390, height: 844 };
const P767 = { width: 767, height: 900 };
const TABLET = { width: 768, height: 1024 };
const WIDE_TABLET = { width: 1024, height: 768 };
const DESKTOP = { width: 1440, height: 900 };

type Size = { width: number; height: number };

const helloHash = `/collections/post/${encodeURIComponent(HELLO)}`;
const declaredUrl = (
  hash = helloHash,
  preview = `/declared.html?post=${HELLO}`
) => `/?preview=${encodeURIComponent(preview)}#${hash}`;
const branchUrl = (query = '', hash = `/collections/post/${POST_01}`) =>
  `/branches.html?docs=2&${query}#${hash}`;

const frame = (page: Page) => page.frameLocator('iframe[title="Preview"]');
const topBar = (page: Page) => page.locator('[data-slot=top-bar]');
const statusBar = (page: Page) => page.locator('[data-slot=status-bar]');
const formBar = (page: Page) => page.locator('[data-slot=form-bar]');
const viewSwitch = (page: Page) =>
  page.getByRole('group', { name: 'View', exact: true });
const title = (page: Page) => page.getByRole('textbox', { name: /^Title/ });
const saveButton = (page: Page) =>
  formBar(page).getByRole('button', {
    name: /^(Save|Save to branch|Save to new branch|\d+\+? errors?|Resolve.*)$/,
  });
const rail = (page: Page, name: string) =>
  page.locator(`[data-rail-row][aria-label="${name}"]`);

const box = async (locator: Locator) => {
  await expect
    .poll(async () => (await locator.boundingBox()) !== null)
    .toBe(true);
  const found = await locator.boundingBox();
  if (!found) throw new Error('the element has no box');
  return found;
};

const noSideways = async (page: Page) => {
  const width = page.viewportSize()?.width ?? 0;
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(width);
};

const gotoAt = async (page: Page, size: Size, url: string) => {
  await page.setViewportSize(size);
  await page.goto(url);
};

const openDeclared = async (page: Page, size: Size, hash = helloHash) => {
  await gotoAt(page, size, declaredUrl(hash));
  await expect(frame(page).getByTestId('post-title')).toBeAttached({
    timeout: 30_000,
  });
};

/** Counts load events on the preview iframe from now on. */
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

/**
 * Answers every document write from a script, so no test writes a file.
 * Each entry is the outcome of one write, in order; the last one repeats.
 */
const scriptWrites = async (
  page: Page,
  outcomes: ('ok' | 'fail')[],
  delayMs = 0
) => {
  let seen = 0;
  await page.route('**/api/tina/content', async (route) => {
    const body = route.request().postDataJSON() as {
      op?: string;
      path?: string;
      value?: unknown;
    } | null;
    if (body?.op !== 'update') return route.continue();
    const outcome = outcomes[Math.min(seen, outcomes.length - 1)];
    seen += 1;
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    if (outcome === 'fail') {
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: 'op-failed', message: 'Operation failed.' },
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ path: body.path, document: body.value }),
    });
  });
};

test.describe('AC9: the phone top bar is one 56px line', () => {
  for (const size of [P375, P390, P767]) {
    test(`at ${size.width}px with a 40-character branch and Save All naming a failure`, async ({
      page,
    }) => {
      await gotoAt(
        page,
        size,
        branchUrl(`account=1&branch=${encodeURIComponent(LONG_BRANCH)}`)
      );
      await title(page).fill('');
      const bar = page.getByRole('banner', { name: 'Top bar' });
      await bar.getByRole('button', { name: 'Save all' }).click();
      const saveAll = bar.getByRole('button', { name: /^Save all, 1 failed/ });
      await expect(saveAll).toBeVisible();

      const parts = [
        bar.getByRole('button', { name: 'Open side nav' }),
        bar.getByRole('img', { name: 'TinaCMS' }),
        bar.getByRole('button', { name: /^Branch:/ }),
        bar.getByRole('button', { name: 'Search', exact: true }),
        saveAll,
        bar.getByRole('button', { name: 'Account' }),
      ];
      const boxes = await Promise.all(parts.map(box));
      const outer = await box(bar);
      expect(outer.height).toBe(56);
      boxes.forEach((part, index) => {
        expect(part.x).toBeGreaterThanOrEqual(outer.x);
        expect(part.x + part.width).toBeLessThanOrEqual(outer.x + size.width);
        expect(part.height).toBeLessThanOrEqual(56);
        const next = boxes[index + 1];
        if (next) expect(part.x + part.width).toBeLessThanOrEqual(next.x + 0.5);
      });

      if (size.width <= 390) {
        const branchLabel = parts[2].locator('span.font-mono');
        expect(
          await branchLabel.evaluate(
            (node) => node.scrollWidth > node.clientWidth
          )
        ).toBe(true);
      }
      expect(boxes[3].width).toBeLessThanOrEqual(48);
      expect(boxes[4].width).toBeLessThanOrEqual(48);
      const text = await bar.innerText();
      expect(text).not.toContain('Acme site');
      expect(text).not.toContain('/ ');
      await expect(page.locator('[data-slot=top-bar-project]')).toBeHidden();
      await noSideways(page);
    });
  }
});

test('AC10: a tablet top bar shows the word logo, the project name and the branch', async ({
  page,
}) => {
  await gotoAt(page, P390, branchUrl('account=1'));
  const mark = await box(
    page.getByRole('banner', { name: 'Top bar' }).getByRole('img', {
      name: 'TinaCMS',
    })
  );
  for (const size of [TABLET, WIDE_TABLET]) {
    await page.setViewportSize(size);
    const bar = page.getByRole('banner', { name: 'Top bar' });
    const logoImage = bar.getByRole('img', { name: 'TinaCMS' });
    await expect(logoImage).toBeVisible();
    const logo = await box(logoImage);
    expect(logo.width).toBeGreaterThan(mark.width);
    await expect(bar.getByText('Acme site')).toBeVisible();
    await expect(bar.getByRole('button', { name: /^Branch:/ })).toContainText(
      'feature/news'
    );
    await expect(
      bar.getByRole('button', { name: 'Open side nav' })
    ).toBeVisible();
    expect((await box(bar)).height).toBe(56);
  }
});

const statusState = (page: Page) =>
  statusBar(page).locator('[data-slot=status-bar-state]');

const typeTitle = async (page: Page, text = '!') => {
  await title(page).click();
  await title(page).pressSequentially(text);
};

test.describe('AC18 and AC19: the phone form bar and its status', () => {
  test('AC18: the switch, Document actions and Save sit in both views with no Unsaved tag', async ({
    page,
  }) => {
    await gotoAt(page, P390, branchUrl());
    await typeTitle(page);
    for (const view of ['Form', 'Preview']) {
      await viewSwitch(page).getByRole('button', { name: view }).click();
      const bar = formBar(page);
      const parts = await Promise.all([
        box(viewSwitch(page)),
        box(bar.getByRole('button', { name: 'Document actions' })),
        box(saveButton(page)),
      ]);
      const outer = await box(bar);
      expect(parts[0].x + parts[0].width).toBeLessThanOrEqual(parts[1].x);
      expect(parts[1].x + parts[1].width).toBeLessThanOrEqual(parts[2].x);
      expect(
        outer.x + outer.width - (parts[2].x + parts[2].width)
      ).toBeLessThan(16);
      expect(parts[2].width).toBeGreaterThan(100);
      expect(await bar.innerText()).not.toContain('Unsaved');
      await expect(bar.getByText('Unsaved')).toBeHidden();
    }
  });

  test('AC18: Save reads "Save to branch" on a protected branch at a phone and "Save to new branch" at desktop', async ({
    page,
  }) => {
    await gotoAt(page, P390, branchUrl('protected=1'));
    await typeTitle(page);
    await expect(
      formBar(page).getByRole('button', { name: 'Save to branch' })
    ).toBeVisible();
    await page.setViewportSize(DESKTOP);
    await expect(
      formBar(page).getByRole('button', { name: 'Save to new branch' })
    ).toBeVisible();
  });

  test('AC18: Save names the errors and fits at 375px', async ({ page }) => {
    await gotoAt(
      page,
      P375,
      '/#/collections/checklist/content%2Fchecklists%2Ftwo-errors.mdx'
    );
    await page.getByRole('textbox', { name: 'Note' }).fill('x');
    await saveButton(page).click();
    const save = formBar(page).locator('[data-resolve]');
    await expect(save).toHaveText('2 errors');
    const [saveBox, barBox] = await Promise.all([
      box(save),
      box(formBar(page)),
    ]);
    expect(saveBox.x + saveBox.width).toBeLessThanOrEqual(
      barBox.x + barBox.width
    );
    expect(saveBox.x).toBeGreaterThanOrEqual(barBox.x);
    await noSideways(page);
  });

  test('AC18: tapping Save in Preview view saves, and the status goes from Saving… to Saved', async ({
    page,
  }) => {
    await scriptWrites(page, ['ok'], 800);
    await openDeclared(page, P390);
    await typeTitle(page);
    await viewSwitch(page).getByRole('button', { name: 'Preview' }).click();
    await expect(statusState(page)).toHaveText('Unsaved');
    await saveButton(page).click();
    await expect(statusState(page)).toHaveText('Saving…');
    await expect(statusState(page)).toHaveText('Saved');
    await expect(page.locator('iframe[title="Preview"]')).toBeVisible();
  });

  test('AC18: a failed save shows "Save failed" and leaves the editor in Preview view', async ({
    page,
  }) => {
    await scriptWrites(page, ['fail']);
    await openDeclared(page, P390);
    await typeTitle(page);
    await viewSwitch(page).getByRole('button', { name: 'Preview' }).click();
    await saveButton(page).click();
    await expect(statusState(page)).toHaveText('Save failed');
    await expect(
      viewSwitch(page).getByRole('button', { name: 'Preview' })
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('iframe[title="Preview"]')).toBeVisible();
    await expect(title(page)).toBeHidden();
  });

  test('AC19: Unsaved shows in both views, and Save shows its saving state in both', async ({
    page,
  }) => {
    await scriptWrites(page, ['ok'], 1200);
    await openDeclared(page, P390);
    await typeTitle(page);
    for (const view of ['Form', 'Preview']) {
      await viewSwitch(page).getByRole('button', { name: view }).click();
      await expect(statusState(page)).toHaveText('Unsaved');
    }
    await saveButton(page).click();
    await expect(saveButton(page)).toHaveAttribute('aria-disabled', 'true');
    await viewSwitch(page).getByRole('button', { name: 'Form' }).click();
    await expect(saveButton(page)).toHaveAttribute('aria-disabled', 'true');
    await expect(statusState(page)).toHaveText('Saved');
  });

  test('AC19: after a failed save and a successful retry the status shows Saved, never the failure', async ({
    page,
  }) => {
    await scriptWrites(page, ['fail', 'ok']);
    await openDeclared(page, P390);
    await typeTitle(page);
    await saveButton(page).click();
    await expect(statusState(page)).toHaveText('Save failed');
    await saveButton(page).click();
    await expect(statusState(page)).toHaveText('Saved');
    await page.waitForTimeout(500);
    await expect(statusState(page)).toHaveText('Saved');
    await expect(statusBar(page)).not.toContainText('Save failed');
  });
});

const BLOG = '/declared.html?view=blog';
const footBar = (page: Page) => page.locator('[data-slot=nothing-to-edit-bar]');

test.describe('AC20: tapping the preview on a phone', () => {
  test('an editable part switches to Form with that field focused', async ({
    page,
  }) => {
    await openDeclared(page, P390);
    await viewSwitch(page).getByRole('button', { name: 'Preview' }).click();
    await expect(title(page)).toBeHidden();
    await frame(page).getByTestId('post-title').click();
    await expect(title(page)).toBeFocused();
    await expect(
      viewSwitch(page).getByRole('button', { name: 'Form' })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('a part with no document goes to the page route, which has a foot bar and no column', async ({
    page,
  }) => {
    await openDeclared(page, P390);
    await viewSwitch(page).getByRole('button', { name: 'Preview' }).click();
    await frame(page)
      .getByRole('link', { name: 'Blog' })
      .dispatchEvent('click');
    await expect(footBar(page)).toContainText('Nothing to edit here');
    await expect(
      footBar(page).getByRole('button', { name: 'Open Collections' })
    ).toBeVisible();
    await expect(page.getByText('Nothing to edit on this page')).toHaveCount(0);
    await expect(viewSwitch(page)).toHaveCount(0);
    await expect(page.locator('iframe[title="Preview"]')).toBeVisible();
    const [bar, status] = await Promise.all([
      box(footBar(page)),
      box(statusBar(page)),
    ]);
    expect(bar.y + bar.height).toBeLessThanOrEqual(status.y + 0.5);
    await noSideways(page);
  });

  test('tapping an editable part on the page route opens that document on Form, and Open Collections opens Collections', async ({
    page,
  }) => {
    await gotoAt(page, P390, declaredUrl('/page', BLOG));
    await expect(footBar(page)).toBeVisible();
    await frame(page).getByText('Playground Blog').click();
    await expect(
      page.getByRole('heading', { name: 'site.json' })
    ).toBeVisible();
    await expect(
      viewSwitch(page).getByRole('button', { name: 'Form' })
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('textbox', { name: 'Site name' })
    ).toBeVisible();

    await gotoAt(page, P390, declaredUrl('/page', BLOG));
    await footBar(page)
      .getByRole('button', { name: 'Open Collections' })
      .click();
    await expect(page).toHaveURL(/#\/collections$/);
    await expect(
      page.getByRole('complementary', { name: 'Navigator' })
    ).toBeVisible();
  });

  for (const size of [WIDE_TABLET, TABLET, DESKTOP]) {
    test(`at ${size.width}px the page route keeps the Nothing to edit column and has no foot bar`, async ({
      page,
    }) => {
      await gotoAt(page, size, declaredUrl('/page', BLOG));
      await expect(
        page.getByText('Nothing to edit on this page')
      ).toBeVisible();
      await expect(footBar(page)).toBeHidden();
    });
  }

  test('resizing the page route 390 to 1024 to 390 swaps the bar and the column without reloading the preview', async ({
    page,
  }) => {
    await gotoAt(page, P390, declaredUrl('/page', BLOG));
    await expect(footBar(page)).toBeVisible();
    await expect(frame(page).getByTestId('blog-index-title')).toBeAttached();
    const loads = await countLoads(page);
    await page.setViewportSize(WIDE_TABLET);
    await expect(page.getByText('Nothing to edit on this page')).toBeVisible();
    await expect(footBar(page)).toBeHidden();
    await page.setViewportSize(P390);
    await expect(footBar(page)).toBeVisible();
    await expect(page.getByText('Nothing to edit on this page')).toHaveCount(0);
    expect(await loads()).toBe(0);
  });
});

/** The screen's box sits between the top bar and the status bar. */
const fillsBetweenBars = async (page: Page, screen: Locator) => {
  const [inner, top, status] = await Promise.all([
    box(screen),
    box(topBar(page)),
    box(statusBar(page)),
  ]);
  expect(inner.x).toBe(0);
  expect(inner.width).toBe(page.viewportSize()?.width);
  expect(inner.y).toBeGreaterThanOrEqual(top.y + top.height - 0.5);
  expect(inner.y).toBeLessThanOrEqual(top.y + top.height + 0.5);
  expect(inner.y + inner.height).toBeGreaterThanOrEqual(status.y - 0.5);
  expect(inner.y + inner.height).toBeLessThanOrEqual(status.y + 0.5);
};

const openRail = async (page: Page, name: string) => {
  await page.getByRole('button', { name: 'Open side nav' }).click();
  await rail(page, name).click();
};

test.describe('AC21: Collections, Media and plugin screens on a phone', () => {
  test('Collections over a document fills the screen, and Close returns to the form with edits and scroll kept and no reload', async ({
    page,
  }) => {
    await openDeclared(page, P390);
    const loads = await countLoads(page);
    await title(page).fill('Kept through Collections');
    await formScroller(page).evaluate((node) => {
      node.scrollTop = 150;
    });
    const before = await formScroller(page).evaluate((node) => node.scrollTop);
    expect(before).toBeGreaterThan(0);
    await openRail(page, 'Collections');
    const navigator = page.getByRole('complementary', { name: 'Navigator' });
    await expect(navigator).toBeVisible();
    await fillsBetweenBars(page, navigator);
    await expect(
      navigator.getByRole('button', { name: 'Close' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Maximise' })).toHaveCount(0);
    await noSideways(page);
    await navigator.getByRole('button', { name: 'Close' }).click();
    await expect(title(page)).toHaveValue('Kept through Collections');
    await expect(
      viewSwitch(page).getByRole('button', { name: 'Form' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(await formScroller(page).evaluate((node) => node.scrollTop)).toBe(
      before
    );
    expect(await loads()).toBe(0);
  });

  test('Collections opened from Home closes to Home', async ({ page }) => {
    await gotoAt(page, P390, branchUrl('', '/'));
    await openRail(page, 'Collections');
    const navigator = page.getByRole('complementary', { name: 'Navigator' });
    await expect(navigator).toBeVisible();
    await fillsBetweenBars(page, navigator);
    await navigator.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
    await expect(navigator).toBeHidden();
  });

  test('Collections opened from the page route closes to Home', async ({
    page,
  }) => {
    await gotoAt(page, P390, declaredUrl('/page', BLOG));
    await footBar(page)
      .getByRole('button', { name: 'Open Collections' })
      .click();
    const navigator = page.getByRole('complementary', { name: 'Navigator' });
    await navigator.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
  });

  test('Media fills the screen, and Close returns to the screen it opened over', async ({
    page,
  }) => {
    await openDeclared(page, P390);
    await title(page).fill('Kept through Media');
    await openRail(page, 'Media');
    const media = page.getByRole('complementary', { name: 'Media' });
    await expect(media).toBeVisible();
    await fillsBetweenBars(page, media);
    await expect(page.getByRole('button', { name: 'Maximise' })).toHaveCount(0);
    await noSideways(page);
    await media.getByRole('button', { name: 'Close' }).click();
    await expect(media).toBeHidden();
    await expect(title(page)).toHaveValue('Kept through Media');
  });

  test('a plugin screen fills the screen, and Close goes Home', async ({
    page,
  }) => {
    await gotoAt(page, P390, branchUrl('home=long', '/screens/plain'));
    const screen = page.locator('main');
    await expect(screen.getByRole('heading', { name: 'Plain' })).toBeVisible();
    await expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Maximise' })).toHaveCount(0);
    await noSideways(page);
    await screen.getByRole('button', { name: 'Close' }).click();
    await expect(page).toHaveURL(/#\/?$/);
    await expect(screen.getByRole('heading', { name: 'Plain' })).toBeHidden();
  });
});

/** Types in the title, waits for the draft to reach storage, and reloads. */
const keepEdits = async (page: Page) => {
  await typeTitle(page, '!!');
  await expect
    .poll(() =>
      page.evaluate(() =>
        Object.keys(localStorage).some((key) => key.startsWith('tina-drafts'))
      )
    )
    .toBe(true);
  await page.reload();
  await expect(statusState(page)).toHaveText('Kept in this browser');
};

test.describe('AC22 to AC24: the phone status bar', () => {
  test('AC22: at 390px it is 28px and shows the short words for Unsaved, Saving…, Saved and Save failed', async ({
    page,
  }) => {
    await scriptWrites(page, ['ok', 'fail'], 600);
    await openDeclared(page, P390);
    expect((await box(statusBar(page))).height).toBe(28);
    await typeTitle(page);
    await expect(statusState(page)).toHaveText('Unsaved');
    await saveButton(page).click();
    await expect(statusState(page)).toHaveText('Saving…');
    expect((await box(statusBar(page))).height).toBe(28);
    await expect(statusState(page)).toHaveText('Saved');
    await typeTitle(page);
    await saveButton(page).click();
    await expect(statusState(page)).toHaveText('Save failed');
    expect((await box(statusBar(page))).height).toBe(28);
  });

  for (const size of [TABLET, DESKTOP]) {
    test(`AC22: at ${size.width}px it keeps the long words`, async ({
      page,
    }) => {
      await openDeclared(page, size);
      await typeTitle(page);
      await expect(statusState(page)).toHaveText('Unsaved changes');
    });
  }

  test('AC23: at 375px a 40-character branch drops out and the state stays whole on one line', async ({
    page,
  }) => {
    await gotoAt(
      page,
      P375,
      branchUrl(`branch=${encodeURIComponent(LONG_BRANCH)}`)
    );
    await keepEdits(page);
    const [bar, state] = await Promise.all([
      box(statusBar(page)),
      box(statusState(page)),
    ]);
    expect(bar.height).toBe(28);
    expect(state.height).toBeLessThanOrEqual(28);
    const label = statusState(page).locator('[aria-live]');
    expect(
      await label.evaluate((node) => node.scrollWidth <= node.clientWidth)
    ).toBe(true);
    const branch = statusBar(page).getByText(LONG_BRANCH);
    expect((await box(branch)).y).toBeGreaterThanOrEqual(bar.y + bar.height);
    await noSideways(page);
  });

  test('AC23: at 375px a short branch shows beside the state', async ({
    page,
  }) => {
    await gotoAt(page, P375, branchUrl('branch=dev'));
    await keepEdits(page);
    const [bar, state, branch] = await Promise.all([
      box(statusBar(page)),
      box(statusState(page)),
      box(statusBar(page).getByText('dev')),
    ]);
    expect(bar.height).toBe(28);
    expect(branch.y).toBeLessThan(bar.y + bar.height);
    expect(Math.abs(branch.y - state.y)).toBeLessThan(14);
  });

  test('AC24: the live region holds one copy, in short words on a phone and long words elsewhere', async ({
    page,
  }) => {
    await openDeclared(page, P390);
    await typeTitle(page);
    await expect(statusState(page)).toHaveText('Unsaved');
    const live = statusBar(page).locator('[aria-live]');
    await expect(live).toHaveText('Unsaved');
    const text = await statusBar(page).evaluate((node) => node.textContent);
    expect(text?.match(/Unsaved/g)).toHaveLength(1);
    expect(text).not.toContain('Unsaved changes');
    await page.setViewportSize(DESKTOP);
    await expect(live).toHaveText('Unsaved changes');
    const wide = await statusBar(page).evaluate((node) => node.textContent);
    expect(wide?.match(/Unsaved/g)).toHaveLength(1);
  });
});

test.describe('AC25 and AC26: branches and Search on a phone', () => {
  test('AC25: the branch switcher fills the screen between the bars with its box focused', async ({
    page,
  }) => {
    await gotoAt(page, P390, branchUrl());
    await page.getByRole('button', { name: /^Branch:/ }).click();
    const switcher = page.getByRole('dialog', { name: 'Branches' });
    await expect(switcher).toBeVisible();
    await expect(
      switcher.getByRole('searchbox', { name: 'Search branches' })
    ).toBeFocused();
    await expect(
      switcher.getByRole('button', { name: 'Close branches' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Maximise' })).toHaveCount(0);
    await fillsBetweenBars(page, switcher);
    await noSideways(page);
    await switcher.getByRole('button', { name: 'Close branches' }).click();
    await expect(switcher).toBeHidden();
  });

  test('AC25: with unsaved edits the switcher says to save or discard first', async ({
    page,
  }) => {
    await gotoAt(page, P390, branchUrl());
    await typeTitle(page);
    await page.getByRole('button', { name: /^Branch:/ }).click();
    const switcher = page.getByRole('dialog', { name: 'Branches' });
    await switcher.getByRole('button', { name: 'feature/news' }).click();
    await expect(
      switcher.getByText('Save or discard your changes first')
    ).toBeVisible();
    await expect(switcher).toBeVisible();
  });

  test('AC25: a failed branch list shows the failure with Retry and the top bar names no wrong branch', async ({
    page,
  }) => {
    await gotoAt(page, P390, branchUrl('fail=branches'));
    await page
      .getByRole('button', { name: /^Branch/ })
      .first()
      .click();
    const switcher = page.getByRole('dialog', { name: 'Branches' });
    await expect(switcher.getByRole('alert')).toContainText(
      "Couldn't load branches"
    );
    await expect(switcher.getByRole('button', { name: 'Retry' })).toBeVisible();
    await fillsBetweenBars(page, switcher);
    await expect(
      page.getByRole('banner', { name: 'Top bar' }).getByText('main')
    ).toHaveCount(0);
  });

  test('AC26: Search fills the screen under the top bar with its box focused', async ({
    page,
  }) => {
    await gotoAt(page, P390, branchUrl());
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    const search = page.getByRole('dialog', { name: 'Search' });
    await expect(search).toBeVisible();
    await expect(
      search.getByRole('searchbox', { name: 'Search' })
    ).toBeFocused();
    await fillsBetweenBars(page, search);
    await expect(page.getByRole('button', { name: 'Maximise' })).toHaveCount(0);
    await search.getByRole('searchbox', { name: 'Search' }).fill('zzzz');
    await expect(
      search.getByText('Full-text search needs a search provider.')
    ).toBeVisible();
    await noSideways(page);
    await search.getByRole('button', { name: 'Close search' }).click();
    await expect(search).toBeHidden();
  });

  test('AC26: picking a result closes Search and opens it', async ({
    page,
  }) => {
    await gotoAt(page, P390, branchUrl());
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    const search = page.getByRole('dialog', { name: 'Search' });
    await search.getByRole('button', { name: 'Media' }).click();
    await expect(search).toBeHidden();
    await expect(
      page.getByRole('complementary', { name: 'Media' })
    ).toBeVisible();
  });
});

const CHECKLIST =
  '/#/collections/checklist/content%2Fchecklists%2Ftwo-errors.mdx';

const heightsOf = (locator: Locator) =>
  locator.evaluateAll((nodes) =>
    nodes
      .map((node) => node.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0)
      .map((rect) => rect.height)
  );

/** With a finger every one is at least 40px tall; with a mouse none is. */
const expectSized = async (locator: Locator, touch: boolean, what: string) => {
  await expect
    .poll(
      async () => {
        const heights = await heightsOf(locator);
        return (
          heights.length > 0 &&
          heights.every((height) => (touch ? height >= 40 : height < 40))
        );
      },
      { message: `${what} should be ${touch ? '>= 40px' : '< 40px'} tall` }
    )
    .toBe(true);
};

const openMenuIfPhone = async (page: Page) => {
  if ((page.viewportSize()?.width ?? 0) < 768) {
    await page.getByRole('button', { name: 'Open side nav' }).click();
  }
};

/** A point 18px from the control's centre still hits it when its hit area is 40px. */
const hitAreaReaches = (control: Locator) =>
  control.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const x = rect.x + rect.width / 2;
    const y = rect.y + rect.height / 2;
    return [
      [-18, 0],
      [18, 0],
      [0, -18],
      [0, 18],
    ].every(([dx, dy]) => {
      const hit = document.elementFromPoint(x + dx, y + dy);
      return hit !== null && node.contains(hit);
    });
  });

const inputGroupOf = (page: Page, name: string) =>
  page.locator('[data-slot=input-group]', {
    has: page.getByRole('combobox', { name }),
  });

for (const touch of [true, false]) {
  for (const size of [P390, DESKTOP]) {
    test.describe(`AC27 sizes ${touch ? 'with' : 'without'} a finger at ${size.width}px`, () => {
      test.use({ hasTouch: touch });

      test('top bar buttons, the menu button and the rail or side nav rows', async ({
        page,
      }) => {
        await openDeclared(page, size);
        await expectSized(
          topBar(page).locator('button:visible'),
          touch,
          'top bar buttons'
        );
        await expectSized(
          page.locator('[data-slot=sidebar-trigger]:visible'),
          touch,
          'the menu button'
        );
        await openMenuIfPhone(page);
        await expectSized(
          page.locator('[data-rail-row]:visible'),
          touch,
          'rail rows'
        );
      });

      test('the form bar, a text input and the Document actions menu rows', async ({
        page,
      }) => {
        await openDeclared(page, size);
        await expectSized(
          formBar(page).locator('button:visible'),
          touch,
          'form bar buttons'
        );
        await expectSized(title(page), touch, 'a text input');
        await formBar(page)
          .getByRole('button', { name: 'Document actions' })
          .click();
        await expectSized(page.getByRole('menuitem'), touch, 'menu items');
      });

      test('a checkbox hit area reaches 18px past its centre only with a finger', async ({
        page,
      }) => {
        await openDeclared(page, size);
        expect(
          await hitAreaReaches(page.getByRole('checkbox', { name: 'Featured' }))
        ).toBe(touch);
      });

      test('a select and its items, and a combobox and its items', async ({
        page,
      }) => {
        await gotoAt(page, size, CHECKLIST);
        const select = page.getByRole('combobox', { name: 'Choice' });
        await expectSized(select, touch, 'a select');
        await expectSized(
          inputGroupOf(page, 'Related post'),
          touch,
          'a combobox'
        );
        await select.click();
        await expectSized(
          page.locator('[data-slot=select-item]'),
          touch,
          'select items'
        );
        await page.keyboard.press('Escape');
        await expect(
          page.locator('[data-slot=select-item]').first()
        ).toBeHidden();
        await page.getByRole('combobox', { name: 'Related post' }).click();
        // Two-line items are taller than 40px with a mouse as well.
        if (touch) {
          await expectSized(
            page.locator('[data-slot=combobox-item]'),
            true,
            'combobox items'
          );
        }
      });

      test('array list card heads, breadcrumb links and rich-text toolbar buttons', async ({
        page,
      }) => {
        await openDeclared(page, size);
        await expectSized(
          page.locator('[data-slot=list-card-head]'),
          touch,
          'list card heads'
        );
        await expectSized(
          page
            .getByRole('navigation', { name: 'Location' })
            .getByRole('button'),
          touch,
          'breadcrumb links'
        );
        await expectSized(
          page.getByRole('toolbar', { name: 'Formatting' }).getByRole('button'),
          touch,
          'rich-text toolbar buttons'
        );
      });

      test('Collections list rows and collection table rows', async ({
        page,
      }) => {
        await gotoAt(page, size, '/#/collections/post');
        const navigator = page.getByRole('complementary', {
          name: 'Navigator',
        });
        await expect(navigator).toBeVisible();
        await expectSized(
          navigator
            .getByRole('list', { name: 'Posts documents' })
            .getByRole('button'),
          touch,
          'Collections list rows'
        );
        await gotoAt(page, size, '/#/collections/post/folder/guides');
        await page.reload();
        // Table rows hold two lines, so they pass 40px with a mouse as well.
        if (touch) {
          await expectSized(
            page
              .getByRole('row')
              .filter({ hasNot: page.getByRole('columnheader') }),
            true,
            'table rows'
          );
        }
      });
    });
  }
}

const effectiveOpacity = (locator: Locator) =>
  locator.evaluate((node) => {
    let opacity = 1;
    for (
      let element: Element | null = node;
      element;
      element = element.parentElement
    ) {
      opacity *= Number(getComputedStyle(element).opacity);
    }
    return opacity;
  });

/** With a finger the control shows at rest; with a mouse it waits for hover or focus. */
const expectShownAtRest = async (locator: Locator, touch: boolean) => {
  await expect
    .poll(() => effectiveOpacity(locator), { message: 'opacity at rest' })
    .toBe(touch ? 1 : 0);
};

for (const touch of [true, false]) {
  test.describe(`AC28 and AC30 ${touch ? 'with' : 'without'} a finger`, () => {
    test.use({ hasTouch: touch });

    test('AC28: the Search shortcut hint is hidden with a finger and shown without', async ({
      page,
    }) => {
      await openDeclared(page, DESKTOP);
      const hints = topBar(page).locator('kbd');
      await expect(hints.first()).toBeAttached();
      expect(
        await hints.evaluateAll((nodes) =>
          nodes.some((node) => node.getBoundingClientRect().width > 0)
        )
      ).toBe(!touch);
    });

    for (const size of [P390, DESKTOP]) {
      test(`AC30: list card actions show at rest only with a finger at ${size.width}px`, async ({
        page,
      }) => {
        await openDeclared(page, size);
        const actions = page
          .getByRole('button', { name: 'Actions for Item 1' })
          .first();
        await expect(actions).toBeAttached();
        await page.mouse.move(2, 2);
        await expectShownAtRest(actions, touch);
        await expect(
          page.getByRole('button', { name: 'Move Item 1' }).first()
        ).toBeVisible();
      });

      test(`AC30: collection table row actions show at rest only with a finger at ${size.width}px`, async ({
        page,
      }) => {
        await gotoAt(page, size, '/#/collections/post/folder/guides');
        const actions = page.getByRole('button', {
          name: 'Actions for Getting started',
        });
        await expect(actions).toBeAttached();
        await page.mouse.move(2, 2);
        await expectShownAtRest(actions, touch);
      });
    }

    test('AC30: the error pane Go to field shows at rest only with a finger', async ({
      page,
    }) => {
      await gotoAt(page, DESKTOP, CHECKLIST);
      await page.getByRole('textbox', { name: /^Note/ }).fill('x');
      await formBar(page)
        .getByRole('button', { name: 'Save', exact: true })
        .click();
      const pane = page.getByRole('complementary', { name: /^Errors/ });
      await expect(pane).toBeVisible();
      const goTo = pane.getByText('Go to field').last();
      await expect(goTo).toBeAttached();
      await page.mouse.move(2, 2);
      await expectShownAtRest(goTo, touch);
    });
  });
}

const LONG_POST = `/#/collections/post/${encodeURIComponent('content/posts/long-post.mdx')}`;

test.describe('AC38 and AC44: popups and the rich-text field on a touch phone', () => {
  test.use({ hasTouch: true });

  test('AC38: a select and a combobox opened with the keyboard up stay above the form bar', async ({
    page,
  }) => {
    await gotoAt(page, P390, CHECKLIST);
    await expect(page.getByRole('combobox', { name: 'Choice' })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 544 });
    await formScroller(page).evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    const above = async (popup: Locator) => {
      const [area, bar] = await Promise.all([box(popup), box(formBar(page))]);
      expect(area.y).toBeGreaterThanOrEqual(0);
      expect(area.y + area.height).toBeLessThanOrEqual(bar.y + 0.5);
      expect(area.x).toBeGreaterThanOrEqual(0);
      expect(area.x + area.width).toBeLessThanOrEqual(390);
    };

    await page.getByRole('combobox', { name: 'Choice' }).click();
    const select = page.locator('[data-slot=select-content]');
    await expect(select).toBeVisible();
    await above(select);
    await page.keyboard.press('Escape');
    await expect(select).toBeHidden();

    await page.getByRole('combobox', { name: 'Related post' }).click();
    const list = page.locator('[data-slot=combobox-content]');
    await expect(list).toBeVisible();
    await above(list);
    const scroller = page.locator('[data-slot=combobox-list]');
    expect(
      await scroller.evaluate((node) => getComputedStyle(node).maxHeight)
    ).not.toBe('none');
    const last = page.locator('[data-slot=combobox-item]').last();
    await last.scrollIntoViewIfNeeded();
    await above(list);
    const [lastBox, listBox] = await Promise.all([box(last), box(scroller)]);
    expect(lastBox.y + lastBox.height).toBeLessThanOrEqual(
      listBox.y + listBox.height + 0.5
    );
    expect(lastBox.y).toBeGreaterThanOrEqual(listBox.y - 0.5);
  });

  test('AC44: the form scrolls as one area between its header and the form bar', async ({
    page,
  }) => {
    await openDeclared(page, P390);
    const scroller = formScroller(page);
    const [area, bar] = await Promise.all([box(scroller), box(formBar(page))]);
    expect(area.y + area.height).toBeLessThanOrEqual(bar.y + 0.5);
    expect(area.y + area.height).toBeGreaterThanOrEqual(bar.y - 1);
    expect(
      await scroller.evaluate((node) => node.scrollHeight > node.clientHeight)
    ).toBe(true);
    const body = page.getByRole('textbox', { name: /^Body/ });
    expect(
      await body.evaluate((node) => node.scrollHeight <= node.clientHeight + 1)
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= window.innerHeight + 1
      )
    ).toBe(true);
  });

  test('AC44: the fixed toolbar fits the column and its overflow goes to the More menu', async ({
    page,
  }) => {
    await openDeclared(page, P390);
    const toolbar = page.getByRole('toolbar', { name: 'Formatting' });
    await expect(toolbar).toBeVisible();
    const [bar, column] = await Promise.all([
      box(toolbar),
      box(formScroller(page)),
    ]);
    expect(bar.x).toBeGreaterThanOrEqual(column.x);
    expect(bar.x + bar.width).toBeLessThanOrEqual(
      column.x + column.width + 0.5
    );
    expect(
      await toolbar.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)
    ).toBe(true);
    await expect(
      toolbar.getByRole('button', { name: 'More tools...' })
    ).toBeVisible();
    await noSideways(page);
  });

  test('AC44: the link bar and the mark menu stay inside the visible area', async ({
    page,
  }) => {
    await gotoAt(page, P390, LONG_POST);
    const body = page.getByRole('textbox', { name: /^Body/ });
    await expect(body).toBeVisible();
    const inside = async (popup: Locator) => {
      const [area, bar, top] = await Promise.all([
        box(popup),
        box(formBar(page)),
        box(topBar(page)),
      ]);
      expect(area.x).toBeGreaterThanOrEqual(0);
      expect(area.x + area.width).toBeLessThanOrEqual(390);
      expect(area.y).toBeGreaterThanOrEqual(top.y + top.height - 0.5);
      expect(area.y + area.height).toBeLessThanOrEqual(bar.y + 0.5);
    };
    const link = body.getByText('Tina docs');
    await link.scrollIntoViewIfNeeded();
    await link.click();
    const linkBar = page.getByRole('toolbar', { name: 'Link' });
    await expect(linkBar).toBeVisible();
    await inside(linkBar);

    await page
      .getByRole('toolbar', { name: 'Formatting' })
      .getByRole('button', { name: 'More formatting' })
      .click();
    const menu = page.getByRole('menu').last();
    await expect(menu).toBeVisible();
    await inside(menu);
  });

  test('AC44: a focused field scrolled to the bottom is not covered by the form bar', async ({
    page,
  }) => {
    await openDeclared(page, P390);
    const body = page.getByRole('textbox', { name: /^Body/ });
    await body.click();
    await page.keyboard.press('Control+End');
    await formScroller(page).evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    const [field, bar] = await Promise.all([box(body), box(formBar(page))]);
    expect(field.y + field.height).toBeLessThanOrEqual(bar.y + 0.5);
    await expect(body).toBeFocused();
  });
});

test.describe('AC35: no phone screen scrolls sideways at 375px', () => {
  const reaches: [string, (page: Page) => Promise<void>][] = [
    ['Home', (page) => gotoAt(page, P375, branchUrl('account=1', '/'))],
    [
      'a document on Form',
      async (page) => {
        await openDeclared(page, P375);
      },
    ],
    [
      'a document on Preview',
      async (page) => {
        await openDeclared(page, P375);
        await viewSwitch(page).getByRole('button', { name: 'Preview' }).click();
      },
    ],
    [
      'the page route',
      async (page) => {
        await gotoAt(page, P375, declaredUrl('/page', BLOG));
        await expect(footBar(page)).toBeVisible();
      },
    ],
    [
      'Collections',
      async (page) => {
        await gotoAt(page, P375, '/#/collections/post');
        await expect(
          page.getByRole('complementary', { name: 'Navigator' })
        ).toBeVisible();
      },
    ],
    [
      'a collection table',
      async (page) => {
        await gotoAt(page, P375, '/#/collections/post/folder/guides');
        await expect(page.getByRole('row').first()).toBeVisible();
      },
    ],
    [
      'Media',
      async (page) => {
        await gotoAt(page, P375, '/#/media');
        await expect(
          page.getByRole('complementary', { name: 'Media' })
        ).toBeVisible();
      },
    ],
    [
      'the side nav',
      async (page) => {
        await openDeclared(page, P375);
        await page.getByRole('button', { name: 'Open side nav' }).click();
        await expect(
          page.getByRole('navigation', { name: 'Content' })
        ).toBeVisible();
      },
    ],
    [
      'the branch switcher with a long branch',
      async (page) => {
        await gotoAt(
          page,
          P375,
          branchUrl(`branch=${encodeURIComponent(LONG_BRANCH)}`)
        );
        await page.getByRole('button', { name: /^Branch:/ }).click();
        await expect(
          page.getByRole('dialog', { name: 'Branches' })
        ).toBeVisible();
      },
    ],
    [
      'Search',
      async (page) => {
        await gotoAt(page, P375, branchUrl());
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await expect(
          page.getByRole('dialog', { name: 'Search' })
        ).toBeVisible();
      },
    ],
    [
      'a plugin screen',
      async (page) => {
        await gotoAt(page, P375, branchUrl('home=long', '/screens/plain'));
        await expect(
          page.getByRole('heading', { name: 'Plain' })
        ).toBeVisible();
      },
    ],
    [
      'the error list',
      async (page) => {
        await gotoAt(page, P375, CHECKLIST);
        await page.getByRole('textbox', { name: /^Note/ }).fill('x');
        await formBar(page)
          .getByRole('button', { name: 'Save', exact: true })
          .click();
        await expect(
          page.getByRole('dialog', { name: /^Errors/ })
        ).toBeVisible();
      },
    ],
  ];

  for (const [name, reach] of reaches) {
    test(name, async ({ page }) => {
      await reach(page);
      await page.waitForTimeout(300);
      await noSideways(page);
    });
  }
});
