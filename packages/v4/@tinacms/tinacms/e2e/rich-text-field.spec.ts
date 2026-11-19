import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import {
  fakeVisualViewport,
  formColumn,
  formScroller,
  setColumnWidth,
  setKeyboardHeight,
  setVisibleAreaOffset,
  toolbar,
  toolbarShell,
} from './form-column';

const IN_LINE_TOOLS = [
  'Bold',
  'Italic',
  'Link',
  'Bulleted list',
  'Numbered list',
  'Quote',
];

const body = (page: import('@playwright/test').Page) =>
  page.getByRole('textbox', { name: 'body' });

const saveButton = (page: import('@playwright/test').Page) =>
  formColumn(page).getByRole('button', { name: 'Save', exact: true });

const status = (page: import('@playwright/test').Page) =>
  formColumn(page)
    .locator('[data-slot="form-bar"]')
    .getByText(/^(No changes|Unsaved|Saved)$/);

const openDocument = async (
  page: import('@playwright/test').Page,
  name: string
) => {
  await page.goto(
    `/#/collections/post/${encodeURIComponent(`content/posts/${name}`)}`
  );
  await expect(body(page)).toBeVisible();
};

const CONTENT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../playground/content/posts'
);
const snapshot = new Map<string, string>();

test.beforeAll(async () => {
  for (const entry of await fs.readdir(CONTENT_DIR, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(CONTENT_DIR, entry.name);
    snapshot.set(file, await fs.readFile(file, 'utf8'));
  }
});

test.afterAll(async () => {
  await Promise.all(
    [...snapshot].map(([file, contents]) => fs.writeFile(file, contents))
  );
});

test.beforeEach(async ({ page }) => {
  await openDocument(page, 'hello-world.mdx');
});

test.describe('rich-text layout', () => {
  test('the editor stays inside the sidebar, even with nested lists', async ({
    page,
  }) => {
    await openDocument(page, 'second-post.mdx');
    await expect(body(page)).toContainText('bullet point');

    const overflow = await formColumn(page).evaluate((aside) => ({
      client: aside.clientWidth,
      scroll: aside.scrollWidth,
    }));
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);

    const fits = await body(page).evaluate((editor) => {
      const track = editor.closest('aside') as HTMLElement;
      return editor.clientWidth <= track.clientWidth;
    });
    expect(fits).toBe(true);
  });

  test('the toolbar fits its column at every width the column can take', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1800, height: 900 });
    await openDocument(page, 'second-post.mdx');

    for (const columnWidth of [352, 420, 480, 560, 700, 900, 1200]) {
      await setColumnWidth(page, columnWidth);

      const row = await toolbar(page).evaluate((container) => {
        const box = container.getBoundingClientRect();
        return {
          overflows: container.scrollWidth > container.clientWidth,
          outside: Array.from(container.querySelectorAll('button')).filter(
            (button) => {
              const rect = button.getBoundingClientRect();
              return rect.width > 0 && rect.right > box.right + 0.5;
            }
          ).length,
        };
      });

      expect(
        row.overflows,
        `toolbar scrolls in a ${columnWidth}px column`
      ).toBe(false);
      expect(row.outside, `tools spill out of a ${columnWidth}px column`).toBe(
        0
      );
      for (const name of ['Text style', 'More formatting', 'Insert']) {
        await expect(
          toolbar(page).getByRole('button', { name }),
          `${name} at ${columnWidth}px`
        ).toBeVisible();
      }
      const inLine = await Promise.all(
        IN_LINE_TOOLS.map((name) =>
          toolbar(page).getByRole('button', { name, exact: true }).isVisible()
        )
      );
      const firstFolded = inLine.indexOf(false);
      expect(
        firstFolded === -1 || !inLine.slice(firstFolded).includes(true),
        `tools fold from the end of the line at ${columnWidth}px: ${inLine}`
      ).toBe(true);
      await expect(
        toolbar(page).getByRole('button', { name: /^More tools/ }),
        `More tools shows exactly when something folded at ${columnWidth}px`
      ).toBeVisible({ visible: firstFolded !== -1 });
    }
  });
});

