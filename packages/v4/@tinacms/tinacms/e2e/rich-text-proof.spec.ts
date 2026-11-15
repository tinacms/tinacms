import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Page, expect, test } from '@playwright/test';
import {
  fakeVisualViewport,
  formColumn,
  formScroller,
  setKeyboardHeight,
  toolbar,
} from './form-column';

const PLAYGROUND = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../playground/content'
);
const snapshot = new Map<string, string>();

test.beforeAll(async () => {
  for (const dir of ['posts', 'pages']) {
    for (const name of await fs.readdir(path.join(PLAYGROUND, dir))) {
      const file = path.join(PLAYGROUND, dir, name);
      snapshot.set(file, await fs.readFile(file, 'utf8'));
    }
  }
});

test.afterAll(async () => {
  await Promise.all(
    [...snapshot].map(([file, contents]) => fs.writeFile(file, contents))
  );
});

const POST = (name: string) =>
  `/#/collections/post/${encodeURIComponent(`content/posts/${name}`)}`;
const RICH_PAGE = `/#/collections/page/${encodeURIComponent('content/pages/rich.mdx')}`;

const body = (page: Page) => page.getByRole('textbox', { name: 'body' });
const save = (page: Page) =>
  formColumn(page).getByRole('button', { name: 'Save', exact: true });
const status = (page: Page) =>
  formColumn(page)
    .locator('[data-slot="form-bar"]')
    .getByText(/^(No changes|Unsaved|Saved)$/);

const openTool = async (page: Page, name: string) => {
  const direct = toolbar(page).getByRole('button', { name, exact: true });
  if (await direct.count()) {
    await direct.click();
    return;
  }
  await toolbar(page).getByRole('button', { name: 'More tools...' }).click();
  await page.getByRole('button', { name, exact: true }).first().click();
};

test('AC7: Tab leaves the toolbar into the text', async ({ page }) => {
  await page.goto(POST('hello-world.mdx'));
  await expect(body(page)).toBeVisible();
  await body(page).click();
  await page.keyboard.press('Shift+Tab');
  await expect(
    toolbar(page).getByRole('button', { name: /^Text style/ })
  ).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(
    toolbar(page).getByRole('button', { name: 'Bold' })
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(body(page)).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    toolbar(page).getByRole('button', { name: 'Bold' })
  ).toBeFocused();
});

test('AC9: Highlight Yellow saves the stored value', async ({ page }) => {
  await page.goto(POST('hello-world.mdx'));
  await body(page).getByText('prose').first().dblclick();
  await toolbar(page).getByRole('button', { name: 'More formatting' }).click();
  await page.getByRole('menuitem', { name: 'Highlight color' }).click();
  await page.getByRole('menuitem', { name: 'Yellow' }).click();
  await save(page).click();
  await expect(status(page)).toHaveText('Saved');
  const saved = await fs.readFile(
    path.join(PLAYGROUND, 'posts/hello-world.mdx'),
    'utf8'
  );
  expect(saved.toUpperCase()).toContain('#FEF08A');
});

test('AC18: focusing then blurring the body leaves the form clean', async ({
  page,
}) => {
  await page.goto(POST('hello-world.mdx'));
  await body(page).click();
  await page.getByRole('textbox', { name: 'title' }).click();
  await expect(status(page)).toHaveText('No changes');
  await expect(save(page)).toBeDisabled();
});

test('AC13: a link in a table cell shows the link bar and the handles without overlap', async ({
  page,
}) => {
  await page.goto(POST('long-post.mdx'));
  await body(page).getByText('Ada').first().scrollIntoViewIfNeeded();
  await body(page).getByText('Ada').first().dblclick();
  await openTool(page, 'Link');
  await page.getByRole('textbox', { name: 'Link' }).fill('https://tina.io');
  await page.getByRole('button', { name: 'OK' }).click();
  await body(page).getByText('Ada').first().click();

  const bar = page.getByRole('toolbar', { name: 'Link' });
  await expect(bar).toBeVisible();
  const row = page.getByRole('button', { name: /^Row \d+ actions$/ });
  const column = page.getByRole('button', { name: /^Column \d+ actions$/ });
  await expect(row).toBeVisible();
  await expect(column).toBeVisible();
  const barBox = await bar.boundingBox();
  for (const handle of [row, column]) {
    const box = await handle.boundingBox();
    if (!barBox || !box) throw new Error('bar or handle not drawn');
    const overlaps =
      box.x < barBox.x + barBox.width &&
      box.x + box.width > barBox.x &&
      box.y < barBox.y + barBox.height &&
      box.y + box.height > barBox.y;
    expect(overlaps).toBe(false);
  }
});

