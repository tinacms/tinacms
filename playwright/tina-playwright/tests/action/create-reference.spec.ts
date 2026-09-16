import { test, expect } from "../../fixtures/test-content";

test.describe("Create a referenced document from a reference field", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/index.html#/collections/new/post/~/", {
      waitUntil: "domcontentloaded",
    });
    //Need to dismiss the popup dialog to enter edit mode
    page.click('button[data-test="enter-edit-mode"]');
  });

  const authorFilename = "playwright-test-author";

  test("creates the author in a modal and selects it", async ({
    page,
    contentCleanup,
  }) => {
    await page.click('button[data-test="reference-create:author"]');

    const modal = page.locator('[data-test="reference-create-modal"]');
    await expect(modal).toBeVisible();

    await modal.locator('input[name="Title"]').fill("Playwright Author");
    await modal.locator('input[name="filename"]').fill(authorFilename);
    await modal.locator('button:has-text("Save")').click();

    contentCleanup.track("author", `${authorFilename}.mdx`);

    await expect(modal).toBeHidden();
    await expect(page.locator('button[role="combobox"]')).toContainText(
      authorFilename
    );
  });
});