test.describe('rich-text save lifecycle', () => {
  test.describe.configure({ mode: 'serial' });

  test('goes pristine -> dirty on a real edit -> clean once saved', async ({
    page,
  }) => {
    await expect(status(page)).toHaveText('No changes');

    await body(page).click();
    await expect(status(page)).toHaveText('No changes');

    await body(page).pressSequentially('Edited. ');
    await expect(status(page)).toHaveText('Unsaved');

    await saveButton(page).click();
    await expect(status(page)).toHaveText('Saved');
  });

  test('typing and then deleting it returns the document to clean', async ({
    page,
  }) => {
    await expect(status(page)).toHaveText('No changes');

    await body(page).click();
    await body(page).pressSequentially('Edited.');
    await expect(status(page)).toHaveText('Unsaved');

    for (const _ of 'Edited.') await page.keyboard.press('Backspace');
    await expect(status(page)).toHaveText('Saved');
  });

  test('a second edit after saving can also reach clean', async ({ page }) => {
    await body(page).click();
    await body(page).pressSequentially('One. ');
    await saveButton(page).click();
    await expect(status(page)).toHaveText('Saved');

    await body(page).pressSequentially('Two. ');
    await expect(status(page)).toHaveText('Unsaved');
    await saveButton(page).click();
    await expect(status(page)).toHaveText('Saved');
  });
});

const LONG_POST = 'long-post.mdx';
const RICH_PAGE = `/#/collections/page/${encodeURIComponent('content/pages/rich.mdx')}`;

const openRichPage = async (page: import('@playwright/test').Page) => {
  await page.goto(RICH_PAGE);
  await expect(page.getByRole('textbox', { name: /^Summary/ })).toBeVisible();
};

const openItems = async (page: import('@playwright/test').Page) => {
  for (const heading of ['First', 'Second']) {
    await page.getByText(heading, { exact: true }).click();
  }
  await expect(page.getByRole('textbox', { name: /^Text/ })).toHaveCount(2);
};

const scrollForm = (
  page: import('@playwright/test').Page,
  top: number | 'end'
) =>
  formScroller(page).evaluate(
    (scroller, to) =>
      scroller.scrollTo(0, to === 'end' ? scroller.scrollHeight : to),
    top
  );

const offsetUnderForm = async (page: import('@playwright/test').Page) => {
  const shell = await toolbarShell(page).boundingBox();
  const scroller = await formScroller(page).boundingBox();
  if (!shell || !scroller) throw new Error('toolbar or form not visible');
  return shell.y - scroller.y;
};

