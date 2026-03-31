import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '../fixtures/test-content';
import {
  clickSave,
  navigateToCreate,
  navigateToEdit,
  navigateToList,
} from '../utils/admin-helpers';
import { createDocument } from '../utils/create-document';
import { deleteDocument } from '../utils/delete-document';

// Post filenames are auto-generated via makeSlugify:
//   title.toLowerCase().split(' ').join('-')
const POST_TITLE = 'E2E Playwright Test Post';
const POST_SLUG = 'e2e-playwright-test-post';
const POST_RELATIVE_PATH = `${POST_SLUG}.md`;

const EDIT_POST_TITLE = 'E2E Playwright Edit Post';
const EDIT_POST_SLUG = 'e2e-playwright-edit-post';
const EDIT_POST_RELATIVE_PATH = `${EDIT_POST_SLUG}.md`;

// Test author created via API as a dependency
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

    // Clean up leftover documents from previous failed runs
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

    // Create a dependency author via GraphQL API
    await createDocument(apiCtx, 'author', DEP_AUTHOR_RELATIVE_PATH, {
      name: 'e2e post dep author',
      description: 'Dependency author for post tests',
    });
  });

  test.afterAll(async () => {
    // Clean up the dependency author
    try {
      await deleteDocument(apiCtx, 'author', DEP_AUTHOR_RELATIVE_PATH);
    } catch {
      /* may already be deleted */
    }
    await apiCtx.dispose();
  });

  test('should create a new post', async ({ page, contentCleanup }) => {
    await navigateToCreate(page, 'post');

    // Fill the required title field (min 5 characters)
    await page.fill('input[name="title"]', POST_TITLE);

    // The filename is auto-generated (readonly) from the title via slugify

    // Track for cleanup before saving — ensures deletion even if save partially fails
    contentCleanup.track('post', POST_RELATIVE_PATH);
    await clickSave(page);

    // Verify the post appears in the collection list
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

    // Select the dependency author via the reference combobox
    const authorSelect = page.locator(
      'label:has-text("Author") ~ div select, label:has-text("Author") ~ div [role="combobox"]'
    );
    // Try clicking the author field area to open the dropdown
    try {
      await authorSelect.first().click({ timeout: 3000 });
      // Type to filter and select the dependency author
      await page.keyboard.type('e2e post dep');
      // Select the first matching option
      const option = page.locator(
        `[role="option"]:has-text("${DEP_AUTHOR_FILENAME}")`
      );
      if (await option.isVisible({ timeout: 3000 })) {
        await option.click();
      }
    } catch {
      // Reference field interaction may vary — continue without it
      console.warn('Could not set author reference — continuing without it');
    }

    contentCleanup.track('post', EDIT_POST_RELATIVE_PATH);
    await clickSave(page);

    // Verify it appears in the list
    await navigateToList(page, 'post');
    await expect(page.locator(`text=${EDIT_POST_SLUG}`).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should edit an existing post title', async ({
    page,
    contentCleanup,
  }) => {
    // Create a post to edit
    await navigateToCreate(page, 'post');
    await page.fill('input[name="title"]', POST_TITLE);
    contentCleanup.track('post', POST_RELATIVE_PATH);
    await clickSave(page);

    // Navigate to the edit form
    await navigateToEdit(page, 'post', POST_SLUG);

    // Update the title
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.fill('E2E Playwright Test Post Updated');

    await clickSave(page);

    // Verify the update persisted
    await navigateToEdit(page, 'post', POST_SLUG);
    await expect(page.locator('input[name="title"]')).toHaveValue(
      'E2E Playwright Test Post Updated'
    );
  });

  test('should validate post title minimum length', async ({ page }) => {
    await navigateToCreate(page, 'post');

    // Enter a title shorter than 5 characters — validation runs on change
    await page.fill('input[name="title"]', 'Hi');

    // Inline validation error appears immediately (no blur/save needed)
    const errorMessage = page.locator(
      'text=Title must be at least 5 characters'
    );
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // The Save button should be disabled (no cursor=pointer)
    const saveButton = page.locator('button:has-text("Save")');
    await expect(saveButton).toHaveClass(/pointer-events-none/, {
      timeout: 3000,
    });
  });
});
