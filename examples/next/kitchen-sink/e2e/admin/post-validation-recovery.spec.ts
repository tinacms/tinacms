import { expect, test } from '../fixtures/test-content';
import {
  clickSave,
  navigateToCreate,
  navigateToEdit,
} from '../utils/admin-helpers';
import { deleteDocument } from '../utils/delete-document';

const POST_TITLE = 'Recovered validation post';
const POST_FILENAME = 'recovered-validation-post';
const POST_RELATIVE_PATH = `${POST_FILENAME}.md`;

const VALIDATION_ERROR = 'Title must be at least 5 characters';

const saveButton = (page) => page.locator('button:has-text("Save")');

/**
 * Drives a form from invalid to valid and back.
 *
 * The existing post spec asserts that an invalid title blocks saving. This
 * covers the return trip, which is what final-form v5 changed: submit errors
 * used to be discarded when sync validation failed after a failed submission,
 * and `beforeSubmit` ran after the sync-error check rather than before. A
 * regression shows up as a form that stays stuck disabled once corrected, or
 * one that saves while still invalid.
 */
test.describe('Post validation recovery', () => {
  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext({
      baseURL: process.env.GRAPHQL_URL ?? 'http://localhost:4001',
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
    try {
      await deleteDocument(ctx, 'post', POST_RELATIVE_PATH);
    } catch {
      // Document may not exist — that's fine
    }
    await ctx.dispose();
  });

  test('recovers from an invalid title and saves', async ({
    page,
    contentCleanup,
  }) => {
    await navigateToCreate(page, 'post');

    await page.fill('input[name="title"]', 'Hi');
    await expect(page.locator(`text=${VALIDATION_ERROR}`)).toBeVisible({
      timeout: 5000,
    });
    await expect(saveButton(page)).toHaveClass(/pointer-events-none/, {
      timeout: 3000,
    });

    // Correcting the field must clear the error and re-enable submission.
    await page.fill('input[name="title"]', POST_TITLE);
    await expect(page.locator(`text=${VALIDATION_ERROR}`)).toHaveCount(0, {
      timeout: 5000,
    });
    await expect(saveButton(page)).not.toHaveClass(/pointer-events-none/, {
      timeout: 5000,
    });

    contentCleanup.track('post', POST_RELATIVE_PATH);
    await clickSave(page);

    await navigateToEdit(page, 'post', POST_FILENAME);
    await expect(page.locator('input[name="title"]')).toHaveValue(POST_TITLE);

    // Validation stays live on a saved document, and recovers a second time.
    await page.fill('input[name="title"]', 'Hi');
    await expect(page.locator(`text=${VALIDATION_ERROR}`)).toBeVisible({
      timeout: 5000,
    });

    await page.fill('input[name="title"]', POST_TITLE);
    await expect(page.locator(`text=${VALIDATION_ERROR}`)).toHaveCount(0, {
      timeout: 5000,
    });
    await expect(saveButton(page)).not.toHaveClass(/pointer-events-none/, {
      timeout: 5000,
    });
  });
});