test.describe('the body toolbar sticks and a framed one does not', () => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    test(`sticks 8px under the form top once the body scrolls past it at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await openDocument(page, LONG_POST);
      const shell = toolbarShell(page);

      await expect(shell).not.toHaveAttribute('data-stuck');
      await scrollForm(page, 'end');
      await expect(shell).toHaveAttribute('data-stuck', '');
      await expect.poll(() => offsetUnderForm(page)).toBeCloseTo(8, 0);

      await scrollForm(page, 0);
      await expect(shell).not.toHaveAttribute('data-stuck');
    });
  }

  for (const width of [1280, 390]) {
    test(`scrolling the body text leaves the stuck toolbar put at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 560 });
      await openDocument(page, LONG_POST);
      const shell = toolbarShell(page);
      await scrollForm(page, 'end');
      await expect(shell).toHaveAttribute('data-stuck', '');
      await expect.poll(() => offsetUnderForm(page)).toBeCloseTo(8, 0);

      const body = page.getByRole('textbox', { name: /^Body/ });
      await body.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      expect(await body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      await expect(shell).toHaveAttribute('data-stuck', '');
      expect(await offsetUnderForm(page)).toBeCloseTo(8, 0);
    });

    test(`scrolling the body text leaves the flat toolbar at the top of the box at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await openDocument(page, LONG_POST);
      const shell = toolbarShell(page);
      const before = await shell.boundingBox();
      await page.getByRole('textbox', { name: /^Body/ }).evaluate((el) => {
        el.scrollTop = 200;
      });
      const after = await shell.boundingBox();
      expect(after?.y).toBe(before?.y);
      await expect(shell).not.toHaveAttribute('data-stuck');
    });
  }

  test('a framed field never sticks or gets data-stuck', async ({ page }) => {
    await openRichPage(page);
    const shell = toolbarShell(page, /^Summary/);
    const textbox = page.getByRole('textbox', { name: /^Summary/ });

    await expect(shell).toBeVisible();
    await scrollForm(page, 300);
    await expect(shell).not.toHaveAttribute('data-stuck');
    await expect(shell).toHaveCSS('position', 'relative');
    await expect(textbox).toHaveCSS('max-height', '240px');
  });
});

test.describe('the wheel over a rich-text field', () => {
  const wheelOver = async (
    page: import('@playwright/test').Page,
    name: RegExp,
    deltaY: number
  ) => {
    const textbox = page.getByRole('textbox', { name });
    await textbox.scrollIntoViewIfNeeded();
    const box = await textbox.boundingBox();
    if (!box) throw new Error('text box not visible');
    await page.mouse.move(box.x + box.width / 2, box.y + 60);
    await page.mouse.wheel(0, deltaY);
  };

  const bodyBox = (page: import('@playwright/test').Page) =>
    page.getByRole('textbox', { name: /^Body/ });
  const scrollTop = (locator: import('@playwright/test').Locator) =>
    locator.evaluate((el) => el.scrollTop);

  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    test.describe(`at ${viewport.width}px`, () => {
      test.use({ viewport });

      test('a long body stops at min(70vh, 640px) and scrolls its text', async ({
        page,
      }) => {
        await openDocument(page, LONG_POST);
        const body = bodyBox(page);
        const cap = Math.min(viewport.height * 0.7, 640);
        await expect(body).toHaveCSS('overflow-y', 'auto');
        await expect(body).toHaveCSS('max-height', `${cap}px`);
        const { client, scroll } = await body.evaluate((el) => ({
          client: el.clientHeight,
          scroll: el.scrollHeight,
        }));
        expect(client).toBeLessThanOrEqual(Math.ceil(cap));
        expect(client).toBeGreaterThan(cap - 4);
        expect(scroll).toBeGreaterThan(client);
      });

      test('a short body keeps its 224px minimum, has nothing to scroll, and the wheel moves the form', async ({
        page,
      }) => {
        await page.setViewportSize({ width: viewport.width, height: 560 });
        await openDocument(page, 'hello-world.mdx');
        const body = bodyBox(page);
        const { client, scroll } = await body.evaluate((el) => ({
          client: el.clientHeight,
          scroll: el.scrollHeight,
        }));
        expect(client).toBeGreaterThanOrEqual(222);
        expect(scroll).toBeLessThanOrEqual(client);
        await wheelOver(page, /^Body/, 150);
        await expect
          .poll(() => scrollTop(formScroller(page)))
          .toBeGreaterThan(0);
        expect(await scrollTop(body)).toBe(0);
      });

      test('the wheel scrolls the body text first, then the form, and back up at the top', async ({
        page,
      }) => {
        await openDocument(page, LONG_POST);
        const body = bodyBox(page);
        await body.scrollIntoViewIfNeeded();
        const formStart = await scrollTop(formScroller(page));

        await wheelOver(page, /^Body/, 200);
        await expect.poll(() => scrollTop(body)).toBeGreaterThan(0);
        expect(await scrollTop(formScroller(page))).toBe(formStart);

        for (let attempt = 0; attempt < 10; attempt++) {
          await wheelOver(page, /^Body/, 400);
        }
        const end = await body.evaluate(
          (el) => el.scrollHeight - el.clientHeight
        );
        expect(await scrollTop(body)).toBeGreaterThanOrEqual(end - 1);
        await expect
          .poll(() => scrollTop(formScroller(page)))
          .toBeGreaterThan(formStart);

        const formAtEnd = await scrollTop(formScroller(page));
        await body.evaluate((el) => {
          el.scrollTop = 0;
        });
        await wheelOver(page, /^Body/, -300);
        await expect
          .poll(() => scrollTop(formScroller(page)))
          .toBeLessThan(formAtEnd);
      });

      test('nothing around the text sets overscroll-behavior', async ({
        page,
      }) => {
        await openDocument(page, LONG_POST);
        const values = await bodyBox(page).evaluate((el) => {
          const out: string[] = [];
          for (let n: Element | null = el; n; n = n.parentElement) {
            out.push(getComputedStyle(n).overscrollBehaviorY);
          }
          return out;
        });
        expect(values.filter((v) => v !== 'auto')).toEqual([]);
      });
    });
  }

  test('scrolls a framed field first, then hands the wheel to the form', async ({
    page,
  }) => {
    await openRichPage(page);
    const textbox = page.getByRole('textbox', { name: /^Summary/ });
    await textbox.scrollIntoViewIfNeeded();
    const formTop = await formScroller(page).evaluate((el) => el.scrollTop);
    await wheelOver(page, /^Summary/, 120);
    await expect
      .poll(() => textbox.evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0);
    expect(await formScroller(page).evaluate((el) => el.scrollTop)).toBe(
      formTop
    );

    for (let attempt = 0; attempt < 6; attempt++) {
      await wheelOver(page, /^Summary/, 400);
    }
    await expect
      .poll(() => formScroller(page).evaluate((el) => el.scrollTop))
      .toBeGreaterThan(formTop);
  });
});

test.describe('the keyboard on a phone', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const KEYBOARD_TOP = 500;

  test.beforeEach(async ({ page }) => {
    await fakeVisualViewport(page);
    await page.reload();
  });

  test('lifts the body toolbar onto the keyboard and back', async ({
    page,
  }) => {
    await openDocument(page, LONG_POST);
    const shell = toolbarShell(page);

    await body(page).tap();
    await setKeyboardHeight(page, KEYBOARD_TOP);
    await expect(shell).toHaveAttribute('data-lifted', '');
    await expect
      .poll(async () => {
        const box = await shell.boundingBox();
        return box ? Math.round(box.y + box.height) : Number.NaN;
      })
      .toBe(KEYBOARD_TOP);

    await setKeyboardHeight(page, 844);
    await expect(shell).not.toHaveAttribute('data-lifted');
  });

  test('lifts nothing for a framed field with focus', async ({ page }) => {
    await openRichPage(page);
    await page.getByRole('textbox', { name: /^Summary/ }).tap();
    await setKeyboardHeight(page, KEYBOARD_TOP);
    await expect(toolbarShell(page, /^Summary/)).not.toHaveAttribute(
      'data-lifted'
    );
  });

  test('draws touch-sized tools and no horizontal overflow', async ({
    page,
  }) => {
    await openDocument(page, LONG_POST);
    const buttons = toolbar(page).getByRole('button');
    expect(await buttons.count()).toBeGreaterThan(2);
    for (const button of await buttons.all()) {
      const box = await button.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(40);
      expect(box?.width).toBeGreaterThanOrEqual(40);
    }
    await scrollForm(page, 'end');
    await expect(
      toolbar(page).getByRole('button', { name: 'Insert' })
    ).toBeInViewport({ ratio: 1 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
});

test.describe('rich text inside an object and a list item', () => {
  const NESTED = [/^Notes/, /^Text/];

  test('draws the limited toolbar slots and the same frame as the top level', async ({
    page,
  }) => {
    await openRichPage(page);
    await openItems(page);
    for (const name of NESTED) {
      const field = page
        .locator('[data-slot="field-wrapper"]', {
          has: page.getByRole('textbox', { name }),
        })
        .last();
      const tools = field.getByRole('toolbar', { name: 'Formatting' });
      await expect(tools.getByRole('button', { name: 'Bold' })).toBeVisible();
      await expect(tools.getByRole('button', { name: 'Link' })).toBeVisible();
      await expect(tools.getByRole('button', { name: 'Quote' })).toHaveCount(0);
      await expect(tools.getByRole('button', { name: 'Insert' })).toHaveCount(
        0
      );
      await expect(
        field.locator('[data-slot="rich-text-frame"]')
      ).toBeVisible();
    }
  });

  test("keeps each list item's text on its own item", async ({ page }) => {
    await openRichPage(page);
    await openItems(page);
    const [first, second] = await page
      .getByRole('textbox', { name: /^Text/ })
      .all();
    if (!first || !second) throw new Error('two list items expected');
    const before = await second.innerText();
    await first.click();
    await first.pressSequentially('Typed in the first item. ');
    await expect(first).toContainText('Typed in the first item.');
    await expect(second).not.toContainText('Typed in the first item.');
    expect(await second.innerText()).toBe(before);
  });

  test('honours headingLevels and textColors, and shows no Turn into card', async ({
    page,
  }) => {
    await openRichPage(page);
    const notes = page.getByRole('textbox', { name: /^Notes/ });
    const styleTriggers = page.getByRole('button', { name: 'Text style' });

    await toolbarShell(page, /^Notes/)
      .getByRole('button', { name: 'Text style' })
      .click();
    await expect(page.getByRole('menuitemradio')).toHaveText([
      /Paragraph/,
      /Heading 2/,
    ]);
    await page.keyboard.press('Escape');

    await toolbarShell(page, /^Notes/)
      .getByRole('button', { name: 'More formatting' })
      .click();
    await page.getByRole('menuitem', { name: 'Text color' }).click();
    await expect(page.getByLabel('Brand')).toBeVisible();
    await page.keyboard.press('Escape');

    const before = await styleTriggers.count();
    await notes.click({ clickCount: 3 });
    await expect(styleTriggers).toHaveCount(before);

    await page
      .getByRole('textbox', { name: /^Summary/ })
      .click({ clickCount: 3 });
    await expect(styleTriggers).toHaveCount(before + 1);
  });
});

test.describe('the link bar and the body text scroll box', () => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    test(`follows its link while the text scrolls and hides once the link is out of the box at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await openDocument(page, LONG_POST);
      const body = page.getByRole('textbox', { name: /^Body/ });
      await body.scrollIntoViewIfNeeded();
      await body.getByText('Tina docs').click();
      const bar = page.getByRole('toolbar', { name: 'Link' });
      await expect(bar).toBeVisible();
      const link = body.getByText('Tina docs');
      const gap = async () => {
        const [b, l] = await Promise.all([
          bar.boundingBox(),
          link.boundingBox(),
        ]);
        if (!b || !l) throw new Error('bar or link not drawn');
        return b.y - l.y;
      };
      const before = await gap();

      await body.evaluate((el) => {
        el.scrollTop = 24;
      });
      await expect.poll(gap).toBeCloseTo(before, 0);

      await body.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await expect(bar).toBeHidden();

      await body.evaluate((el) => {
        el.scrollTop = 0;
      });
      await expect(bar).toBeVisible();
    });
  }
});

