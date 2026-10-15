import { expect, test } from '../fixtures/test-content';
import {
  clickSave,
  navigateToCreate,
  navigateToEdit,
} from '../utils/admin-helpers';
import { deleteDocument } from '../utils/delete-document';

const AUTHOR_NAME = 'e2e list author';
const AUTHOR_FILENAME = 'e2e-list-author';
const AUTHOR_RELATIVE_PATH = `${AUTHOR_FILENAME}.md`;

const HOBBIES = ['reading', 'cycling', 'baking'];

const listValues = (page): Promise<string[]> =>
  page
    .locator('[data-test="list-hobbies"] input')
    .evaluateAll((inputs) => inputs.map((i) => (i as HTMLInputElement).value));

// The delete hook is namespaced by field path, so this addresses the exact row
// rather than relying on descendant order within the wrapper.
const deleteItemAt = (page, index: number) =>
  page.locator(`[data-test="delete-item-hobbies.${index}"]`).click();

/**
 * Add, remove and persist items on a `list: true` field.
 *
 * `final-form-arrays` v4 reworked insertion indexing, `removeBatch` ordering and
 * empty-array handling. Nothing else in the suite mutates a list field, so this
 * walks one document through the states those changes affect, saving and
 * reloading between each so the assertions cover the written file rather than
 * just in-memory form state.
 */
test.describe('Author list field', () => {
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
    await ctx.dispose();
  });

  test('adds, removes and empties list items across saves', async ({
    page,
    contentCleanup,
  }) => {
    await navigateToCreate(page, 'author');
    await page.fill('input[name="name"]', AUTHOR_NAME);
    contentCleanup.track('author', AUTHOR_RELATIVE_PATH);

    for (const [index, hobby] of HOBBIES.entries()) {
      await page.click('[data-test="add-item-hobbies"]');
      await page.fill(`input[name="hobbies.${index}"]`, hobby);
    }
    expect(await listValues(page)).toEqual(HOBBIES);

    await clickSave(page);
    await navigateToEdit(page, 'author', AUTHOR_FILENAME);
    expect(await listValues(page)).toEqual(HOBBIES);

    // Removing the middle item must shift the tail up, not duplicate or drop it.
    await deleteItemAt(page, 1);
    expect(await listValues(page)).toEqual(['reading', 'baking']);

    await clickSave(page);
    await navigateToEdit(page, 'author', AUTHOR_FILENAME);
    expect(await listValues(page)).toEqual(['reading', 'baking']);

    // Emptying the list must persist as empty rather than retaining the last value.
    await deleteItemAt(page, 0);
    await deleteItemAt(page, 0);
    expect(await listValues(page)).toEqual([]);

    await clickSave(page);
    await navigateToEdit(page, 'author', AUTHOR_FILENAME);
    expect(await listValues(page)).toEqual([]);
  });
});
