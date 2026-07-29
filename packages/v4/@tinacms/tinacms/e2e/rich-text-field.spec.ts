import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { setColumnWidth, toolbar } from './form-column';

// Two rich-text guarantees that only a real browser can check. Both of these
// shipped broken and were caught by hand; this is what stops that recurring.

const body = (page: import('@playwright/test').Page) =>
  page.getByRole('textbox', { name: 'body' });

const status = (page: import('@playwright/test').Page) =>
  page.locator('aside').getByText(/^(pristine|dirty|clean)$/);

// These tests really save, so they really write to the playground's content.
// Snapshot it and put it back, or a test run leaves the repo dirty.
const CONTENT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../playground/content/posts'
);
const snapshot = new Map<string, string>();

test.beforeAll(async () => {
  for (const name of await fs.readdir(CONTENT_DIR)) {
    const file = path.join(CONTENT_DIR, name);
    snapshot.set(file, await fs.readFile(file, 'utf8'));
  }
});

test.afterAll(async () => {
  await Promise.all(
    [...snapshot].map(([file, contents]) => fs.writeFile(file, contents))
  );
});

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(body(page)).toBeVisible();
});

test.describe('rich-text layout', () => {
  // FieldWrapper is a grid, so the editor's wrapper is a grid item and defaults
  // to `min-width: auto` — without min-w-0 it refuses to shrink below Plate's
  // intrinsic width and spills out of the sidebar. A single paragraph fits
  // either way; an indented list is what exposes it, so this opens the document
  // that has one.
  test('the editor stays inside the sidebar, even with nested lists', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'second-post.mdx' }).click();
    await expect(body(page)).toContainText('bullet point');

    const overflow = await page.locator('aside').evaluate((aside) => ({
      client: aside.clientWidth,
      scroll: aside.scrollWidth,
    }));
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);

    // And the editor itself fits the track rather than defining it.
    const fits = await body(page).evaluate((editor) => {
      const track = editor.closest('aside') as HTMLElement;
      return editor.clientWidth <= track.clientWidth;
    });
    expect(fits).toBe(true);
  });

  // The toolbar decides how many tools to show from a table of pixel widths, one entry
  // per control. Nothing derives that table from the buttons, so it drifts the moment a
  // button changes. When it does, the row runs past its container and `overflow-hidden`
  // takes the last control off screen — silently, because a clipped button still reports
  // as rendered and still answers a click that lands where it used to be. This asserts
  // the property the table exists to hold, at the widths the column can take.
  test('the toolbar fits its column at every width the column can take', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1800, height: 900 });
    await openDocument(page, 'second-post.mdx');

    for (const columnWidth of [352, 420, 480, 560, 700, 900, 1200]) {
      await setColumnWidth(page, columnWidth);

      const row = await toolbar(page).evaluate((container) => {
        const controls = Array.from(
          (container.firstElementChild as HTMLElement).children
        );
        return {
          container: container.getBoundingClientRect().width,
          controls: controls.reduce(
            (total, control) => total + control.getBoundingClientRect().width,
            0
          ),
        };
      });

      expect(
        row.controls,
        `toolbar controls overflow a ${columnWidth}px column`
      ).toBeLessThanOrEqual(row.container);
    }
  });
});

test.describe('rich-text save lifecycle', () => {
  // Both of these really write hello-world.mdx; in parallel they would race on
  // the same file. The layout test opens a different document and stays parallel.
  test.describe.configure({ mode: 'serial' });

  // The store compares values by reference but is fed RHF's clone, so a
  // structured value could never diff equal and a saved document stayed dirty
  // forever. Plate also re-emits a normalized AST (node ids, a trailing block)
  // that never matches what was parsed off disk, which made a bare click look
  // like an edit. Typing here is real, so both are exercised end to end.
  test('goes pristine -> dirty on a real edit -> clean once saved', async ({
    page,
  }) => {
    await expect(status(page)).toHaveText('pristine');

    // Focusing and moving the caret is not an edit.
    await body(page).click();
    await expect(status(page)).toHaveText('pristine');

    await body(page).pressSequentially('Edited. ');
    await expect(status(page)).toHaveText('dirty');

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(status(page)).toHaveText('clean');
  });

  // Typing and then deleting what was typed leaves the file it would write unchanged,
  // so the document is not edited any more. The tree Plate holds is not the tree the
  // document was parsed from — Plate adds node ids and a trailing block — so a compare
  // of the two trees answers "edited" for a document that has returned to its contents
  // on disk, and the badge then never leaves "Unsaved".
  test('typing and then deleting it returns the document to clean', async ({
    page,
  }) => {
    await expect(status(page)).toHaveText('No changes');

    await body(page).click();
    await body(page).pressSequentially('Edited.');
    await expect(status(page)).toHaveText('Unsaved');

    // "Saved", and not "No changes": the form has been edited, and its values match the
    // file again. Only a form that was never edited is pristine.
    for (const _ of 'Edited.') await page.keyboard.press('Backspace');
    await expect(status(page)).toHaveText('Saved');
  });

  test('a second edit after saving can also reach clean', async ({ page }) => {
    await body(page).click();
    await body(page).pressSequentially('One. ');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(status(page)).toHaveText('clean');

    await body(page).pressSequentially('Two. ');
    await expect(status(page)).toHaveText('dirty');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(status(page)).toHaveText('clean');
  });
});