test.describe('Ctrl+K with Link folded into More tools', () => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
  ]) {
    test(`opens the link box and makes a link at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await openDocument(page, LONG_POST);
      const body = page.getByRole('textbox', { name: /^Body/ });
      await expect(
        page.getByRole('toolbar', { name: 'Formatting' }).getByRole('button', {
          name: 'Link',
        })
      ).toHaveCount(0);
      await body.getByText('paragraph').first().dblclick();

      await page.keyboard.press('Control+k');
      const address = page.getByRole('textbox', { name: 'Link' });
      await expect(address).toBeVisible();
      await expect(address).toBeFocused();
      await expect(
        page.getByRole('dialog', { name: 'More tools' })
      ).toBeHidden();
      await address.fill('https://tina.io/shortcut');
      await address.press('Enter');
      await expect(
        body.locator('a[href="https://tina.io/shortcut"]')
      ).toHaveCount(1);
    });
  }
});

test.describe('the link bar and the stuck body toolbar', () => {
  for (const width of [1280]) {
    test(`hides while its link is under the stuck toolbar and shows below it at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 340 });
      await openDocument(page, LONG_POST);
      const body = page.getByRole('textbox', { name: /^Body/ });
      const link = body.getByText('Tina docs');
      await link.scrollIntoViewIfNeeded();
      await link.click();
      const bar = page.getByRole('toolbar', { name: 'Link' });
      await expect(bar).toBeVisible();
      const shell = toolbarShell(page);

      const placeLink = async (below: number) => {
        for (let attempt = 0; attempt < 4; attempt++) {
          const [s, l] = await Promise.all([
            shell.boundingBox(),
            link.boundingBox(),
          ]);
          if (!s || !l) throw new Error('not drawn');
          const delta = l.y - (s.y + s.height + below);
          if (Math.abs(delta) < 2) return;
          await formScroller(page).evaluate((el, by) => {
            el.scrollTop += by;
          }, delta);
          await page.waitForTimeout(100);
        }
      };

      await scrollForm(page, 'end');
      await expect(shell).toHaveAttribute('data-stuck', '');
      await placeLink(-40);
      await expect(bar).toBeHidden();
      await placeLink(24);
      await expect(bar).toBeVisible();
    });
  }
});

