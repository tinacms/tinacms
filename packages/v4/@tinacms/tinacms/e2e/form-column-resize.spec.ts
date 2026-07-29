import { expect, test } from '@playwright/test';
import {
  columnWidth,
  formColumn,
  resizeHandle,
  setColumnWidth,
  toolbar,
} from './form-column';

// The form column opens narrow and is dragged wider. A browser is the only place this
// can be checked: the width comes from pointer capture and a clamp against the window,
// neither of which happy-dom has. These tests only read the document, so they stay
// parallel with the ones that save.
const DEFAULT_WIDTH = 352;

const openDocument = async (page: import('@playwright/test').Page) => {
  await page.goto(
    `/#/collections/post/${encodeURIComponent('content/posts/second-post.mdx')}`
  );
  await expect(page.getByRole('textbox', { name: 'body' })).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1800, height: 900 });
  await openDocument(page);
});

test('opens at the default width and drags wider', async ({ page }) => {
  await expect(formColumn(page)).toHaveCSS('width', `${DEFAULT_WIDTH}px`);

  await setColumnWidth(page, 700);
  expect(await columnWidth(page)).toBeGreaterThan(600);
});

// The toolbar hides tools it cannot fit, which is the reason the column resizes at all.
// A wider column that showed no more of them would leave the feature pointless.
test('a wider column shows more of the rich-text toolbar', async ({ page }) => {
  const controlsShown = () =>
    toolbar(page).evaluate(
      (container) =>
        (container.firstElementChild as HTMLElement).childElementCount
    );

  const atDefault = await controlsShown();
  await setColumnWidth(page, 700);
  expect(await controlsShown()).toBeGreaterThan(atDefault);
});

// The default is also the floor. It is the width the rich-text layout tests cover, so
// the editor is known to work at it, and narrower is untested.
test('does not drag narrower than the default', async ({ page }) => {
  await setColumnWidth(page, 200);
  expect(await columnWidth(page)).toBe(DEFAULT_WIDTH);
});

// A preference an editor has to set on every page load is not a preference.
test('the width survives a reload, and Home returns it to the default', async ({
  page,
}) => {
  await setColumnWidth(page, 700);
  const chosen = await columnWidth(page);

  await page.reload();
  await expect(page.getByRole('textbox', { name: 'body' })).toBeVisible();
  expect(await columnWidth(page)).toBe(chosen);

  await resizeHandle(page).press('Home');
  await expect(formColumn(page)).toHaveCSS('width', `${DEFAULT_WIDTH}px`);
});

// The handle is reachable without a pointer.
test('the arrow keys resize the column', async ({ page }) => {
  const before = await columnWidth(page);
  await resizeHandle(page).focus();
  await resizeHandle(page).press('ArrowRight');
  await resizeHandle(page).press('ArrowRight');
  expect(await columnWidth(page)).toBe(before + 32);
});
