import { expect, type Page } from '@playwright/test';

/**
 * Dismiss any modal dialog that might be blocking the admin UI.
 * Handles the "Enter Edit Mode" dialog (first visit) and error modals
 * (e.g. "Filename already exists") that appear in `<div id="modal-root">`.
 */
export async function dismissEditModeDialog(page: Page): Promise<void> {
  // Dismiss any error modal lingering from a previous failure (check immediately, no wait)
  const errorClose = page.locator(
    '#modal-root button:has-text("Close"), #modal-root button:has-text("OK")'
  );
  if (
    await errorClose
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await errorClose.first().click();
    await errorClose
      .first()
      .waitFor({ state: 'hidden', timeout: 1000 })
      .catch(() => {});
  }

  // Race between the edit-mode dialog and actual admin content appearing.
  // Whichever appears first tells us whether we need to click "Enter Edit Mode".
  const editModeBtn = page.locator('button[data-test="enter-edit-mode"]');
  const adminContent = page.locator('button:has-text("Save"), h3, table');

  const appeared = await Promise.race([
    editModeBtn
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => 'dialog' as const),
    adminContent
      .first()
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => 'content' as const),
  ]).catch(() => 'timeout' as const);

  if (appeared === 'dialog') {
    await editModeBtn.click();
  }
}

/**
 * Click the Save button and wait for the GraphQL mutation to complete.
 *
 * Post-save UX varies across TinaCMS hosts:
 *   - Some resolve the form in place (Save button transitions to `opacity-30 pristine`)
 *   - Some redirect `/new/` → `/edit/<new-doc>`
 *   - Some redirect all the way back to the collection listing
 *
 * The GraphQL 200 response is the authoritative signal that the save succeeded. After that,
 * we give the UI up to 3s to settle any navigation, then return. Callers that need to assert
 * on the post-save UI state should do so explicitly.
 */
export async function clickSave(page: Page): Promise<void> {
  const saveResponse = page.waitForResponse(
    (resp) => resp.url().includes('/graphql') && resp.status() === 200,
    { timeout: 15000 }
  );
  const urlBeforeSave = page.url();
  await page.click('button:has-text("Save")');
  await saveResponse;
  await page
    .waitForURL((url) => url.toString() !== urlBeforeSave, { timeout: 3000 })
    .catch(() => {});
}

/**
 * Navigate to the "create new document" form for a collection.
 * Dismisses the edit-mode dialog automatically.
 */
export async function navigateToCreate(
  page: Page,
  collection: string
): Promise<void> {
  await page.goto(`/admin/index.html#/collections/new/${collection}/~/`, {
    waitUntil: 'domcontentloaded',
  });
  await dismissEditModeDialog(page);
  // Wait for the form to be ready
  await page.waitForSelector('button:has-text("Save")', { timeout: 10000 });
}

/**
 * Navigate to the edit form for an existing document.
 * Dismisses the edit-mode dialog automatically.
 */
export async function navigateToEdit(
  page: Page,
  collection: string,
  filename: string
): Promise<void> {
  await page.goto(
    `/admin/index.html#/collections/edit/${collection}/${filename}`,
    { waitUntil: 'domcontentloaded' }
  );
  await dismissEditModeDialog(page);
  // Wait for the form to be ready
  await page.waitForSelector('button:has-text("Save")', { timeout: 10000 });
}

/**
 * Select an option in a reference field and assert the selection registered.
 *
 * Reference fields render as a Radix popover combobox:
 *   - Trigger: `<button role="combobox">` — shows "Choose an option..." until set,
 *     then the filename of the chosen document.
 *   - Open: a "Search reference..." input plus `<div role="option">` entries whose
 *     text is the document id (full path, e.g. `content/authors/foo.md`).
 *
 * Scoped via the field's label wrapper so multiple reference fields on one form
 * disambiguate. Fails loudly if the trigger doesn't update — callers can trust
 * the selection stuck before saving.
 */
export async function selectReference(
  page: Page,
  labelText: string,
  filename: string
): Promise<void> {
  const field = page
    .locator(`div:has(> label:text-is("${labelText}"))`)
    .first();
  const trigger = field.getByRole('combobox');
  await trigger.click();
  await page.getByPlaceholder('Search reference...').fill(filename);
  const option = page.getByRole('option').filter({ hasText: filename }).first();
  await option.click();
  await expect(trigger).toContainText(filename);
}

/**
 * Locate the combobox trigger for a reference field by its label text.
 * Useful for assertions after save + reload.
 */
export function referenceTrigger(page: Page, labelText: string) {
  return page
    .locator(`div:has(> label:text-is("${labelText}"))`)
    .first()
    .getByRole('combobox');
}

/**
 * Navigate to the collection listing page.
 */
export async function navigateToList(
  page: Page,
  collection: string
): Promise<void> {
  await page.goto(`/admin/index.html#/collections/${collection}/~`, {
    waitUntil: 'domcontentloaded',
  });
  await dismissEditModeDialog(page);
  // Wait for the collection list table to load
  await page.waitForSelector('table', { timeout: 10000 });
}
