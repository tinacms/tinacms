import { test, expect } from "../../fixtures/test-content";

test.describe("Create Folder", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/index.html#/collections/author/~", {
      waitUntil: "domcontentloaded",
    });
    //Dismiss the page-load dialog to enter edit mode (see create-blog.spec.ts)
    page.click('button[data-test="enter-edit-mode"]');
  });

  test("should reject folder names with spaces", async ({ page }) => {
    await page.click("text=Add Folder");

    const folderInput = page.locator(
      'input[placeholder="Enter the name of the new folder"]'
    );
    await folderInput.waitFor({ state: "visible" });
    await folderInput.fill("a b c d");

    const validationError = page.locator(
      "text=Must contain only a-z, A-Z, 0-9, -, _, ., or /."
    );
    await expect(validationError).toBeVisible();

    // This Button disables via pointer-events-none styling, not a native disabled attr.
    await expect(page.locator('button:has-text("Create")')).toHaveClass(
      /pointer-events-none/
    );
  });
});
