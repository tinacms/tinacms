import { expect, type Page } from '@playwright/test';

/**
 * Dismiss any modal dialog that might be blocking the admin UI.
 * Handles the "Enter Edit Mode" dialog (first visit) and error modals.
 */
export async function dismissEditModeDialog(page: Page): Promise<void> {
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

// This is different from other kitchen-sink projects: saving a new document
// kicks off a redirect, so the opacity check on the Save button is flaky.
// clickSaveNew waits for the redirect; clickSave waits for the button state.
async function submitAndAwaitGraphQL(page: Page): Promise<string> {
  const currentUrl = page.url();
  const saveResponse = page.waitForResponse(
    (resp) => resp.url().includes('/graphql') && resp.status() === 200,
    { timeout: 15000 }
  );
  await page.click('button:has-text("Save")');
  await saveResponse;
  return currentUrl;
}

/**
 * Save a new document and wait for TinaCMS to navigate away from the
 * create form (e.g. /new/ → /edit/ or back to the collection list).
 */
export async function clickSaveNew(page: Page): Promise<void> {
  const previousUrl = await submitAndAwaitGraphQL(page);
  await page.waitForURL((url) => url.toString() !== previousUrl, {
    timeout: 10000,
  });
}

/**
 * Save an existing document and wait for the form to return to its
 * pristine state (Save button fades to disabled).
 */
export async function clickSave(page: Page): Promise<void> {
  await submitAndAwaitGraphQL(page);
  const saveButton = page.locator('button:has-text("Save")');
  await expect(saveButton).toHaveClass(/opacity-30/, { timeout: 10000 });
}

/**
 * Navigate to the "create new document" form for a collection.
 */
export async function navigateToCreate(
  page: Page,
  collection: string
): Promise<void> {
  await page.goto(`/admin/index.html#/collections/new/${collection}/~/`, {
    waitUntil: 'domcontentloaded',
  });
  await dismissEditModeDialog(page);
  await page.waitForSelector('button:has-text("Save")', { timeout: 10000 });
}

/**
 * Navigate to the edit form for an existing document.
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
  await page.waitForSelector('table', { timeout: 10000 });
}
