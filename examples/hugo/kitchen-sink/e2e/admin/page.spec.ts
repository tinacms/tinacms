import { expect, test } from '../fixtures/test-content';
import {
  clickSave,
  clickSaveNew,
  dismissEditModeDialog,
  navigateToCreate,
  navigateToEdit,
  navigateToList,
} from '../utils/admin-helpers';
import { deleteDocument } from '../utils/delete-document';

const PAGE_FILENAME = 'e2e-playwright-test-page';
const PAGE_RELATIVE_PATH = `${PAGE_FILENAME}.md`;

test.describe('Page Block Editing via TinaCMS Admin', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ playwright }) => {
    const ctx = await playwright.request.newContext({
      baseURL: process.env.GRAPHQL_URL ?? 'http://localhost:4001',
      extraHTTPHeaders: { 'Content-Type': 'application/json' },
    });
    try {
      await deleteDocument(ctx, 'page', PAGE_RELATIVE_PATH);
    } catch {
      /* may not exist */
    }
    await ctx.dispose();
  });

  test('should display the home page in the editor', async ({ page }) => {
    await page.goto('/admin/index.html#/collections/edit/page/home', {
      waitUntil: 'domcontentloaded',
    });
    await dismissEditModeDialog(page);

    await expect(page.locator('span:has-text("Sections")').first()).toBeVisible(
      { timeout: 10000 }
    );
  });

  test('should list available block templates when adding a section', async ({
    page,
    contentCleanup,
  }) => {
    await navigateToCreate(page, 'page');
    await page.fill('input[name="filename"]', PAGE_FILENAME);
    contentCleanup.track('page', PAGE_RELATIVE_PATH);
    await clickSaveNew(page);

    await navigateToEdit(page, 'page', PAGE_FILENAME);

    const sectionsHeader = page.locator('span:has(> div:has-text("Sections"))');
    const addButton = sectionsHeader.locator('button').first();
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();

    await expect(page.locator('text=Hero').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should add a hero block and edit its fields', async ({
    page,
    contentCleanup,
  }) => {
    await navigateToCreate(page, 'page');
    await page.fill('input[name="filename"]', PAGE_FILENAME);
    contentCleanup.track('page', PAGE_RELATIVE_PATH);
    await clickSaveNew(page);

    await navigateToEdit(page, 'page', PAGE_FILENAME);

    const sectionsHeader = page.locator('span:has(> div:has-text("Sections"))');
    const addButton = sectionsHeader.locator('button').first();
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();

    const heroSelectorCard = page.locator('button').filter({ hasText: 'Hero' });
    await expect(heroSelectorCard).toBeVisible({ timeout: 5000 });
    await heroSelectorCard.click();

    await expect(heroSelectorCard).not.toBeVisible({ timeout: 3000 });

    const heroBlock = page
      .locator('[aria-roledescription="sortable"]')
      .filter({ hasText: 'Hero' });
    await expect(heroBlock).toBeVisible({ timeout: 5000 });
    await heroBlock.click();

    const taglineInput = page.locator('input[name*="tagline"]');
    const headlineInput = page.locator('input[name*="headline"]');

    await expect(taglineInput).toBeVisible({ timeout: 5000 });
    await taglineInput.fill('E2E Test Tagline');

    await expect(headlineInput).toBeVisible({ timeout: 3000 });
    await headlineInput.fill('E2E Test Headline');

    await clickSave(page);

    await navigateToEdit(page, 'page', PAGE_FILENAME);
    await expect(page.locator('text=Hero').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should navigate to the page collection list', async ({ page }) => {
    await navigateToList(page, 'page');
    await expect(page.locator('text=home').first()).toBeVisible({
      timeout: 10000,
    });
  });
});
