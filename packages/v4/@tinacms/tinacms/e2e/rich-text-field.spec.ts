import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { setColumnWidth, toolbar } from './form-column';

// Two rich-text guarantees that only a real browser can check. Both of these
// shipped broken and were caught by hand; this is what stops that recurring.

const body = (page: import('@playwright/test').Page) =>
  page.getByRole('textbox', { name: 'body' });

// The admin shell badges the OPEN document in its form header; the document list
// badges every other one. Scoped to the header so the two never cross.
// Exact, because the document list badges an edited document "Unsaved" — which
// contains "Save", so a substring match resolves to the list entry as well.
const saveButton = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: 'Save', exact: true });

const status = (page: import('@playwright/test').Page) =>
  page.locator('aside header').getByText(/^(No changes|Unsaved|Saved)$/);

// The admin opens on the collection list, so a document has to be navigated to.
// Deep-linking is the shortest way in and exercises the route at the same time.
const openDocument = async (
  page: import('@playwright/test').Page,
  name: string
) => {
  await page.goto(
    `/#/collections/post/${encodeURIComponent(`content/posts/${name}`)}`
  );
  await expect(body(page)).toBeVisible();
};

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
  await openDocument(page, 'hello-world.mdx');
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
    await openDocument(page, 'second-post.mdx');
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

  // This also guards the admin shell's pinned document entry. A save feeds the
  // persisted document back into the content slice's list cache; read unpinned, that
  // re-ingests and resets RHF, and the form never reaches clean. It reproduces only
  // for a field whose stored form differs from its editor value — rich-text parses
  // markdown to an AST Plate then normalizes — so a plain-field unit test cannot see
  // it, and this is the guard.
  //
  // The store compares values by reference but is fed RHF's clone, so a
  // structured value could never diff equal and a saved document stayed dirty
  // forever. Plate also re-emits a normalized AST (node ids, a trailing block)
  // that never matches what was parsed off disk, which made a bare click look
  // like an edit. Typing here is real, so both are exercised end to end.
  test('goes pristine -> dirty on a real edit -> clean once saved', async ({
    page,
  }) => {
    await expect(status(page)).toHaveText('No changes');

    // Focusing and moving the caret is not an edit.
    await body(page).click();
    await expect(status(page)).toHaveText('No changes');

    await body(page).pressSequentially('Edited. ');
    await expect(status(page)).toHaveText('Unsaved');

    await saveButton(page).click();
    await expect(status(page)).toHaveText('Saved');
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
    await saveButton(page).click();
    await expect(status(page)).toHaveText('Saved');

    await body(page).pressSequentially('Two. ');
    await expect(status(page)).toHaveText('Unsaved');
    await saveButton(page).click();
    await expect(status(page)).toHaveText('Saved');
  });
});
