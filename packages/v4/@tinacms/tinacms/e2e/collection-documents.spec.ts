import { promises as fs } from 'node:fs';
import path from 'node:path';
import { type Locator, type Page, expect, test } from '@playwright/test';

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

const BULK = path.join(POSTS, 'bulk');

const withBulkFolder = async (run: () => Promise<void>) => {
  await fs.mkdir(BULK, { recursive: true });
  await Promise.all(
    Array.from({ length: 120 }, (_, index) =>
      fs.writeFile(
        path.join(BULK, `b${String(index).padStart(3, '0')}.mdx`),
        `---\ntitle: Bulk ${String(index).padStart(3, '0')}\n---\n\nBody.\n`
      )
    )
  );
  try {
    await run();
  } finally {
    await fs.rm(BULK, { recursive: true, force: true });
  }
};

const BULK_HASH = '#/collections/post/folder/bulk';
const HOLD_MS = 450;

// Delays every list request after `slow.on` is set, so a refetch is observable in a real browser.
const slowLists = async (page: Page) => {
  const slow = { on: false };
  await page.route('**/api/tina/content', async (route) => {
    const body = route.request().postDataJSON() as { op?: string } | null;
    if (slow.on && body?.op === 'list') {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    await route.continue();
  });
  return slow;
};

const openBulk = async (page: Page) => {
  await page.goto(`/${BULK_HASH}`);
  await page.reload();
  await expect(page.getByText('Page 1 of 3')).toBeVisible();
};

// Two raw mouse clicks `gap` ms apart on the spot where the button is now, as a double click lands.
// No actionability wait runs between them, so a loaded runner cannot stretch the gap.
const clickTwiceAt = async (page: Page, target: Locator, gap: number) => {
  const box = await target.boundingBox();
  expect(box).not.toBeNull();
  const x = (box?.x ?? 0) + (box?.width ?? 0) / 2;
  const y = (box?.y ?? 0) + (box?.height ?? 0) / 2;
  await page.mouse.click(x, y);
  await page.waitForTimeout(gap);
  await page.mouse.click(x, y);
};

const nextPage = async (page: Page, label: string) => {
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText(label)).toBeVisible();
  await page.waitForTimeout(HOLD_MS);
};

test('a filter refetch keeps the old rows live, so a click on one opens it', async ({
  page,
}) => {
  await withBulkFolder(async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const slow = await slowLists(page);
    await openBulk(page);
    slow.on = true;
    await page.getByPlaceholder(/Filter by title/).fill('Bulk');
    await expect(page.locator('[aria-busy="true"]')).toBeVisible();
    expect(await page.locator('[data-rows-locked]').count()).toBe(0);
    const box = await page
      .getByRole('button', { name: /^Bulk \d+$/ })
      .first()
      .boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.click(
      (box?.x ?? 0) + (box?.width ?? 0) / 2,
      (box?.y ?? 0) + (box?.height ?? 0) / 2
    );
    // Well inside the 1.5 s the held list takes, so the click went to the old row.
    await expect(page).toHaveURL(/collections\/post\/content/, {
      timeout: 700,
    });
  });
});

for (const width of [1440, 390]) {
  test(`a double click on Previous never reaches a row at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await withBulkFolder(async () => {
      await page.setViewportSize({ width, height: 844 });
      const slow = await slowLists(page);
      for (const mode of ['cached', 'slow'] as const) {
        for (const gap of [60, 120, 250]) {
          slow.on = false;
          await openBulk(page);
          await nextPage(page, 'Page 2 of 3');
          await nextPage(page, 'Page 3 of 3');
          slow.on = mode === 'slow';
          await clickTwiceAt(
            page,
            page.getByRole('button', { name: 'Previous' }),
            gap
          );
          await page.waitForTimeout(2000);
          expect(page.url()).toContain(BULK_HASH);
          // A slow list takes 1.5 s here and longer on a loaded runner.
          await expect(page.getByText('Page 2 of 3')).toBeVisible({
            timeout: 15_000,
          });
        }
      }
    });
  });

  test(`a double click on Next from page 1 with page 2 cached lands on page 2 at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await withBulkFolder(async () => {
      await page.setViewportSize({ width, height: 844 });
      await openBulk(page);
      await nextPage(page, 'Page 2 of 3');
      await page.getByRole('button', { name: 'Previous' }).click();
      await expect(page.getByText('Page 1 of 3')).toBeVisible();
      await page.waitForTimeout(HOLD_MS);
      for (const gap of [60, 120, 250]) {
        await clickTwiceAt(
          page,
          page.getByRole('button', { name: 'Next' }),
          gap
        );
        await page.waitForTimeout(800);
        expect(page.url()).toContain(BULK_HASH);
        await expect(page.getByText('Page 2 of 3')).toBeVisible({
          timeout: 15_000,
        });
        await page.getByRole('button', { name: 'Previous' }).click();
        await expect(page.getByText('Page 1 of 3')).toBeVisible();
        await page.waitForTimeout(HOLD_MS);
      }
    });
  });
}
