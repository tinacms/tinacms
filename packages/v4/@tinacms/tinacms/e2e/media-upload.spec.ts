import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Locator, type Page, expect, test } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(here, '../playground/public/uploads');
const HOME_FILE = path.join(here, '../playground/content/pages/home.mdx');
const HOME_ROUTE = `/#/collections/page/${encodeURIComponent('content/pages/home.mdx')}`;

const svg = (label: string) =>
  `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='30'><title>${label}</title><rect width='100%' height='100%' fill='teal'/></svg>`;

const svgFile = (name: string) => ({
  name,
  mimeType: 'image/svg+xml',
  buffer: Buffer.from(svg(name)),
});

let seededUploads: string[] = [];
let seededHome = '';

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  seededUploads = await fs.readdir(UPLOADS_DIR);
  seededHome = await fs.readFile(HOME_FILE, 'utf8');
});

const restore = async () => {
  for (const name of await fs.readdir(UPLOADS_DIR)) {
    if (!seededUploads.includes(name)) {
      await fs.rm(path.join(UPLOADS_DIR, name), { recursive: true });
    }
  }
  await fs.writeFile(HOME_FILE, seededHome);
};

test.afterEach(restore);

// Holds every upload request until `release` runs, so the running look can be read.
const holdUploads = async (page: Page) => {
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/upload', async (route) => {
    await gate;
    await route.continue();
  });
  return () => release();
};

const dropFile = async (target: Locator, name: string) => {
  const dataTransfer = await target.page().evaluateHandle(
    ({ fileName, body }) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([body], fileName, { type: 'image/svg+xml' }));
      return transfer;
    },
    { fileName: name, body: svg(name) }
  );
  await target.dispatchEvent('dragenter', { dataTransfer });
  await target.dispatchEvent('dragover', { dataTransfer });
  await target.dispatchEvent('drop', { dataTransfer });
};

const sidewaysOverflow = (page: Page) =>
  page.evaluate(() => {
    const root = document.scrollingElement;
    return root ? root.scrollWidth - root.clientWidth : 0;
  });

const leftEdge = async (button: Locator) => {
  const box = await button.boundingBox();
  expect(box).not.toBeNull();
  return Math.round(box?.x ?? Number.NaN);
};

test('uploads two files, numbers a taken name, marks them New, and Upload stays in place', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#/screens/media');
  const pane = page.getByRole('complementary', { name: 'Media' });
  await expect(pane.getByRole('button', { name: 'preview.svg' })).toBeVisible();

  const idle = pane.getByRole('button', { name: 'Upload', exact: true });
  const idleEdge = await leftEdge(idle);
  const header = pane.locator('[data-slot=panel-header]');
  await expect(header.getByRole('button').nth(-3)).toHaveText('Upload');

  const release = await holdUploads(page);
  await pane
    .getByLabel('Choose files to upload')
    .setInputFiles([svgFile('preview.svg'), svgFile('e2e-fresh.svg')]);

  const running = pane.getByRole('button', { name: 'Uploading 1 of 2' });
  await expect(running).toBeVisible();
  expect(await leftEdge(running)).toBe(idleEdge);

  await running.click();
  const list = page.getByRole('list', { name: 'Uploads' });
  await expect(list).toBeFocused();
  await expect(list.getByRole('listitem')).toHaveCount(2);
  await expect(
    list.getByRole('button', { name: 'Cancel uploading e2e-fresh.svg' })
  ).toBeVisible();

  release();
  await expect(
    list.getByText('preview.svg was taken, saved as preview-1.svg')
  ).toBeVisible();
  await expect(list.getByText('Uploaded to Media')).toBeVisible();

  const done = pane.getByRole('button', { name: '2 uploaded' });
  await expect(done).toBeVisible();
  expect(await leftEdge(done)).toBe(idleEdge);

  await page.keyboard.press('Escape');
  await expect(done).toBeFocused();

  const fresh = pane.getByRole('button', { name: /^e2e-fresh\.svg/ });
  const numbered = pane.getByRole('button', { name: /^preview-1\.svg/ });
  await expect(fresh).toContainText('New');
  await expect(numbered).toContainText('New');
  await expect(
    pane.getByRole('button', { name: /^preview-1\.svg/ })
  ).toHaveCount(1);

  const onDisk = await fs.readdir(UPLOADS_DIR);
  expect(onDisk).toContain('preview-1.svg');
  expect(onDisk).toContain('e2e-fresh.svg');
  expect(onDisk.filter((name) => name.startsWith('.'))).toEqual([]);
  expect(
    await fs.readFile(path.join(UPLOADS_DIR, 'preview.svg'), 'utf8')
  ).not.toBe(svg('preview.svg'));
  expect(
    await fs.readFile(path.join(UPLOADS_DIR, 'preview-1.svg'), 'utf8')
  ).toBe(svg('preview.svg'));
});