test.describe('at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('AC20: the table menu stays on screen and Escape closes only the Cell submenu', async ({
    page,
  }) => {
    await page.goto(POST('long-post.mdx'));
    await body(page).getByText('Ada').first().scrollIntoViewIfNeeded();
    await body(page).getByText('Ada').first().click();
    await page.getByRole('button', { name: /^Row \d+ actions$/ }).click();
    const menu = page.getByRole('menu').first();
    await expect(menu).toBeVisible();
    const inside = async (locator: ReturnType<Page['locator']>) => {
      const box = await locator.boundingBox();
      if (!box) throw new Error('not drawn');
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(844);
    };
    await inside(menu);
    await page.getByRole('menuitem', { name: 'Cell' }).focus();
    await page.keyboard.press('ArrowRight');
    const sub = page.getByRole('menuitem', { name: /Merge cells/ });
    await expect(sub).toBeVisible();
    await inside(page.getByRole('menu').last());
    await page.keyboard.press('Escape');
    await expect(sub).toBeHidden();
    await expect(menu).toBeVisible();
  });

  test('AC21: a menu from a toolbar low on a short screen stays inside it and scrolls', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 380 });
    await page.goto(RICH_PAGE);
    const summary = page.getByRole('textbox', { name: /^Summary/ });
    await summary.waitFor();
    const tools = page
      .getByRole('toolbar', { name: 'Formatting' })
      .filter({ has: page.getByRole('button', { name: 'Insert' }) })
      .first();
    await tools.getByRole('button', { name: 'Insert' }).click();
    const menu = page.getByRole('menu', { name: 'Insert' });
    await expect(menu).toBeVisible();
    await page.waitForTimeout(300);
    const box = await menu.boundingBox();
    if (!box) throw new Error('menu not drawn');
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(380);
  });
});

test.describe('with the keyboard up at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const KEYBOARD_TOP = 500;

  test.beforeEach(async ({ page }) => {
    await fakeVisualViewport(page);
    await page.goto(POST('long-post.mdx'));
    await expect(body(page)).toBeVisible();
  });

  test('AC21: typing after / lists rows above the keyboard', async ({
    page,
  }) => {
    await body(page).getByText('Body paragraph 1 keeps').first().click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await setKeyboardHeight(page, KEYBOARD_TOP);
    await page.keyboard.type('/head');
    const rows = page.getByRole('option');
    await expect(rows.first()).toBeVisible();
    for (const row of await rows.all()) {
      const box = await row.boundingBox();
      if (!box) continue;
      expect(box.y + box.height).toBeLessThanOrEqual(KEYBOARD_TOP);
    }
  });

  test('AC21: the code language search lists rows above the keyboard', async ({
    page,
  }) => {
    const picker = page
      .getByRole('combobox', { name: 'Code language' })
      .first();
    await picker.scrollIntoViewIfNeeded();
    await picker.click();
    await setKeyboardHeight(page, KEYBOARD_TOP);
    await page.keyboard.type('java');
    await expect(page.getByRole('option').first()).toBeVisible();
    const panel = page.getByRole('dialog').last();
    await expect
      .poll(async () => {
        const box = await panel.boundingBox();
        return box ? Math.round(box.y + box.height) : Number.NaN;
      })
      .toBeLessThanOrEqual(KEYBOARD_TOP);
    const first = await page.getByRole('option').first().boundingBox();
    expect(first ? first.y + first.height : Number.NaN).toBeLessThanOrEqual(
      KEYBOARD_TOP
    );
  });

  test('AC21: a language list opened with the keyboard already up stays above it', async ({
    page,
  }) => {
    const picker = page
      .getByRole('combobox', { name: 'Code language' })
      .first();
    await body(page).getByText('Body paragraph 1 keeps').first().tap();
    await setKeyboardHeight(page, KEYBOARD_TOP);
    await picker.evaluate((el) => el.scrollIntoView({ block: 'end' }));
    await picker.tap();
    await page.keyboard.type('pyth');
    const row = page.getByRole('option').first();
    await expect(row).toBeVisible();
    const box = await row.boundingBox();
    if (!box) throw new Error('row not drawn');
    expect(box.y + box.height).toBeLessThanOrEqual(KEYBOARD_TOP);
  });

  test('AC21: the link sheet stays above the keyboard and Cancel returns focus to the text', async ({
    page,
  }) => {
    await body(page).getByText('Body paragraph 1 keeps').first().dblclick();
    await openTool(page, 'Link');
    const input = page.getByRole('textbox', { name: 'Link' });
    await expect(input).toHaveAttribute('type', 'url');
    await setKeyboardHeight(page, KEYBOARD_TOP);
    const sheet = page.getByRole('dialog').last();
    await expect
      .poll(async () => {
        const box = await sheet.boundingBox();
        return box ? Math.round(box.y + box.height) : Number.NaN;
      })
      .toBeLessThanOrEqual(KEYBOARD_TOP);
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(body(page)).toBeFocused();
  });
});

