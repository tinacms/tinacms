import { type Page, expect, test } from '@playwright/test';

const HELLO = 'content/posts/hello-world.mdx';

const adminUrl = (preview: string, hash: string) =>
  `/?preview=${encodeURIComponent(preview)}#${hash}`;
const postHash = (path: string) =>
  `/collections/post/${encodeURIComponent(path)}`;
const declared = (path: string) => `/declared.html?post=${path}`;
const frame = (page: Page) => page.frameLocator('iframe[title="Preview"]');
const heading = (page: Page) =>
  page.getByRole('complementary', { name: 'Document form' }).locator('h2');

const openDeclared = async (page: Page) => {
  await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
  await expect(frame(page).getByTestId('post-title')).toBeVisible();
};

type Rgb = [number, number, number];

// The overlay is a closed shadow root, so the outline is read from rendered pixels.
const pixelsIn = async (
  page: Page,
  clip: { x: number; y: number; width: number; height: number }
) => {
  const png = await page.screenshot({ clip });
  return page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('no canvas');
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, image.width, image.height);
    const found: [number, number, number][] = [];
    for (let i = 0; i < data.length; i += 4) {
      found.push([data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0]);
    }
    return found;
  }, png.toString('base64'));
};

const near = (pixel: Rgb, want: Rgb, tolerance = 12) =>
  pixel.every(
    (channel, index) => Math.abs(channel - (want[index] ?? 0)) <= tolerance
  );

const aboveTop = async (page: Page, testId: string) => {
  const box = await frame(page).getByTestId(testId).boundingBox();
  if (!box) throw new Error(`${testId} is not visible`);
  return pixelsIn(page, {
    x: Math.round(box.x),
    y: Math.round(box.y) - 4,
    width: Math.min(Math.round(box.width), 200),
    height: 5,
  });
};

test('hovering a marked part on a dark section draws a dashed muted line with a white edge, and nothing before', async ({
  page,
}) => {
  await openDeclared(page);
  const dark = frame(page).getByTestId('dark-mark');
  await dark.scrollIntoViewIfNeeded();
  const muted: Rgb = [100, 116, 139];
  const white: Rgb = [255, 255, 255];
  const before = await aboveTop(page, 'dark-mark');
  expect(before.some((pixel) => near(pixel, muted))).toBe(false);
  expect(before.some((pixel) => near(pixel, white, 4))).toBe(false);

  await dark.hover();
  await page.waitForTimeout(200);
  const after = await aboveTop(page, 'dark-mark');
  expect(after.some((pixel) => near(pixel, muted))).toBe(true);
  expect(after.some((pixel) => near(pixel, white, 4))).toBe(true);
});

test('the active part gets a solid orange line', async ({ page }) => {
  await openDeclared(page);
  await frame(page).getByTestId('post-title').click();
  await page.mouse.move(2, 2);
  await page.waitForTimeout(200);
  const strip = await aboveTop(page, 'post-title');
  const orange: Rgb = [209, 63, 19];
  expect(
    strip.filter((pixel) => near(pixel, orange, 16)).length
  ).toBeGreaterThan(100);
});

test('the form head is 64px, and a long title ends in an ellipsis without growing it', async ({
  page,
}) => {
  await openDeclared(page);
  const head = page
    .getByRole('complementary', { name: 'Document form' })
    .locator('> :first-child');
  expect((await head.boundingBox())?.height).toBe(64);
  await page
    .locator('input#title')
    .fill('A very long title '.repeat(12).trim());
  const title = heading(page);
  expect(
    await title.evaluate((element) => ({
      overflow: getComputedStyle(element).textOverflow,
      clipped: element.scrollWidth > element.clientWidth,
    }))
  ).toEqual({ overflow: 'ellipsis', clipped: true });
  expect((await head.boundingBox())?.height).toBe(64);
});

test('reloading the admin at #/page keeps the note on a page with no main document and opens the main document of one that has it', async ({
  page,
}) => {
  await page.goto(adminUrl('/declared.html?view=blog', '/page'));
  await expect(heading(page)).toHaveText('Nothing to edit on this page');
  await page.reload();
  await expect(frame(page).getByTestId('blog-index-title')).toBeVisible();
  await page.waitForTimeout(800);
  await expect(heading(page)).toHaveText('Nothing to edit on this page');

  await page.goto(adminUrl(declared(HELLO), '/page'));
  await expect(heading(page)).toHaveText(/^Hello World/);
});

test('clicking a field inside an object inside an object opens it, and a block child opens its block', async ({
  page,
}) => {
  await openDeclared(page);
  await frame(page).getByTestId('social-handle').click();
  await expect(page.locator('input[id="seo.social.handle"]')).toBeFocused();
  await frame(page).getByTestId('block-1-text').click();
  const text = page.getByRole('textbox', { name: /^Text\b/ });
  await expect(text).toBeFocused();
  await expect(text).toHaveValue('A quoted block');
});

test('removing the active list item leaves the page standing with no console errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await openDeclared(page);
  await frame(page).getByTestId('block-1-text').click();
  await expect(page.getByRole('textbox', { name: /^Text\b/ })).toBeFocused();
  await page
    .getByRole('navigation', { name: 'Location' })
    .getByRole('button', { name: 'Blocks' })
    .click();
  await page
    .getByRole('group', { name: 'Blocks' })
    .locator('[aria-haspopup="menu"]')
    .nth(1)
    .click();
  await page.getByRole('menuitem', { name: 'Remove' }).click();
  await expect(frame(page).getByTestId('block-1')).toHaveCount(0);
  await expect(frame(page).getByTestId('block-0')).toBeVisible();
  expect(errors).toEqual([]);
});

test('with validation errors the error pane docks beside the frame, and a click on the page tucks it away', async ({
  page,
}) => {
  await openDeclared(page);
  await page.locator('input#title').fill('ab');
  await page.getByRole('button', { name: /^Save/ }).click();
  const pane = page.locator('#error-pane');
  await expect(pane).toBeVisible();
  const slot = await page.locator('[data-preview-slot]').boundingBox();
  const paneBox = await pane.boundingBox();
  expect(paneBox && slot && paneBox.x < slot.x + slot.width).toBe(true);
  await frame(page).getByTestId('plain-paragraph').click();
  await expect(pane).toBeHidden();
});
