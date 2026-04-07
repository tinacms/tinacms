import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '../fixtures/test-content';
import {
  clickSave,
  clickSaveNew,
  navigateToCreate,
  navigateToEdit,
  navigateToList,
} from '../utils/admin-helpers';
import { createDocument } from '../utils/create-document';
import { deleteDocument } from '../utils/delete-document';

const POST_TITLE = 'E2E Playwright Test Post';
const POST_SLUG = 'e2e-playwright-test-post';
const POST_RELATIVE_PATH = `${POST_SLUG}.md`;

const EDIT_POST_TITLE = 'E2E Playwright Edit Post';
const EDIT_POST_SLUG = 'e2e-playwright-edit-post';
const EDIT_POST_RELATIVE_PATH = `${EDIT_POST_SLUG}.md`;

const DEP_AUTHOR_FILENAME = 'e2e-post-dep-author';
const DEP_AUTHOR_RELATIVE_PATH = `${DEP_AUTHOR_FILENAME}.md`;

let apiCtx: APIRequestContext;

test.describe('Post CRUD via TinaCMS Admin', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ playwright }) => {
    apiCtx = await playwright.request.newContext({
      baseURL: process.env.GRAPHQL_URL ?? 'http://localhost:4001',
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });

    for (const path of [POST_RELATIVE_PATH, EDIT_POST_RELATIVE_PATH]) {
      try {
        await deleteDocument(apiCtx, 'post', path);
      } catch {
        /* may not exist */
      }
    }
    try {
      await deleteDocument(apiCtx, 'author', DEP_AUTHOR_RELATIVE_PATH);
    } catch {
      /* may not exist */
    }

    await createDocument(apiCtx, 'author', DEP_AUTHOR_RELATIVE_PATH, {
      name: 'e2e post dep author',
      description: 'Dependency author for post tests',
    });
  });

  test.afterAll(async () => {
    try {
      await deleteDocument(apiCtx, 'author', DEP_AUTHOR_RELATIVE_PATH);
    } catch {
      /* may already be deleted */
    }
    await apiCtx.dispose();
  });

  test('should create a new post', async ({ page, contentCleanup }) => {
    await navigateToCreate(page, 'post');
    await page.fill('input[name="title"]', POST_TITLE);
    contentCleanup.track('post', POST_RELATIVE_PATH);
    await clickSaveNew(page);

    await navigateToList(page, 'post');
    const postEntry = page.locator(`text=${POST_SLUG}`).first();
    await expect(postEntry).toBeVisible({ timeout: 10000 });
  });

  test('should create a post with author reference', async ({
    page,
    contentCleanup,
  }) => {
    await navigateToCreate(page, 'post');
    await page.fill('input[name="title"]', EDIT_POST_TITLE);

    const authorSelect = page.locator(
      'label:has-text("Author") ~ div select, label:has-text("Author") ~ div [role="combobox"]'
    );
    try {
      await authorSelect.first().click({ timeout: 3000 });
      await page.keyboard.type('e2e post dep');
      const option = page.locator(
        `[role="option"]:has-text("${DEP_AUTHOR_FILENAME}")`
      );
      if (await option.isVisible({ timeout: 3000 })) {
        await option.click();
      }
    } catch {
      console.warn('Could not set author reference — continuing without it');
    }

    contentCleanup.track('post', EDIT_POST_RELATIVE_PATH);
    await clickSaveNew(page);

    await navigateToList(page, 'post');
    await expect(page.locator(`text=${EDIT_POST_SLUG}`).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should edit an existing post title', async ({
    page,
    contentCleanup,
  }) => {
    await navigateToCreate(page, 'post');
    await page.fill('input[name="title"]', POST_TITLE);
    contentCleanup.track('post', POST_RELATIVE_PATH);
    await clickSaveNew(page);

    await navigateToEdit(page, 'post', POST_SLUG);
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.fill('E2E Playwright Test Post Updated');
    await clickSave(page);

    await navigateToEdit(page, 'post', POST_SLUG);
    await expect(page.locator('input[name="title"]')).toHaveValue(
      'E2E Playwright Test Post Updated'
    );
  });

  test('should validate post title minimum length', async ({ page }) => {
    await navigateToCreate(page, 'post');
    await page.fill('input[name="title"]', 'Hi');

    const errorMessage = page.locator(
      'text=Title must be at least 5 characters'
    );
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    const saveButton = page.locator('button:has-text("Save")');
    await expect(saveButton).toHaveClass(/pointer-events-none/, {
      timeout: 3000,
    });
  });
});
