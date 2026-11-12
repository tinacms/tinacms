import { promises as fs } from 'node:fs';
import path from 'node:path';
import { type Locator, expect, test } from '@playwright/test';

const POSTS = path.resolve('playground/content/posts');
const LINKED = path.join(POSTS, 'guides/getting-started.mdx');
const RENAMED = path.join(POSTS, 'guides/started-guide.mdx');
const REFERRER = path.join(POSTS, 'related-post.mdx');

test.describe.configure({ mode: 'serial' });

test('renaming a post rewrites the post that references it', async ({
  page,
}) => {
  const linkedBefore = await fs.readFile(LINKED, 'utf8');
  const referrerBefore = await fs.readFile(REFERRER, 'utf8');
  try {
    await page.goto('/#/collections/post/folder/guides');
    await page
      .getByRole('button', { name: 'Actions for Getting started' })
      .click();
    await page.getByRole('menuitem', { name: 'Rename' }).click();
    await page
      .getByRole('textbox', { name: 'File name' })
      .fill('started-guide');
    await page.getByRole('button', { name: 'Rename' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.reload();
    await expect(
      page.getByRole('button', { name: 'Getting started', exact: true })
    ).toBeVisible();
    await expect(fs.readFile(RENAMED, 'utf8')).resolves.toContain(
      'A post in a nested folder.'
    );
    await expect(fs.access(LINKED)).rejects.toThrow();
    const referrer = await fs.readFile(REFERRER, 'utf8');
    expect(referrer).toContain(
      'related: content/posts/guides/started-guide.mdx'
    );
    expect(referrer).not.toContain('getting-started.mdx');
  } finally {
    await fs.rm(RENAMED, { force: true });
    await fs.writeFile(LINKED, linkedBefore);
    await fs.writeFile(REFERRER, referrerBefore);
  }
});

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

test('the row menu shows on hover and on keyboard focus on a device that hovers', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/collections/post/folder/guides');
  const menu = page.getByRole('button', {
    name: 'Actions for Getting started',
  });
  await expect(menu).toBeAttached();
  await page.mouse.move(5, 5);
  await expect.poll(() => effectiveOpacity(menu)).toBe(0);

  await page
    .getByRole('button', { name: 'Getting started', exact: true })
    .hover();
  await expect.poll(() => effectiveOpacity(menu)).toBe(1);

  await page.mouse.move(5, 5);
  await expect.poll(() => effectiveOpacity(menu)).toBe(0);
  await page
    .getByRole('button', { name: 'Getting started', exact: true })
    .focus();
  await page.keyboard.press('Tab');
  await expect(menu).toBeFocused();
  await expect.poll(() => effectiveOpacity(menu)).toBe(1);
});

test('deleting a document discards its stored unsaved edit although its editor is closed', async ({
  page,
}) => {
  const original = await fs.readFile(LINKED, 'utf8');
  const documentHash = `/#/collections/post/${encodeURIComponent('content/posts/guides/getting-started.mdx')}`;
  try {
    await page.goto(documentHash);
    const title = page.getByRole('textbox', { name: /^Title/ });
    await title.fill('Edited but not saved');

    await page.goto('/#/collections/post/folder/guides');
    const row = page.getByRole('row', { name: /Getting started/ });
    await expect(row).toContainText('Unsaved');

    await page
      .getByRole('button', { name: 'Actions for Getting started' })
      .click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.getByRole('alertdialog')).toContainText('unsaved edits');
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.getByRole('alertdialog')).toBeHidden();
    await expect(fs.access(LINKED)).rejects.toThrow();
    await expect(page.getByRole('contentinfo')).not.toContainText(
      'Unsaved changes'
    );

    await fs.writeFile(LINKED, original);
    await page.reload();
    await expect(
      page.getByRole('row', { name: /Getting started/ })
    ).not.toContainText('Unsaved');
    await page.goto(documentHash);
    await page.reload();
    await expect(page.getByRole('textbox', { name: /^Title/ })).toHaveValue(
      'Getting started'
    );
  } finally {
    await fs.writeFile(LINKED, original);
  }
});

test('one long unbroken title keeps every row menu on screen', async ({
  page,
}) => {
  const long = path.join(POSTS, 'guides/long-title.mdx');
  await fs.writeFile(long, `---\ntitle: ${'X'.repeat(300)}\n---\n\nBody.\n`);
  try {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/#/collections/post/folder/guides');
      await page.reload();
      await expect(
        page.getByRole('button', { name: /^Actions for X/ })
      ).toBeVisible();
      for (const menu of await page
        .getByRole('button', { name: /^Actions for/ })
        .all()) {
        const box = await menu.boundingBox();
        expect(box).not.toBeNull();
        expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        )
      ).toBeLessThanOrEqual(0);
    }
  } finally {
    await fs.rm(long, { force: true });
  }
});

test('the Deleted toast stays when deleting the last row of the last page', async ({
  page,
}) => {
  const folder = path.join(POSTS, 'many');
  await fs.mkdir(folder, { recursive: true });
  await Promise.all(
    Array.from({ length: 51 }, (_, index) =>
      fs.writeFile(
        path.join(folder, `p${String(index).padStart(2, '0')}.mdx`),
        `---\ntitle: Many ${String(index).padStart(2, '0')}\n---\n\nBody.\n`
      )
    )
  );
  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#/collections/post/folder/many');
    await page.reload();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Page 2 of 2')).toBeVisible();
    await page.getByRole('button', { name: /^Actions for/ }).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.getByText('Many 00')).toBeVisible();
    const toast = page.getByText(/^Deleted /);
    await expect(toast).toBeVisible();
    await page.waitForTimeout(2500);
    await expect(toast).toBeVisible();
  } finally {
    await fs.rm(folder, { recursive: true, force: true });
  }
});
