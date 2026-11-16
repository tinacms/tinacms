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

const scrollForm = (page: import('@playwright/test').Page, top: number) =>
  formScroller(page).evaluate((scroller, to) => scroller.scrollTo(0, to), top);

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
      await scrollForm(page, 600);
      await expect(shell).toHaveAttribute('data-stuck', '');
      await expect.poll(() => offsetUnderForm(page)).toBeCloseTo(8, 0);

      await scrollForm(page, 0);
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

  test('scrolls the form over the body text', async ({ page }) => {
    await openDocument(page, LONG_POST);
    await wheelOver(page, /^Body/, 300);
    await expect
      .poll(() => formScroller(page).evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0);
  });

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
