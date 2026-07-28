import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

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