test.describe('the table fills the field and keeps Add a column outside its scroll', () => {
  test('a 3-column table fills a widened body column at 1440px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openDocument(page, LONG_POST);
    await setColumnWidth(page, 900);
    const body = page.getByRole('textbox', { name: /^Body/ });
    await body.getByText('Ada').first().scrollIntoViewIfNeeded();
    await body.getByText('Ada').first().click();
    const add = page.getByRole('button', { name: 'Add a column' });
    await expect(add).toBeVisible();
    const [table, text, strip] = await Promise.all([
      body.locator('table').boundingBox(),
      body.boundingBox(),
      add.boundingBox(),
    ]);
    if (!table || !text || !strip) throw new Error('not drawn');
    expect(table.x + table.width).toBeGreaterThan(
      text.x + text.width - 40 - 24
    );
    expect(strip.x + strip.width).toBeLessThanOrEqual(text.x + text.width + 1);
    expect(strip.x).toBeGreaterThanOrEqual(table.x + table.width - 1);
  });

  test('at 390px the table scrolls sideways under Add a column, which stays in view', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openDocument(page, LONG_POST);
    const body = page.getByRole('textbox', { name: /^Body/ });
    await body.getByText('Ada').first().scrollIntoViewIfNeeded();
    await body.getByText('Ada').first().click();
    const add = page.getByRole('button', { name: 'Add a column' });
    await expect(add).toBeVisible();
    const [text, strip] = await Promise.all([
      body.boundingBox(),
      add.boundingBox(),
    ]);
    if (!text || !strip) throw new Error('not drawn');
    expect(strip.x + strip.width).toBeLessThanOrEqual(text.x + text.width + 1);
    const scroller = body
      .locator('[data-slate-node="element"]', { has: page.locator('table') })
      .last();
    const { client, scroll } = await scroller.evaluate((el) => ({
      client: el.clientWidth,
      scroll: el.scrollWidth,
    }));
    expect(scroll).toBeGreaterThan(client);
  });
});

