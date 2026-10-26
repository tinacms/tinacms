import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '../fixtures/test-content';
import { dismissEditModeDialog } from '../utils/admin-helpers';
import { createDocument } from '../utils/create-document';
import { deleteDocument } from '../utils/delete-document';

const FIRST_POST = {
  slug: 'e2e-preview-nav-first',
  title: 'E2E Preview Nav First',
};
const SECOND_POST = {
  slug: 'e2e-preview-nav-second',
  title: 'E2E Preview Nav Second',
};
const POSTS = [FIRST_POST, SECOND_POST];

let apiCtx: APIRequestContext;

test.describe('Navigating inside the visual editor preview', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ playwright }) => {
    apiCtx = await playwright.request.newContext({
      baseURL: process.env.GRAPHQL_URL ?? 'http://localhost:4001',
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });

    for (const post of POSTS) {
      try {
        await deleteDocument(apiCtx, 'post', `${post.slug}.md`);
      } catch {
        /* may not exist */
      }
      await createDocument(apiCtx, 'post', `${post.slug}.md`, {
        title: post.title,
      });
    }
  });

  test.afterAll(async () => {
    for (const post of POSTS) {
      try {
        await deleteDocument(apiCtx, 'post', `${post.slug}.md`);
      } catch {
        /* already gone */
      }
    }
    await apiCtx.dispose();
  });

  test('loads the form of each page navigated to', async ({ page }) => {
    await page.goto(`/admin/index.html#/~/posts/${FIRST_POST.slug}`);
    await dismissEditModeDialog(page);
    const titleField = page.locator('input[name="title"]');
    await expect(titleField).toHaveValue(FIRST_POST.title);

    const preview = page.frameLocator('iframe');
    await preview.locator('header a[href="/posts"]').click();
    await preview.locator(`a[href="/posts/${SECOND_POST.slug}"]`).click();
    await expect(titleField).toHaveValue(SECOND_POST.title);

    await preview.locator('header a[href="/posts"]').click();
    await preview.locator(`a[href="/posts/${FIRST_POST.slug}"]`).click();
    await expect(titleField).toHaveValue(FIRST_POST.title);
  });

  test('previews edits to the page navigated to', async ({ page }) => {
    await page.goto(`/admin/index.html#/~/posts/${FIRST_POST.slug}`);
    await dismissEditModeDialog(page);
    const titleField = page.locator('input[name="title"]');
    await expect(titleField).toHaveValue(FIRST_POST.title);

    const preview = page.frameLocator('iframe');
    await preview.locator('header a[href="/posts"]').click();
    await preview.locator(`a[href="/posts/${SECOND_POST.slug}"]`).click();
    await expect(titleField).toHaveValue(SECOND_POST.title);

    const editedTitle = `${SECOND_POST.title} edited`;
    await titleField.fill(editedTitle);
    await expect(preview.locator('article.post-content h1')).toHaveText(
      editedTitle
    );
  });
});