test.describe('nested rich text', () => {
  const items = (page: Page) => page.getByRole('textbox', { name: /^Text/ });

  test('AC23: add, remove and reorder keep each item on its own item', async ({
    page,
  }) => {
    await page.goto(RICH_PAGE);
    await expect(page.getByRole('textbox', { name: /^Summary/ })).toBeVisible();
    for (const heading of ['First', 'Second']) {
      await page.getByText(heading, { exact: true }).click();
    }
    await expect(items(page)).toHaveCount(2);
    const first = items(page).first();
    const firstText = await first.innerText();
    await first.click();
    await first.pressSequentially('Edited ');
    await page.getByRole('button', { name: 'Move Item 1' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(items(page).last()).toContainText('Edited');
    await expect(items(page).first()).not.toContainText('Edited');
    await page.getByRole('button', { name: 'Add item' }).click();
    await expect(page.getByRole('textbox', { name: /^Text/ })).toHaveCount(3);
    await page.getByRole('button', { name: 'Actions for Item 3' }).click();
    await page.getByRole('menuitem', { name: /Remove/ }).click();
    await expect(page.getByRole('textbox', { name: /^Text/ })).toHaveCount(2);
    await expect(items(page).first()).not.toContainText('Edited');
    await expect(items(page).last()).toContainText('Edited');
    expect(firstText).not.toContain('Edited');
  });

  test('AC23: activating a nested field focuses its editor', async ({
    page,
  }) => {
    await page.goto(RICH_PAGE);
    await expect(page.getByRole('textbox', { name: /^Notes/ })).toBeVisible();
    const preview = page.frameLocator('iframe[title="Preview"]');
    await preview.locator('body').evaluate((root) => {
      const target = document.createElement('div');
      target.setAttribute('data-tina-field', 'section.inner.notes');
      target.textContent = 'notes';
      root.appendChild(target);
      target.click();
    });
    await expect(page.getByRole('textbox', { name: /^Notes/ })).toBeFocused();
  });
});

test.describe('blocked tools in a real browser', () => {
  const ariaOff = async (locator: ReturnType<Page['locator']>) =>
    (await locator.getAttribute('aria-disabled')) === 'true' ||
    (await locator.isDisabled());

  test('AC28: a table cell disables lists, quote and the blocked inserts for pointer and Enter', async ({
    page,
  }) => {
    await page.goto(POST('long-post.mdx'));
    await body(page).getByText('Ada').first().scrollIntoViewIfNeeded();
    await body(page).getByText('Ada').first().click();
    const tb = toolbar(page);
    await tb.getByRole('button', { name: 'More tools...' }).click();
    for (const name of ['Bulleted list', 'Numbered list', 'Quote']) {
      await expect(
        page.getByRole('dialog').getByRole('button', { name })
      ).toBeDisabled();
    }
    await page.keyboard.press('Escape');
    await tb.getByRole('button', { name: 'Insert' }).click();
    for (const name of ['Code block', 'Mermaid', 'Horizontal rule']) {
      const row = page.getByRole('menuitem', { name });
      expect(await ariaOff(row)).toBe(true);
      await row.focus();
      await page.keyboard.press('Enter');
    }
    await expect(page.getByRole('menu', { name: 'Insert' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(body(page).locator('blockquote')).toHaveCount(0);
    await tb.getByRole('button', { name: /^Text style/ }).click();
    for (const heading of ['Heading 1', 'Heading 2']) {
      await expect(
        page.getByRole('menuitemradio', { name: heading })
      ).toHaveAttribute('aria-disabled', 'true');
    }
    await page.keyboard.press('Escape');
    await body(page).getByText('Ada').first().dblclick();
    await expect(page.getByRole('button', { name: /^Text style/ })).toHaveCount(
      1
    );
    const from = await body(page).getByText('Ada').first().boundingBox();
    const to = await body(page).getByText('Lin').first().boundingBox();
    if (!from || !to) throw new Error('cells not drawn');
    await page.mouse.move(from.x + 4, from.y + 4);
    await page.mouse.down();
    await page.mouse.move(to.x + 20, to.y + 4, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    await expect(page.getByRole('button', { name: /^Text style/ })).toHaveCount(
      1
    );
  });

  test('AC28: a code block disables every tool and menu trigger', async ({
    page,
  }) => {
    await page.goto(POST('long-post.mdx'));
    await body(page)
      .getByText('const greeting')
      .first()
      .scrollIntoViewIfNeeded();
    await body(page).getByText('const greeting').first().click();
    const buttons = toolbar(page).getByRole('button');
    for (const button of await buttons.all()) {
      await expect(button).toBeDisabled();
    }
  });
});

test.describe('the More tools panel', () => {
  test('closes after Link is applied from it', async ({ page }) => {
    await page.goto(POST('long-post.mdx'));
    await body(page).getByText('Body paragraph 1 keeps').first().dblclick();
    await toolbar(page).getByRole('button', { name: 'More tools...' }).click();
    const panel = page.getByRole('dialog', { name: 'More tools' });
    await expect(panel).toBeVisible();
    await page.getByRole('button', { name: 'Link', exact: true }).click();
    await page.getByRole('textbox', { name: 'Link' }).fill('https://tina.io');
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(panel).toBeHidden();
  });

  test('closes after a list is picked from it', async ({ page }) => {
    await page.goto(POST('long-post.mdx'));
    await body(page).getByText('Body paragraph 1 keeps').first().click();
    await toolbar(page).getByRole('button', { name: 'More tools...' }).click();
    const panel = page.getByRole('dialog', { name: 'More tools' });
    await page.getByRole('button', { name: 'Bulleted list' }).click();
    await expect(panel).toBeHidden();
  });
});

test.describe('the phone keyboard toolbar', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const KEYBOARD_TOP = 500;

  test.beforeEach(async ({ page }) => {
    await fakeVisualViewport(page);
    await page.goto(POST('long-post.mdx'));
    await expect(body(page)).toBeVisible();
  });

  for (const tool of ['More tools...', 'Text style', 'Insert']) {
    test(`one tap on ${tool} opens it, on screen, with the toolbar still on the keyboard`, async ({
      page,
    }) => {
      await body(page).getByText('Body paragraph 1 keeps').first().tap();
      await setKeyboardHeight(page, KEYBOARD_TOP);
      const shell = page.locator('[data-slot="toolbar-shell"]').first();
      await expect(shell).toHaveAttribute('data-lifted', '');
      await toolbar(page)
        .getByRole('button', {
          name: new RegExp(`^${tool.replace('.', '\\.')}`),
        })
        .tap();
      const opened = page
        .getByRole('menu')
        .or(page.getByRole('dialog', { name: 'More tools' }))
        .first();
      await expect(opened).toBeVisible();
      await expect(shell).toHaveAttribute('data-lifted', '');
      const box = await opened.boundingBox();
      if (!box) throw new Error('panel not drawn');
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
      expect(box.y + box.height).toBeLessThanOrEqual(KEYBOARD_TOP);
    });
  }
});

test.describe('table controls in a real browser', () => {
  test('Add a column sits past the table end and covers no cell', async ({
    page,
  }) => {
    await page.goto(POST('long-post.mdx'));
    await body(page).getByText('Ada').first().scrollIntoViewIfNeeded();
    await body(page).getByText('Ada').first().click();
    const add = page.getByRole('button', { name: 'Add a column' });
    await expect(add).toBeVisible();
    const strip = await add.boundingBox();
    const cells = await body(page).locator('td').all();
    for (const cell of cells) {
      const box = await cell.boundingBox();
      if (!strip || !box) throw new Error('not drawn');
      const overlaps =
        strip.x < box.x + box.width - 1 &&
        strip.x + strip.width > box.x + 1 &&
        strip.y < box.y + box.height &&
        strip.y + strip.height > box.y;
      expect(overlaps).toBe(false);
    }
  });

  test('dragging across cells marks them aria-selected', async ({ page }) => {
    await page.goto(POST('long-post.mdx'));
    const from = body(page).getByText('Ada').first();
    await from.scrollIntoViewIfNeeded();
    const a = await from.boundingBox();
    const b = await body(page).getByText('Lin').first().boundingBox();
    if (!a || !b) throw new Error('cells not drawn');
    await page.mouse.move(a.x + 4, a.y + 4);
    await page.mouse.down();
    await page.mouse.move(b.x + 20, b.y + 4, { steps: 8 });
    await page.mouse.up();
    await expect(
      body(page).locator('td[aria-selected="true"]').first()
    ).toBeVisible();
  });

  test('Delete row is disabled when only the header and one body row are left', async ({
    page,
  }) => {
    await page.goto(POST('hello-world.mdx'));
    await body(page).click();
    await page.keyboard.press('ControlOrMeta+End');
    await toolbar(page).getByRole('button', { name: 'Insert' }).click();
    await page.getByRole('menuitem', { name: 'Table', exact: true }).click();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await body(page).locator('td').first().click();
    await page.getByRole('button', { name: /^Row \d+ actions$/ }).click();
    await expect(
      page.getByRole('menuitem', { name: 'Delete row' })
    ).toHaveAttribute('aria-disabled', 'true');
  });

  test.describe('at 375px', () => {
    test.use({ viewport: { width: 375, height: 800 }, hasTouch: true });

    test('the table size picker and its label stay on screen', async ({
      page,
    }) => {
      await page.goto(POST('hello-world.mdx'));
      await body(page).getByText('prose').first().tap();
      await toolbar(page).getByRole('button', { name: 'Insert' }).tap();
      const picker = page.getByRole('menuitem', { name: /by \d+ table$/ });
      await expect(picker).toBeVisible();
      const pickerBox = await picker.boundingBox();
      if (!pickerBox) throw new Error('picker not drawn');
      expect(pickerBox.x).toBeGreaterThanOrEqual(0);
      expect(pickerBox.x + pickerBox.width).toBeLessThanOrEqual(375);
      for (const key of [
        'ArrowRight',
        'ArrowRight',
        'ArrowRight',
        'ArrowRight',
        'ArrowRight',
        'ArrowRight',
      ]) {
        await picker.press(key);
      }
      await expect(picker).toHaveAccessibleName('Insert a 2 by 8 table');
      const label = page.getByText(/^\d+ x \d+$/);
      const labelBox = await label.first().boundingBox();
      expect(
        labelBox ? labelBox.x + labelBox.width : Number.NaN
      ).toBeLessThanOrEqual(375);
    });
  });
});
