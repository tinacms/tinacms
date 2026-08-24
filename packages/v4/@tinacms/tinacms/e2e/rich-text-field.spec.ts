import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { setColumnWidth, toolbar } from './form-column';

const body = (page: import('@playwright/test').Page) =>
  page.getByRole('textbox', { name: 'body' });

const saveButton = (page: import('@playwright/test').Page) =>
  page.locator('aside').getByRole('button', { name: 'Save', exact: true });

const status = (page: import('@playwright/test').Page) =>
  page.locator('aside header').getByText(/^(No changes|Unsaved|Saved)$/);

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