test('a failed upload shows the red count on Upload at the same place', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#/screens/media');
  const pane = page.getByRole('complementary', { name: 'Media' });
  const idle = pane.getByRole('button', { name: 'Upload', exact: true });
  const idleEdge = await leftEdge(idle);

  await page.route('**/upload', (route) => route.abort());
  await pane
    .getByLabel('Choose files to upload')
    .setInputFiles([svgFile('e2e-offline.svg')]);

  const failed = pane.getByRole('button', {
    name: /^Upload\s*, 1 couldn't upload$/,
  });
  await expect(failed).toBeVisible();
  expect(await leftEdge(failed)).toBe(idleEdge);

  await failed.click();
  await expect(
    page.getByRole('button', { name: 'Retry uploading e2e-offline.svg' })
  ).toBeVisible();
  expect(await fs.readdir(UPLOADS_DIR)).not.toContain('e2e-offline.svg');
});

test('a file dropped on an image field uploads, fills the field and saves to the document', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(HOME_ROUTE);
  const field = page.getByRole('group', { name: 'Hero image' });
  await expect(field).toBeVisible();

  const release = await holdUploads(page);
  await dropFile(field, 'e2e-hero.svg');
  await expect(field.getByText(/^Uploading/)).toBeVisible();
  release();

  await expect(
    field.getByRole('button', { name: 'Replace e2e-hero.svg' })
  ).toBeVisible();
  await expect(field.getByRole('img', { name: 'e2e-hero.svg' })).toBeVisible();

  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect
    .poll(async () => fs.readFile(HOME_FILE, 'utf8'))
    .toContain('hero: e2e-hero.svg');

  await page.reload();
  await expect(
    page
      .getByRole('group', { name: 'Hero image' })
      .getByRole('button', { name: 'Replace e2e-hero.svg' })
  ).toBeVisible();
  expect(await fs.readdir(UPLOADS_DIR)).toContain('e2e-hero.svg');
});

test('at 390px the Upload looks and a list of 10 files fit the screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/screens/media');
  const pane = page.getByRole('complementary', { name: 'Media' });
  await expect(pane.getByRole('button', { name: 'preview.svg' })).toBeVisible();
  expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0);

  const release = await holdUploads(page);
  await pane
    .getByLabel('Choose files to upload')
    .setInputFiles(
      Array.from({ length: 10 }, (_, index) =>
        svgFile(`e2e-a-long-file-name-for-a-narrow-screen-${index}.svg`)
      )
    );
  const running = pane.getByRole('button', { name: 'Uploading 1 of 10' });
  await expect(running).toBeVisible();
  expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0);

  await running.click();
  const list = page.getByRole('list', { name: 'Uploads' });
  await expect(list.getByRole('listitem')).toHaveCount(10);
  const popup = page.locator('[data-upload-list]');
  const box = await popup.boundingBox();
  expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390);
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(844);
  const scrolls = await list.evaluate(
    (element) => element.scrollHeight > element.clientHeight
  );
  expect(scrolls).toBe(true);
  expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0);

  release();
  await expect(pane.getByRole('button', { name: '10 uploaded' })).toBeVisible();
  expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0);
});

