import { expect, test } from '../fixtures/test-content';
import { navigateToEdit } from '../utils/admin-helpers';

const NAV_LABEL_INPUT = 'input[name="header.nav.0.label"]';
const EDITED_LABEL = 'Home (edited)';

const breadcrumb = (page, label: string) =>
  page.locator(`nav[aria-label="breadcrumb"] button:has-text("${label}")`);

// Opening a group or list item swaps the sidebar's field set, so the parent
// fields remount on the way back. react-final-form 7.0.1 reset a remounting
// field to its initial value and silently dropped every unsaved edit made in
// the panel. Nothing is saved on purpose: the bug lives in form state before Save.
test.describe('Nested panel edits', () => {
  test('survive breadcrumbing back to the parent', async ({ page }) => {
    await navigateToEdit(page, 'global', 'index');
    const save = page.locator('button:has-text("Save")');
    await expect(save).toBeDisabled();

    // Global > Header (group) > Nav Links (object list) > first item
    await page.getByText('Header', { exact: true }).click();
    await page.getByText('Home', { exact: true }).click();
    await page.fill(NAV_LABEL_INPUT, EDITED_LABEL);
    await expect(save).toBeEnabled();

    await breadcrumb(page, 'Header').click();
    await expect(save).toBeEnabled();

    await page.getByText(EDITED_LABEL, { exact: true }).click();
    await expect(page.locator(NAV_LABEL_INPUT)).toHaveValue(EDITED_LABEL);

    await breadcrumb(page, 'index').click();
    await expect(save).toBeEnabled();
  });
});