test('the Link tool shows its tooltip with the Ctrl K keycap, like the other in-line tools', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await openDocument(page, LONG_POST);
  await setColumnWidth(page, 900);
  const tip = page.locator('[data-slot="tooltip-content"]');
  const tool = (name: string) =>
    page.getByRole('toolbar', { name: 'Formatting' }).getByRole('button', {
      name,
    });

  await tool('Italic').hover();
  await expect(tip).toContainText('Italic');
  await page.mouse.move(5, 5);
  await expect(tip).toHaveCount(0);

  await tool('Link').hover();
  await expect(tip).toContainText('Link');
  await expect(tip).toContainText(/Ctrl\s?K|⌘\s?K/);
});

test.describe('the link bar with the phone keyboard', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });

  test.beforeEach(async ({ page }) => {
    await fakeVisualViewport(page);
    await page.reload();
  });

  type Box = { x: number; y: number; width: number; height: number };
  const overlaps = (a: Box, b: Box) =>
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
  const measured = async (target: import('@playwright/test').Locator) => {
    const box = await target.boundingBox();
    if (!box) throw new Error('not drawn');
    return box;
  };

  /** Scrolls the link's scrollable ancestors (text box first, then the form) until its top is at `y`; throws when it can't get there. */
  const placeLinkAt = async (
    _page: import('@playwright/test').Page,
    link: import('@playwright/test').Locator,
    y: number
  ) => {
    const top = await link.evaluate((el, target) => {
      for (let up = el.parentElement; up; up = up.parentElement) {
        if (!/auto|scroll/.test(getComputedStyle(up).overflowY)) continue;
        up.scrollTop += el.getBoundingClientRect().top - target;
      }
      return el.getBoundingClientRect().top;
    }, y);
    await link.page().waitForTimeout(150);
    const box = await measured(link);
    if (Math.abs(box.y - y) >= 2) {
      throw new Error(
        `could not place the link at ${y}, it is at ${box.y} (was ${top})`
      );
    }
  };

  const liftedSetup = async (
    page: import('@playwright/test').Page,
    keyboard: number
  ) => {
    await openDocument(page, LONG_POST);
    const body = page.getByRole('textbox', { name: /^Body/ });
    const link = body.getByText('Tina docs');
    await link.scrollIntoViewIfNeeded();
    await link.tap();
    const shell = toolbarShell(page);
    await setKeyboardHeight(page, keyboard);
    await expect(shell).toHaveAttribute('data-lifted', '');
    return {
      link,
      shell,
      bar: page.getByRole('toolbar', { name: 'Link' }),
      header: page.getByRole('textbox', { name: /^Title/ }),
    };
  };

  const sizes = [
    { width: 390, height: 844, keyboard: 500 },
    { width: 360, height: 740, keyboard: 400 },
  ];
  for (const { width, height, keyboard } of sizes) {
    test.describe(`at ${width}x${height} with the keyboard at ${keyboard}`, () => {
      test.use({ viewport: { width, height } });

      test('a link well above the toolbar: the bar sits below it and off the toolbar', async ({
        page,
      }) => {
        const { link, shell, bar } = await liftedSetup(page, keyboard);
        const lifted = await measured(shell);
        await placeLinkAt(page, link, 150);
        const l = await measured(link);
        await expect(bar).toBeVisible();
        const b = await measured(bar);
        expect(b.y).toBeGreaterThanOrEqual(l.y + l.height);
        expect(overlaps(b, lifted)).toBe(false);
      });

      test('a link just above the toolbar: the bar flips above it, off the toolbar', async ({
        page,
      }) => {
        const { link, shell, bar } = await liftedSetup(page, keyboard);
        const lifted = await measured(shell);
        await placeLinkAt(page, link, lifted.y - 28 - 18);
        const l = await measured(link);
        expect(lifted.y - (l.y + l.height)).toBeGreaterThan(20);
        expect(lifted.y - (l.y + l.height)).toBeLessThan(40);
        await expect(bar).toBeVisible();
        const b = await measured(bar);
        expect(b.y + b.height).toBeLessThanOrEqual(l.y);
        expect(overlaps(b, lifted)).toBe(false);
      });

      test('a link under the toolbar: the bar is hidden', async ({ page }) => {
        const { link, shell, bar } = await liftedSetup(page, keyboard);
        const lifted = await measured(shell);
        await placeLinkAt(page, link, lifted.y + 12);
        const l = await measured(link);
        expect(l.y).toBeGreaterThan(lifted.y);
        expect(l.y + l.height).toBeLessThan(lifted.y + lifted.height);
        await expect(bar).toBeHidden();
      });

      test('a link under the keyboard: the bar is hidden', async ({ page }) => {
        const { link, bar } = await liftedSetup(page, keyboard);
        await placeLinkAt(page, link, keyboard + 20);
        await expect(bar).toBeHidden();
      });
    });
  }

  test('a link partly above the toolbar keeps its bar, above the link and off the toolbar', async ({
    page,
  }) => {
    const { link, shell, bar } = await liftedSetup(page, 500);
    const lifted = await measured(shell);
    await placeLinkAt(page, link, lifted.y - 6);
    await expect(bar).toBeVisible();
    const [l, b] = await Promise.all([measured(link), measured(bar)]);
    expect(b.y + b.height).toBeLessThanOrEqual(l.y);
    expect(overlaps(b, lifted)).toBe(false);
  });

  test('re-places the bar when the visible area scrolls, with no form scroll', async ({
    page,
  }) => {
    const { link, shell, bar } = await liftedSetup(page, 500);
    const before = await measured(shell);
    await placeLinkAt(page, link, before.y - 30);
    await expect(bar).toBeVisible();
    const above = async () => {
      const [l, b] = await Promise.all([measured(link), measured(bar)]);
      return b.y + b.height <= l.y;
    };
    expect(await above()).toBe(true);

    await setVisibleAreaOffset(page, 100);
    await expect
      .poll(async () => (await measured(shell)).y)
      .toBeGreaterThan(before.y + 50);
    await expect.poll(above).toBe(false);
    const [l, b] = await Promise.all([measured(link), measured(bar)]);
    expect(b.y).toBeGreaterThanOrEqual(l.y + l.height);

    await setVisibleAreaOffset(page, 0);
    await expect.poll(async () => (await measured(shell)).y).toBe(before.y);
    await expect.poll(above).toBe(true);
  });

  test('with the text box ending just above the lifted toolbar, a link at its bottom still gets a bar off the toolbar', async ({
    page,
  }) => {
    const { link, shell, bar } = await liftedSetup(page, 500);
    const lifted = await measured(shell);
    await link.evaluate((el, toolbarTop) => {
      const scrollers: HTMLElement[] = [];
      for (let up = el.parentElement; up; up = up.parentElement) {
        if (/auto|scroll/.test(getComputedStyle(up).overflowY)) {
          scrollers.push(up);
        }
      }
      const [box, form] = scrollers;
      if (!box || !form) throw new Error('no text box and form scroller');
      box.style.setProperty('max-height', '230px', 'important');
      box.style.setProperty('min-height', '0', 'important');
      box.dataset.cappedForTest = '';
      form.style.paddingBottom = '1200px';
      form.scrollTop += box.getBoundingClientRect().bottom - (toolbarTop - 20);
      box.scrollTop +=
        el.getBoundingClientRect().top -
        (box.getBoundingClientRect().bottom - 30);
    }, lifted.y);
    const box = await measured(page.locator('[data-capped-for-test]'));
    const l = await measured(link);
    expect(lifted.y - (box.y + box.height)).toBeGreaterThan(10);
    expect(lifted.y - (box.y + box.height)).toBeLessThan(30);
    expect(l.y).toBeGreaterThan(box.y);
    expect(l.y + l.height).toBeLessThan(box.y + box.height);
    expect(lifted.y - (l.y + l.height)).toBeLessThan(48);
    await expect(bar).toBeVisible();
    const b = await measured(bar);
    expect(b.y + b.height).toBeLessThanOrEqual(l.y);
    expect(overlaps(b, lifted)).toBe(false);
  });

  test('never covers the form header above the body', async ({ page }) => {
    const { link, bar, header } = await liftedSetup(page, 500);
    await placeLinkAt(page, link, 150);
    await expect(bar).toBeVisible();
    const [b, h] = await Promise.all([measured(bar), measured(header)]);
    expect(overlaps(b, h)).toBe(false);
  });

  test('with the visible area scrolled 100px, a link above the toolbar still gets a bar off the toolbar', async ({
    page,
  }) => {
    const { link, shell, bar } = await liftedSetup(page, 500);
    await setVisibleAreaOffset(page, 100);
    await expect
      .poll(async () => (await measured(shell)).y)
      .toBeGreaterThan(500);
    const lifted = await measured(shell);
    for (const above of [220, 46]) {
      await placeLinkAt(page, link, lifted.y - above);
      await expect(bar).toBeVisible();
      const b = await measured(bar);
      expect(overlaps(b, lifted)).toBe(false);
    }
    await placeLinkAt(page, link, lifted.y + 12);
    await expect(bar).toBeHidden();
  });

  test.describe('on a short screen', () => {
    test.use({ viewport: { width: 390, height: 410 } });

    test('a link placed under the future stuck toolbar has no bar the moment the keyboard closes, with no scroll', async ({
      page,
    }) => {
      await openDocument(page, LONG_POST);
      const body = page.getByRole('textbox', { name: /^Body/ });
      const link = body.getByText('Tina docs');
      await link.scrollIntoViewIfNeeded();
      await link.tap();
      await setKeyboardHeight(page, 250);
      const shell = toolbarShell(page);
      const bar = page.getByRole('toolbar', { name: 'Link' });
      await expect(shell).toHaveAttribute('data-lifted', '');
      const form = await measured(formScroller(page));
      await placeLinkAt(page, link, form.y + 10);
      await setKeyboardHeight(page, 410);
      await expect(shell).not.toHaveAttribute('data-lifted');
      await expect(shell).toHaveAttribute('data-stuck', '');
      const [s, l] = await Promise.all([measured(shell), measured(link)]);
      expect(overlaps(s, l)).toBe(true);
      await expect(bar).toBeHidden();

      await placeLinkAt(page, link, s.y + s.height + 24);
      await expect(bar).toBeVisible();
      const [l2, b] = await Promise.all([measured(link), measured(bar)]);
      expect(b.y).toBeGreaterThanOrEqual(l2.y + l2.height);
    });

    test('after the keyboard closes with the toolbar stuck, hides the bar only while its link is under the toolbar', async ({
      page,
    }) => {
      await openDocument(page, LONG_POST);
      const body = page.getByRole('textbox', { name: /^Body/ });
      const link = body.getByText('Tina docs');
      await link.scrollIntoViewIfNeeded();
      await link.tap();
      await setKeyboardHeight(page, 250);
      await setKeyboardHeight(page, 410);
      const shell = toolbarShell(page);
      const bar = page.getByRole('toolbar', { name: 'Link' });
      await expect(shell).not.toHaveAttribute('data-lifted');
      await expect(shell).toHaveAttribute('data-stuck', '');

      await formScroller(page).evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      const below = async (offset: number) => {
        for (let attempt = 0; attempt < 4; attempt++) {
          const [s, l] = await Promise.all([
            shell.boundingBox(),
            link.boundingBox(),
          ]);
          if (!s || !l) throw new Error('not drawn');
          const delta = l.y - (s.y + s.height + offset);
          if (Math.abs(delta) < 2) return;
          await body.evaluate((el, by) => {
            el.scrollTop += by;
          }, delta);
          await page.waitForTimeout(100);
        }
      };
      await below(-40);
      await expect(bar).toBeHidden();
      await below(24);
      await expect(bar).toBeVisible();
    });
  });
});