test('at 390px the image field fits while it uploads, after a taken name, on a failure and in the replace confirm', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(HOME_ROUTE);
  const field = page.getByRole('group', { name: 'Hero image' });
  await expect(field).toBeVisible();

  const release = await holdUploads(page);
  await dropFile(field, 'preview.svg');
  await expect(field.getByText(/^Uploading/)).toBeVisible();
  expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0);
  release();

  await expect(
    field.getByText('preview.svg was taken, saved as preview-1.svg', {
      exact: true,
    })
  ).toBeVisible();
  expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0);

  await dropFile(field, 'e2e-replacement.svg');
  const confirm = page.getByRole('alertdialog');
  await expect(confirm).toContainText('Replace preview-1.svg?');
  const box = await confirm.boundingBox();
  expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390);

  await page.unroute('**/upload');
  await page.route('**/upload', (route) => route.abort());
  await confirm.getByRole('button', { name: 'Replace' }).click();
  await expect(
    page.getByRole('button', { name: 'Retry uploading e2e-replacement.svg' })
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveText(
    "e2e-replacement.svg: Couldn't upload. Check your connection, then retry."
  );
  await expect(field.getByText(/was taken, saved as/)).toHaveCount(0);
  expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0);
});

test('at 375px the replace confirm keeps focus and its Replace works after an earlier drop landed', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(HOME_ROUTE);
  const field = page.getByRole('group', { name: 'Hero image' });
  await expect(field).toBeVisible();

  await dropFile(field, 'e2e-first.svg');
  await expect(
    field.getByRole('button', { name: 'Replace e2e-first.svg' })
  ).toBeVisible();

  await dropFile(field, 'e2e-second.svg');
  const confirm = page.getByRole('alertdialog');
  await expect(confirm).toContainText('Replace e2e-first.svg?');
  const replace = confirm.getByRole('button', { name: 'Replace' });
  await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused();
  // A tooltip opens after a delay, so the checks below must not run before it could show.
  await page.waitForTimeout(1000);

  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await expect(page.locator('[data-slot=tooltip-content]')).toHaveCount(0);
  expect(
    await confirm.evaluate((dialog) => dialog.contains(document.activeElement))
  ).toBe(true);
  expect(
    await replace.evaluate((button) => {
      const box = button.getBoundingClientRect();
      const top = document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2
      );
      return button.contains(top);
    })
  ).toBe(true);

  await replace.click();
  await expect(confirm).toHaveCount(0);
  await expect(
    field.getByRole('button', { name: 'Replace e2e-second.svg' })
  ).toBeVisible();
  await expect(
    field.getByRole('img', { name: 'e2e-second.svg' })
  ).toBeVisible();
  expect(await fs.readdir(UPLOADS_DIR)).toEqual(
    expect.arrayContaining(['e2e-first.svg', 'e2e-second.svg'])
  );
});

