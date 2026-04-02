import { expect, test } from '../fixtures/test-content';
import {
  clickSave,
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

  // Clean up any leftover test page from previous failed runs
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
    // Navigate to the home page edit form
    await page.goto('/admin/index.html#/collections/edit/page/home', {
      waitUntil: 'domcontentloaded',
    });
    await dismissEditModeDialog(page);

    // The page collection uses blocks — verify the "Sections" label is present
    // Blocks fields render their label via ListLabel (<span>), not a <label> element
    await expect(page.locator('span:has-text("Sections")').first()).toBeVisible(
      { timeout: 10000 }
    );
  });

  test('should list available block templates when adding a section', async ({
    page,
    contentCleanup,
  }) => {
    // Create a test page so we don't modify the real home page
    await navigateToCreate(page, 'page');
    await page.fill('input[name="filename"]', PAGE_FILENAME);

    // Track for cleanup before saving — ensures deletion even if save partially fails
    contentCleanup.track('page', PAGE_RELATIVE_PATH);
    await clickSave(page);

    // Navigate to edit the test page
    await navigateToEdit(page, 'page', PAGE_FILENAME);

    // Click the add block icon button (no text — just an AddIcon SVG next to the "Sections" label)
    const sectionsHeader = page.locator('span:has(> div:has-text("Sections"))');
    const addButton = sectionsHeader.locator('button').first();
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();

    // The block selector panel opens with "Sections – Add New" header
    // Verify that block template options are shown (rendered as BlockCard divs with template labels)
    await expect(page.locator('text=Hero').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('should add a hero block and edit its fields', async ({
    page,
    contentCleanup,
  }) => {
    // Create a test page
    await navigateToCreate(page, 'page');
    await page.fill('input[name="filename"]', PAGE_FILENAME);
    contentCleanup.track('page', PAGE_RELATIVE_PATH);
    await clickSave(page);

    // Navigate to edit the test page
    await navigateToEdit(page, 'page', PAGE_FILENAME);

    // Add a hero block — click the add icon button next to "Sections" label
    const sectionsHeader = page.locator('span:has(> div:has-text("Sections"))');
    const addButton = sectionsHeader.locator('button').first();
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();

    // Select "Hero" block template from the block selector panel
    const heroSelectorCard = page.locator('button').filter({ hasText: 'Hero' });
    await expect(heroSelectorCard).toBeVisible({ timeout: 5000 });
    await heroSelectorCard.click();

    // Wait for the block selector panel to close before interacting with the added block
    await expect(heroSelectorCard).not.toBeVisible({ timeout: 3000 });

    // The hero block is added but collapsed — click to expand its form.
    // Target the sortable block list item (div[role="button"]) specifically.
    const heroBlock = page.locator('[aria-roledescription="sortable"]').filter({ hasText: 'Hero' });
    await expect(heroBlock).toBeVisible({ timeout: 5000 });
    await heroBlock.click();

    // Hero fields: tagline, headline, text, image, actions, color
    const taglineInput = page.locator('input[name*="tagline"]');
    const headlineInput = page.locator('input[name*="headline"]');

    // Wait for form to expand — tagline input becomes visible
    await expect(taglineInput).toBeVisible({ timeout: 5000 });
    await taglineInput.fill('E2E Test Tagline');

    await expect(headlineInput).toBeVisible({ timeout: 3000 });
    await headlineInput.fill('E2E Test Headline');

    await clickSave(page);

    // Verify fields persisted by reloading
    await navigateToEdit(page, 'page', PAGE_FILENAME);

    // The block should be listed under sections
    await expect(page.locator('text=Hero').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should navigate to the page collection list', async ({ page }) => {
    await navigateToList(page, 'page');

    // The home page should always be present
    await expect(page.locator('text=home').first()).toBeVisible({
      timeout: 10000,
    });
  });
});
