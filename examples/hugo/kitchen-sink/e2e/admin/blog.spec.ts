import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '../fixtures/test-content';
import {
  clickSave,
  navigateToCreate,
  navigateToEdit,
  navigateToList,
  referenceTrigger,
  selectReference,
} from '../utils/admin-helpers';
import { createDocument } from '../utils/create-document';
import { deleteDocument } from '../utils/delete-document';

const BLOG_TITLE = 'E2E Playwright Test Blog';
const BLOG_SLUG = 'e2e-playwright-test-blog';
const BLOG_RELATIVE_PATH = `${BLOG_SLUG}.md`;

const EDIT_BLOG_TITLE = 'E2E Playwright Edit Blog';
const EDIT_BLOG_SLUG = 'e2e-playwright-edit-blog';
const EDIT_BLOG_RELATIVE_PATH = `${EDIT_BLOG_SLUG}.md`;

const DEP_AUTHOR_FILENAME = 'e2e-blog-dep-author';
const DEP_AUTHOR_RELATIVE_PATH = `${DEP_AUTHOR_FILENAME}.md`;

let apiCtx: APIRequestContext;

test.describe('Blog CRUD via TinaCMS Admin', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ playwright }) => {
    apiCtx = await playwright.request.newContext({
      baseURL: process.env.GRAPHQL_URL ?? 'http://localhost:4001',
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });

    for (const path of [BLOG_RELATIVE_PATH, EDIT_BLOG_RELATIVE_PATH]) {
      try {
        await deleteDocument(apiCtx, 'blog', path);
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
      name: 'e2e blog dep author',
      description: 'Dependency author for blog tests',
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

  test('should create a new blog', async ({ page, contentCleanup }) => {
    await navigateToCreate(page, 'blog');
    await page.fill('input[name="title"]', BLOG_TITLE);
    contentCleanup.track('blog', BLOG_RELATIVE_PATH);
    await clickSave(page);

    await navigateToList(page, 'blog');
    const blogEntry = page.locator(`text=${BLOG_SLUG}`).first();
    await expect(blogEntry).toBeVisible({ timeout: 10000 });
  });

  test('should create a blog with description and author', async ({
    page,
    contentCleanup,
  }) => {
    await navigateToCreate(page, 'blog');
    await page.fill('input[name="title"]', EDIT_BLOG_TITLE);
    await page.fill(
      'input[name="description"]',
      'A test blog created by Playwright'
    );

    // Select the dependency author via the reference combobox.
    // selectReference asserts the trigger updates — fails loudly if the DOM has drifted.
    await selectReference(page, 'Author', DEP_AUTHOR_FILENAME);

    contentCleanup.track('blog', EDIT_BLOG_RELATIVE_PATH);
    await clickSave(page);

    await navigateToList(page, 'blog');
    await expect(page.locator(`text=${EDIT_BLOG_SLUG}`).first()).toBeVisible({
      timeout: 10000,
    });

    // Reload the edit form and verify the author reference persisted
    await navigateToEdit(page, 'blog', EDIT_BLOG_SLUG);
    await expect(referenceTrigger(page, 'Author')).toContainText(
      DEP_AUTHOR_FILENAME
    );
  });

  test('should edit an existing blog', async ({ page, contentCleanup }) => {
    await navigateToCreate(page, 'blog');
    await page.fill('input[name="title"]', BLOG_TITLE);
    contentCleanup.track('blog', BLOG_RELATIVE_PATH);
    await clickSave(page);

    await navigateToEdit(page, 'blog', BLOG_SLUG);
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.fill('E2E Playwright Test Blog Updated');
    const descInput = page.locator('input[name="description"]');
    await descInput.fill('Updated description');
    await clickSave(page);

    await navigateToEdit(page, 'blog', BLOG_SLUG);
    await expect(page.locator('input[name="title"]')).toHaveValue(
      'E2E Playwright Test Blog Updated'
    );
    await expect(page.locator('input[name="description"]')).toHaveValue(
      'Updated description'
    );
  });

  test('should display blog form fields correctly', async ({ page }) => {
    await navigateToCreate(page, 'blog');
    await expect(page.locator('label:has-text("Title")')).toBeVisible();
    await expect(page.locator('label:has-text("Hero Image")')).toBeVisible();
    await expect(page.locator('label:has-text("Excerpt")')).toBeVisible();
    await expect(page.locator('label:has-text("Description")')).toBeVisible();
    await expect(page.locator('label:has-text("Author")')).toBeVisible();
    await expect(page.locator('label:has-text("Publish Date")')).toBeVisible();
  });
});
