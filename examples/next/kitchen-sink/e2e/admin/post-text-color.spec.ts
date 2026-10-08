import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import type { Locator, Page } from '@playwright/test';
import { expect, test } from '../fixtures/test-content';
import {
  clickSave,
  navigateToCreate,
  navigateToEdit,
} from '../utils/admin-helpers';
import { deleteDocument } from '../utils/delete-document';

const POST_TITLE = 'E2E Text Color Post';
const POST_SLUG = 'e2e-text-color-post';
const POST_RELATIVE_PATH = `${POST_SLUG}.md`;
const POST_FILE = fileURLToPath(
  new URL(
    `../../../../shared/content/posts/${POST_RELATIVE_PATH}`,
    import.meta.url
  )
);

const BODY_TEXT = 'Start crimson bright and marked words end';

// Default palettes: text Red #CC4141 / Blue #0066CC, highlight Yellow #FEF08A
const RED = 'rgb(204, 65, 65)';
const BLUE = 'rgb(0, 102, 204)';
const YELLOW = 'rgb(254, 240, 138)';

const bodyEditor = (page: Page) =>
  page
    .locator('div:has(> label:text-is("Body"))')
    .first()
    .locator('[contenteditable="true"]')
    .first();

/**
 * Select `text` inside the editor via a DOM range. Slate syncs its own
 * selection from `selectionchange`, so wait until the browser reports it.
 */
async function selectText(editor: Locator, text: string): Promise<void> {
  await editor.evaluate((root, target) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const start = node.textContent?.indexOf(target) ?? -1;
      if (start === -1) continue;
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, start + target.length);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return;
    }
    throw new Error(`Text "${target}" not found in editor`);
  }, text);
  await expect
    .poll(() => editor.evaluate(() => window.getSelection()?.toString()))
    .toBe(text);
  // Let slate-react's throttled selectionchange handler catch up
  await editor.page().waitForTimeout(200);
}

/** Pick a colour from one of the toolbar colour dropdowns. */
async function applyColor(
  page: Page,
  dropdown: 'Text color' | 'Highlight color',
  color: string
): Promise<void> {
  // Toolbar dropdown triggers are Radix toggle items, exposed as radios
  await page.getByRole('radio', { name: dropdown }).click();
  await page.getByRole('menuitem', { name: color, exact: true }).click();
}

test.describe('Post rich-text text colour', () => {
  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext({
      baseURL: process.env.GRAPHQL_URL ?? 'http://localhost:4001',
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
    try {
      await deleteDocument(ctx, 'post', POST_RELATIVE_PATH);
    } catch {
      // Document may not exist — that's fine
    }
    await ctx.dispose();
  });

  test('applies text colour, saves MDX, and round-trips to the frontend', async ({
    page,
    contentCleanup,
  }) => {
    await navigateToCreate(page, 'post');
    await page.fill('input[name="title"]', POST_TITLE);

    const editor = bodyEditor(page);
    await editor.click();
    await page.keyboard.type(BODY_TEXT);

    // Red text with bold nested inside it
    await selectText(editor, 'crimson bright');
    await applyColor(page, 'Text color', 'Red');
    await selectText(editor, 'bright');
    await page.keyboard.press('ControlOrMeta+b');

    // Highlight and text colour on the same run
    await selectText(editor, 'marked');
    await applyColor(page, 'Highlight color', 'Yellow');
    await selectText(editor, 'marked');
    await applyColor(page, 'Text color', 'Blue');

    contentCleanup.track('post', POST_RELATIVE_PATH);
    await clickSave(page);

    await expect
      .poll(() => readFileSync(POST_FILE, 'utf8'))
      .toContain(
        '<span style={{ color: "#CC4141" }}>crimson </span>**<span style={{ color: "#CC4141" }}>bright</span>**'
      );
    expect(readFileSync(POST_FILE, 'utf8')).toContain(
      '<mark style={{ backgroundColor: "#FEF08A" }}><span style={{ color: "#0066CC" }}>marked</span></mark>'
    );

    // Round-trip: the reloaded editor parses the MDX back into coloured leaves
    await navigateToEdit(page, 'post', POST_SLUG);
    const reloaded = bodyEditor(page);
    await expect(
      reloaded.locator('.slate-textColor', { hasText: 'crimson' })
    ).toHaveCSS('color', RED);
    // Bold inside the red leaf stays red (prose styles colour <strong> directly)
    await expect(
      reloaded.locator('.slate-textColor strong', { hasText: 'bright' })
    ).toHaveCSS('color', RED);
    const editorMark = reloaded.locator('mark', { hasText: 'marked' });
    await expect(editorMark).toHaveCSS('background-color', YELLOW);
    await expect(editorMark).toHaveCSS('color', BLUE);

    // Frontend: TinaMarkdown renders the colours
    await page.goto(`/posts/${POST_SLUG}`);
    const prose = page.locator('.prose');
    await expect(prose.getByText('crimson', { exact: true })).toHaveCSS(
      'color',
      RED
    );
    // TinaMarkdown nests the colour inside <strong>, so bold text stays red
    await expect(prose.getByText('bright', { exact: true })).toHaveCSS(
      'color',
      RED
    );
    const frontendMark = prose.locator('mark', { hasText: 'marked' });
    await expect(frontendMark).toHaveCSS('background-color', YELLOW);
    await expect(frontendMark.locator('span')).toHaveCSS('color', BLUE);
  });
});
