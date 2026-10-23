import { expect, test } from '../fixtures/test-content';
import {
  clickSave,
  navigateToCreate,
  navigateToEdit,
  navigateToList,
} from '../utils/admin-helpers';
import { deleteDocument } from '../utils/delete-document';

const AUTHOR_NAME = 'e2e playwright author';
// Default slugify (no custom slugify, isTitle field): spaces→hyphens, case preserved
const AUTHOR_FILENAME = 'e2e-playwright-author';
const AUTHOR_RELATIVE_PATH = `${AUTHOR_FILENAME}.md`;
const AUTHOR_DESCRIPTION = 'Created by Playwright E2E tests';

test.describe('Author CRUD via TinaCMS Admin', () => {
  test.describe.configure({ mode: 'serial' });

  // Clean up any leftover test documents from previous failed runs
  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext({
      baseURL: process.env.GRAPHQL_URL ?? 'http://localhost:4001',
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
    try {
      await deleteDocument(ctx, 'author', AUTHOR_RELATIVE_PATH);
    } catch {
      // Document may not exist — that's fine
    }
    try {
      await deleteDocument(ctx, 'author', 'e2e-edit-author.md');
    } catch {
      // Document may not exist — that's fine
    }
    try {
      await deleteDocument(ctx, 'author', 'e2e-fields-author.md');
    } catch {
      // Document may not exist — that's fine
    }
    await ctx.dispose();
  });

  test('should create a new author', async ({ page, contentCleanup }) => {
    await navigateToCreate(page, 'author');

    // Fill the required name field (isTitle)
    await page.fill('input[name="name"]', AUTHOR_NAME);

    // Fill description
    await page.fill('input[name="description"]', AUTHOR_DESCRIPTION);

    // Filename is auto-generated from name (default slugify: spaces→hyphens, case preserved)
    // No need to fill it manually — the input starts locked.

    // Track for cleanup before saving — ensures deletion even if save partially fails
    contentCleanup.track('author', AUTHOR_RELATIVE_PATH);
    await clickSave(page);

    // Verify the author appears in the collection list
    await navigateToList(page, 'author');
    const authorEntry = page.locator(`text=${AUTHOR_FILENAME}`).first();
    await expect(authorEntry).toBeVisible({ timeout: 10000 });
  });

  test('should edit an existing author', async ({ page, contentCleanup }) => {
    const editFilename = 'e2e-edit-author';
    const editRelPath = `${editFilename}.md`;

    // First create the author we'll edit
    await navigateToCreate(page, 'author');
    await page.fill('input[name="name"]', 'e2e edit author');
    await page.fill('input[name="description"]', 'Original description');
    // Filename auto-generated from name
    contentCleanup.track('author', editRelPath);
    await clickSave(page);

    // Navigate to the edit form
    await navigateToEdit(page, 'author', editFilename);

    // Update the description
    const descInput = page.locator('input[name="description"]');
    await descInput.clear();
    await descInput.fill('Updated description by E2E');

    await clickSave(page);

    // Verify the update persisted by reloading the edit form
    await navigateToEdit(page, 'author', editFilename);
    await expect(page.locator('input[name="description"]')).toHaveValue(
      'Updated description by E2E'
    );
  });

  test('should display author fields correctly on the edit form', async ({
    page,
    contentCleanup,
  }) => {
    // Create an author with all fields
    await navigateToCreate(page, 'author');
    await page.fill('input[name="name"]', 'e2e fields author');
    await page.fill('input[name="description"]', 'Testing all fields');
    // Filename auto-generated from name
    contentCleanup.track('author', 'e2e-fields-author.md');
    await clickSave(page);

    // Navigate to edit and verify all fields are present
    await navigateToEdit(page, 'author', 'e2e-fields-author');

    // Verify the name field shows the correct value
    await expect(page.locator('input[name="name"]')).toHaveValue(
      'e2e fields author'
    );

    // Verify the description field
    await expect(page.locator('input[name="description"]')).toHaveValue(
      'Testing all fields'
    );

    // Verify the hobbies list field label is present
    // List fields render their label via ListLabel (<span>), not a <label> element
    await expect(
      page.locator('span:has-text("Hobbies")').first()
    ).toBeVisible();
  });
});
