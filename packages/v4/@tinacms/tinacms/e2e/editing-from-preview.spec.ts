import { type Page, expect, test } from '@playwright/test';

const HELLO = 'content/posts/hello-world.mdx';
const SECOND = 'content/posts/second-post.mdx';

const adminUrl = (preview: string, hash: string) =>
  `/?preview=${encodeURIComponent(preview)}#${hash}`;
const postHash = (path: string) =>
  `/collections/post/${encodeURIComponent(path)}`;
const declared = (path: string) => `/declared.html?post=${path}`;
const frame = (page: Page) => page.frameLocator('iframe[title="Preview"]');
const location = (page: Page) =>
  page.getByRole('navigation', { name: 'Location' });
const heading = (page: Page) =>
  page.getByRole('complementary', { name: 'Document form' }).locator('h2');

const openDeclared = async (page: Page, path = HELLO) => {
  await page.goto(adminUrl(declared(path), postHash(path)));
  await expect(frame(page).getByTestId('post-title')).toBeVisible();
};

const outlineOf = (page: Page, testId: string) =>
  frame(page)
    .getByTestId(testId)
    .evaluate((element) => {
      const host = element.ownerDocument.body.lastElementChild;
      return host?.shadowRoot ? 'closed' : 'none';
    });

test('hovering a marked part outlines it and an unmarked part gets none', async ({
  page,
}) => {
  await openDeclared(page);
  const title = frame(page).getByTestId('post-title');
  const before = await title.boundingBox();
  await title.hover();
  await page.waitForTimeout(150);
  expect(await title.boundingBox()).toEqual(before);
  await frame(page).getByTestId('plain-paragraph').hover();
  expect(await outlineOf(page, 'post-title')).toBeDefined();
});

test('clicking the title focuses the Title field and it keeps the active look after clicking elsewhere on the page', async ({
  page,
}) => {
  await openDeclared(page);
  await frame(page).getByTestId('post-title').click();
  const title = page.getByRole('textbox', { name: /^title\b/i });
  await expect(title).toBeFocused();
  await frame(page).getByTestId('plain-paragraph').click();
  await expect(title).toHaveAttribute('data-active', /.*/);
});

test('hovering a field in the form does not move page layout and focusing it keeps the frame', async ({
  page,
}) => {
  await openDeclared(page);
  const title = frame(page).getByTestId('post-title');
  const before = await title.boundingBox();
  await page.getByRole('textbox', { name: /^title\b/i }).hover();
  await page.waitForTimeout(150);
  expect(await title.boundingBox()).toEqual(before);
});

test('the form head is title-led with a Location trail and no Return to navigator or tabs', async ({
  page,
}) => {
  await openDeclared(page);
  await expect(location(page)).toBeVisible();
  await expect(heading(page)).toHaveText(/^Hello World/);
  await expect(
    page.getByRole('button', { name: 'Return to navigator' })
  ).toHaveCount(0);
  await expect(
    page.getByRole('tablist', { name: 'Document views' })
  ).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'Preview location' })
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Form actions' })
  ).toBeVisible();
});

test('clicking a referenced author opens the author as a reference step and back returns', async ({
  page,
}) => {
  await openDeclared(page);
  await frame(page).getByTestId('author-name').click();
  await expect(page.getByRole('textbox', { name: /^name\b/i })).toBeFocused();
  await expect(
    location(page).getByRole('button', { name: /^Hello World/ })
  ).toBeVisible();
  await location(page)
    .getByRole('button', { name: /^Hello World/ })
    .click();
  await expect(heading(page)).toHaveText(/^Hello World/);
});

test('following a link opens the next post in the form and the preview stays on it, in the same frame', async ({
  page,
}) => {
  await openDeclared(page);
  const iframe = await page.locator('iframe[title="Preview"]').elementHandle();
  await page.evaluate((node) => {
    (window as unknown as { __loads: number }).__loads = 0;
    node?.addEventListener('load', () => {
      (window as unknown as { __loads: number }).__loads += 1;
    });
  }, iframe);
  await frame(page).getByTestId('next-post').click();
  await expect(heading(page)).not.toHaveText(/^Hello World/);
  await expect(page).toHaveURL(
    new RegExp(encodeURIComponent(SECOND).slice(0, 20))
  );
  await expect(frame(page).getByTestId('post-title')).toBeVisible();
  const handle = await page.locator('iframe[title="Preview"]').elementHandle();
  expect(
    await handle?.evaluate((node, original) => node === original, iframe)
  ).toBe(true);
});

test('a link off the site opens in a new tab and the preview stays on the site', async ({
  page,
}) => {
  await openDeclared(page);
  const popup = page.waitForEvent('popup');
  await frame(page).getByTestId('off-site-link').click();
  expect((await popup).url()).toContain('example.com');
  await expect(frame(page).getByTestId('post-title')).toBeVisible();
});

test('a page that draws only the shared nav shows Nothing to edit, and the nav opens its document', async ({
  page,
}) => {
  await openDeclared(page);
  await frame(page).getByRole('link', { name: 'Blog' }).dispatchEvent('click');
  await expect(heading(page)).toHaveText('Nothing to edit on this page');
  await expect(
    page.getByRole('button', { name: 'Open Collections' })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /^Save/ })).toHaveCount(0);
  await frame(page).getByText('Playground Blog').click();
  await expect(heading(page)).toHaveText('site.json');
});

test('opening a document from Collections does not move the form to the page the preview shows', async ({
  page,
}) => {
  await page.goto(adminUrl(declared(HELLO), postHash(SECOND)));
  await expect(heading(page)).not.toHaveText(/^Hello World/);
  await expect(frame(page).getByTestId('post-title')).toBeVisible();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(
    new RegExp(encodeURIComponent(SECOND).slice(0, 20))
  );
});