test.describe('the link bar on a desktop screen', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('sits below its link, and hides while the link is under the stuck toolbar', async ({
    page,
  }) => {
    await openDocument(page, LONG_POST);
    const body = page.getByRole('textbox', { name: /^Body/ });
    const link = body.getByText('Tina docs');
    await link.scrollIntoViewIfNeeded();
    await link.click();
    const bar = page.getByRole('toolbar', { name: 'Link' });
    const shell = toolbarShell(page);
    await expect(bar).toBeVisible();
    const [l, b] = await Promise.all([link.boundingBox(), bar.boundingBox()]);
    if (!l || !b) throw new Error('not drawn');
    expect(b.y).toBeGreaterThanOrEqual(l.y + l.height);

    await formScroller(page).evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(shell).toHaveAttribute('data-stuck', '');
    const s = await shell.boundingBox();
    if (!s) throw new Error('not drawn');
    await link.evaluate((el, target) => {
      for (let up = el.parentElement; up; up = up.parentElement) {
        if (/auto|scroll/.test(getComputedStyle(up).overflowY)) {
          up.scrollTop += el.getBoundingClientRect().top - target;
        }
      }
    }, s.y + 4);
    const under = await link.boundingBox();
    if (!under || under.y > s.y + s.height) {
      throw new Error('could not put the link under the toolbar');
    }
    await expect(bar).toBeHidden();
  });
});
