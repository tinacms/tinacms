import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { setColumnWidth, toolbar } from './form-column';

// Two guarantees of the rich-text field that only a real browser can check. Both of them
// shipped broken, and a person found them by hand. These tests stop that.

const body = (page: import('@playwright/test').Page) =>
  page.getByRole('textbox', { name: 'body' });

// The admin shell marks the open document in the header of its form, and it marks every
// other document in the document list. This locator reads the header only, so the two
// never cross. The match is exact, because the document list marks an edited document
// "Unsaved". That word holds "Save", so a substring match would also find the list entry.
const saveButton = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: 'Save', exact: true });

const status = (page: import('@playwright/test').Page) =>
  page.locator('aside header').getByText(/^(No changes|Unsaved|Saved)$/);

// The admin opens on the collection list, so a test must navigate to a document. A deep
// link is the shortest way in, and it also exercises the route.
const openDocument = async (
  page: import('@playwright/test').Page,
  name: string
) => {
  await page.goto(
    `/#/collections/post/${encodeURIComponent(`content/posts/${name}`)}`
  );
  await expect(body(page)).toBeVisible();
};

// These tests save, so they write to the content of the playground. Copy that content
// first, and write it back after, or a test run leaves the repository dirty.
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
  // FieldWrapper is a grid, so the wrapper of the editor is a grid item and defaults
  // to `min-width: auto`. Without min-w-0, it refuses to become narrower than Plate,
  // and it spills out of the sidebar. One paragraph fits in both cases. An indented
  // list shows the fault, so this test opens the document that has one.
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

    // The editor fits the grid track, and does not set its width.
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
  // Both of these tests write hello-world.mdx. In parallel, they would race on that
  // one file. The layout test opens another document, so it stays parallel.
  test.describe.configure({ mode: 'serial' });

  // This test also guards the pinned document entry of the admin shell. A save writes
  // the stored document back into the list cache of the content slice. Without the
  // pin, that read ingests the document again and resets RHF, and the form never
  // becomes clean. It happens only for a field whose stored form differs from its
  // editor value. The rich-text field parses markdown into a tree, and Plate then
  // normalizes that tree. A unit test on a plain field cannot see it, so this test is
  // the guard.
  //
  // The store compares values by reference, but it receives the clone from RHF. A
  // structured value could therefore never compare equal, and a saved document stayed
  // dirty for ever. Plate also emits a normalized tree, with node ids and a trailing
  // block, which never matches the tree parsed from the disk. A click alone then
  // looked like an edit. This test types real text, so it covers both faults.
  test('goes pristine -> dirty on a real edit -> clean once saved', async ({
    page,
  }) => {
    await expect(status(page)).toHaveText('No changes');

    // A focus, and a move of the caret, are not an edit.
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
