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
 */
export async function clickSave(page: Page): Promise<void> {
  const saveResponse = page.waitForResponse(
    (resp) => resp.url().includes('/graphql') && resp.status() === 200,
    { timeout: 15000 }
  );
  await page.click('button:has-text("Save")');
  await saveResponse;
  // Wait for the save to fully complete — the button gets `opacity-70 cursor-wait` while
  // submitting, then transitions to `opacity-30` (pristine/disabled) once the form resets.
  const saveButton = page.locator('button:has-text("Save")');
  await expect(saveButton).toHaveClass(/opacity-30/, { timeout: 5000 });
  // After saving a new document, TinaCMS may do an internal redirect (e.g. /new/ → /edit/).
  // Wait for any post-save URL change to settle before further navigation.
  const currentUrl = page.url();
  await page
    .waitForURL((url) => url.toString() !== currentUrl, { timeout: 2000 })
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