test('at 390px long names in the upload list are cut in the middle and keep their ends in view', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/screens/media');
  const pane = page.getByRole('complementary', { name: 'Media' });
  await expect(pane.getByRole('button', { name: 'preview.svg' })).toBeVisible();

  const shared = `e2e-${'shared-start-'.repeat(5)}`;
  const long = Array.from(
    { length: 10 },
    (_, index) => `${shared}${index}.svg`
  );
  const short = 'e2e-ab.svg';
  const release = await holdUploads(page);
  await pane
    .getByLabel('Choose files to upload')
    .setInputFiles([...long, short].map(svgFile));
  await pane.getByRole('button', { name: 'Uploading 1 of 11' }).click();
  const list = page.getByRole('list', { name: 'Uploads' });
  await expect(list.getByRole('listitem')).toHaveCount(11);

  // True when the element's box is inside the list's box and no ancestor clips it.
  const inView = (part: Locator) =>
    part.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const frame = element.closest('ul')?.getBoundingClientRect();
      const row = element.closest('li')?.getBoundingClientRect();
      if (!frame || !row || box.width === 0) return false;
      return [frame, row].every(
        (outer) =>
          box.left >= outer.left - 0.5 &&
          box.right <= outer.right + 0.5 &&
          box.top >= outer.top - 0.5 &&
          box.bottom <= outer.bottom + 0.5
      );
    });
  const isCut = (part: Locator) =>
    part.evaluate((element) => element.scrollWidth > element.clientWidth);

  const ends: string[] = [];
  for (const name of long) {
    const drawn = list.getByTitle(name, { exact: true });
    const start = drawn.locator('span').first();
    const end = drawn.locator('span').last();
    await end.scrollIntoViewIfNeeded();
    await expect(end).toHaveText(name.slice(-12));
    expect(await inView(end)).toBe(true);
    expect(await isCut(start)).toBe(true);
    expect(await isCut(end)).toBe(false);
    const joins = await drawn.evaluate((element) => {
      const [first, dots, last] = [...element.children].map((part) => ({
        box: part.getBoundingClientRect(),
        text: part.textContent,
      }));
      return {
        parts: element.children.length,
        dots: dots?.text,
        beforeDots: (dots?.box.left ?? 0) - (first?.box.right ?? 0),
        afterDots: (last?.box.left ?? 0) - (dots?.box.right ?? 0),
      };
    });
    expect(joins.parts).toBe(3);
    expect(joins.dots).toBe('…');
    expect(Math.abs(joins.beforeDots)).toBeLessThan(0.5);
    expect(Math.abs(joins.afterDots)).toBeLessThan(0.5);
    ends.push((await end.textContent()) ?? '');
    const spoken = (
      await list
        .getByRole('listitem')
        .filter({ has: page.getByTitle(name, { exact: true }) })
        .ariaSnapshot()
    )
      .split('\n')
      .filter((line) => !line.includes('button'))
      .join('\n');
    expect(spoken.split(name)).toHaveLength(2);
    expect(spoken.split(name.slice(-12))).toHaveLength(2);
  }
  expect(new Set(ends).size).toBe(10);

  const whole = list.getByTitle(short, { exact: true });
  await whole.scrollIntoViewIfNeeded();
  await expect(whole.locator('span')).toHaveCount(1);
  await expect(whole.locator('span')).toHaveText(short);
  expect(await inView(whole.locator('span'))).toBe(true);
  expect(await isCut(whole.locator('span'))).toBe(false);

  expect(
    await list.evaluate((element) => element.scrollWidth - element.clientWidth)
  ).toBeLessThanOrEqual(0);
  expect(
    await page
      .locator('[data-upload-list]')
      .evaluate((element) => element.scrollWidth - element.clientWidth)
  ).toBeLessThanOrEqual(0);
  expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0);

  release();
  await expect(pane.getByRole('button', { name: '11 uploaded' })).toBeVisible();
});

test('at 375px a long file name wraps inside the image field error', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(HOME_ROUTE);
  const field = page.getByRole('group', { name: 'Hero image' });
  await expect(field).toBeVisible();

  const name = `e2e-${'averylongnamewithnobreaks'.repeat(3)}.svg`;
  await page.route('**/upload', (route) => route.abort());
  await dropFile(field, name);

  const error = page.getByRole('alert').filter({ hasText: name });
  await expect(error).toBeVisible();
  const fits = await error.evaluate((element) => {
    const text = element.querySelector('span');
    const box = (text ?? element).getBoundingClientRect();
    return (
      box.right <= window.innerWidth &&
      (text ?? element).scrollWidth <= (text ?? element).clientWidth
    );
  });
  expect(fits).toBe(true);
  expect(await sidewaysOverflow(page)).toBeLessThanOrEqual(0);
});

