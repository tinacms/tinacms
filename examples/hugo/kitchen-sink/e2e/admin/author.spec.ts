import { expect, test } from '../fixtures/test-content';
import {
  clickSave,
  clickSaveNew,
  navigateToCreate,
  navigateToEdit,
  navigateToList,
} from '../utils/admin-helpers';
import { deleteDocument } from '../utils/delete-document';

const AUTHOR_NAME = 'e2e playwright author';
const AUTHOR_FILENAME = 'e2e-playwright-author';
const AUTHOR_RELATIVE_PATH = `${AUTHOR_FILENAME}.md`;
const AUTHOR_DESCRIPTION = 'Created by Playwright E2E tests';

test.describe('Author CRUD via TinaCMS Admin', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext({
      baseURL: process.env.GRAPHQL_URL ?? 'http://localhost:4001',
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
    for (const path of [
      AUTHOR_RELATIVE_PATH,
      'e2e-edit-author.md',
      'e2e-fields-author.md',
    ]) {
      try {
        await deleteDocument(ctx, 'author', path);
      } catch {
        /* may not exist */
      }
    }
    await ctx.dispose();
  });

  test('should create a new author', async ({ page, contentCleanup }) => {
    await navigateToCreate(page, 'author');
    await page.fill('input[name="name"]', AUTHOR_NAME);
    await page.fill('input[name="description"]', AUTHOR_DESCRIPTION);

    contentCleanup.track('author', AUTHOR_RELATIVE_PATH);
    await clickSaveNew(page);

    await navigateToList(page, 'author');
    const authorEntry = page.locator(`text=${AUTHOR_FILENAME}`).first();
    await expect(authorEntry).toBeVisible({ timeout: 10000 });
  });

  test('should edit an existing author', async ({ page, contentCleanup }) => {
    const editFilename = 'e2e-edit-author';
    const editRelPath = `${editFilename}.md`;

    await navigateToCreate(page, 'author');
    await page.fill('input[name="name"]', 'e2e edit author');
    await page.fill('input[name="description"]', 'Original description');
    contentCleanup.track('author', editRelPath);
    await clickSaveNew(page);

    await navigateToEdit(page, 'author', editFilename);
    const descInput = page.locator('input[name="description"]');
    await descInput.clear();
    await descInput.fill('Updated description by E2E');
    await clickSave(page);

    await navigateToEdit(page, 'author', editFilename);
    await expect(page.locator('input[name="description"]')).toHaveValue(
      'Updated description by E2E'
    );
  });

  test('should display author fields correctly on the edit form', async ({
    page,
    contentCleanup,
  }) => {
    await navigateToCreate(page, 'author');
    await page.fill('input[name="name"]', 'e2e fields author');
    await page.fill('input[name="description"]', 'Testing all fields');
    contentCleanup.track('author', 'e2e-fields-author.md');
    await clickSaveNew(page);

    await navigateToEdit(page, 'author', 'e2e-fields-author');
    await expect(page.locator('input[name="name"]')).toHaveValue(
      'e2e fields author'
    );
    await expect(page.locator('input[name="description"]')).toHaveValue(
      'Testing all fields'
    );
    await expect(
      page.locator('span:has-text("Hobbies")').first()
    ).toBeVisible();
  });
});
