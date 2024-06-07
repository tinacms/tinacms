import { test, expect } from "@playwright/test";

test.describe("Create Blog Post", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      "http://localhost:3000/admin/index.html#/collections/new/post/~/",
      { waitUntil: "domcontentloaded" }
    );

    //Need to dismiss the popup dialog to enter edit mode
    //TODO : Remove this click once figure out how the dialog state changes (ideal solution is to set the relevant state when the page load dialog dismiss during the e2e test)
    page.click('button[data-test="enter-edit-mode"]');
  });

  const blogTitle = "Test Blog Title";
  const blogContent = "This is a test blog content.";
  const blogFilename = "My_Document";
  let isNewBlogCreated = false;

  test("should be able to create a blog", async ({ page }) => {
    const input = page.locator('input[name="title"]');

    await input.fill(blogTitle);

    await page.fill('textarea[name="body"]', blogContent);

    await page.fill('input[name="filename"]', blogFilename);

    await page.click('button:has-text("Save")');

    await page.goto(
      "http://localhost:3000/admin/index.html#/collections/post/~"
    );

    const blogPost = await page.locator(`text=${blogFilename}`);
    await expect(blogPost).toBeVisible();
    isNewBlogCreated = true;
  });

  test.afterEach(async ({ page }) => {
    if (isNewBlogCreated) {
      await page.goto(
        "http://localhost:3000/admin/index.html#/collections/post/~",
        { waitUntil: "domcontentloaded" }
      );

      const dropdownButton = page.locator('button[aria-haspopup="dialog"]');
      await dropdownButton.click();

      const deleteOption = page.locator(
        'span[data-test="deleteOverflowButton"]'
      );
      await deleteOption.waitFor();
      await deleteOption.click();

      const confirmDeleteButton = page.locator("button", { hasText: "Delete" });
      await confirmDeleteButton.waitFor();
      await confirmDeleteButton.click();

      const blogPost = await page.locator(`text=${blogFilename}`);
      await expect(blogPost).toBeHidden();
    }
  });
});