test('a long name in the upload list shows whole again once the row has room for it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/#/screens/media');
  const pane = page.getByRole('complementary', { name: 'Media' });
  await expect(pane.getByRole('button', { name: 'preview.svg' })).toBeVisible();

  // Too long beside Cancel, and short enough once Cancel goes.
  const name = `e2e-${'x'.repeat(29)}r-fit.svg`;
  const release = await holdUploads(page);
  await pane
    .getByLabel('Choose files to upload')
    .setInputFiles([svgFile(name)]);
  await pane.getByRole('button', { name: 'Uploading', exact: true }).click();
  const list = page.getByRole('list', { name: 'Uploads' });
  const drawn = list.getByTitle(name, { exact: true });
  await expect(drawn.getByText('…', { exact: true })).toBeVisible();

  release();
  await expect(list.getByText('Uploaded to Media')).toBeVisible();
  await expect(drawn.getByText('…', { exact: true })).toHaveCount(0);
  const clipped = await drawn.evaluate((element) =>
    [...element.children].some((part) => part.scrollWidth > part.clientWidth)
  );
  expect(clipped).toBe(false);
});

test('on open and reopen no name in the upload list is clipped without an ellipsis', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/screens/media');
  const pane = page.getByRole('complementary', { name: 'Media' });
  await expect(pane.getByRole('button', { name: 'preview.svg' })).toBeVisible();

  // Narrow letters step the width a few pixels at a time across the row's room.
  const names = Array.from(
    { length: 30 },
    (_, index) => `e2e-${'x'.repeat(14)}${'i'.repeat(index)}-fit.svg`
  );
  await holdUploads(page);
  await pane
    .getByLabel('Choose files to upload')
    .setInputFiles(names.map(svgFile));
  const button = pane.getByRole('button', { name: 'Uploading 1 of 30' });
  const list = page.getByRole('list', { name: 'Uploads' });

  const looks = () =>
    list.locator('[title]').evaluateAll((drawn) =>
      drawn.map((element) => {
        const parts = [...element.children];
        const start = parts[0];
        return {
          dots: parts.some((part) => part.textContent === '…'),
          hidden: start ? start.scrollWidth - start.clientWidth : 0,
        };
      })
    );

  for (const round of ['open', 'reopen']) {
    await button.click();
    await expect(list.getByRole('listitem')).toHaveCount(30);
    await page.waitForTimeout(400);
    const rows = await looks();
    expect(
      rows.some((row) => row.dots),
      round
    ).toBe(true);
    expect(
      rows.some((row) => !row.dots),
      round
    ).toBe(true);
    for (const row of rows) {
      expect(row.dots || row.hidden <= 1, round).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(list).toBeHidden();
  }
});

test('a name with no start part never gets an ellipsis in the upload list', async ({
  page,
}) => {
  await page.setViewportSize({ width: 290, height: 700 });
  await page.goto('/#/screens/media');
  const pane = page.getByRole('complementary', { name: 'Media' });
  await expect(pane.getByRole('button', { name: 'preview.svg' })).toBeVisible();

  const wide = `${'😀'.repeat(8)}.svg`;
  await holdUploads(page);
  await pane
    .getByLabel('Choose files to upload')
    .setInputFiles([svgFile(wide)]);
  await pane.getByRole('button', { name: 'Uploading', exact: true }).click();
  const list = page.getByRole('list', { name: 'Uploads' });
  const drawn = list.getByTitle(wide, { exact: true });
  await expect(drawn).toBeVisible();
  await page.waitForTimeout(400);
  const look = await drawn.evaluate((element) => ({
    parts: element.children.length,
    wider:
      (element.lastElementChild?.scrollWidth ?? 0) >
      (element.parentElement?.clientWidth ?? Number.POSITIVE_INFINITY),
  }));
  expect(look.wider).toBe(true);
  expect(look.parts).toBe(1);
  await expect(drawn.getByText('…', { exact: true })).toHaveCount(0);
});
