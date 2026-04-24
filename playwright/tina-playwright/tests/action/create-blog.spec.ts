import { test, expect } from "../../fixtures/test-content";

test.describe("Create Blog Post", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      "/admin/index.html#/collections/new/post/~/",
      { waitUntil: "domcontentloaded" }
    );
    //Need to dismiss the popup dialog to enter edit mode
    //TODO : Remove this click once figure out how the dialog state changes (ideal solution is to set the relevant state when the page load dialog dismiss during the e2e test)
    page.click('button[data-test="enter-edit-mode"]');
  });

  const blogTitle = "Test Blog Title";
  const blogContent = "This is a test blog content.";
  const blogFilename = "playwright-test-post";

  test("should be able to create a blog", async ({ page, contentCleanup }) => {
    await page.fill('input[name="title"]', blogTitle);

    await page.fill('textarea[name="body"]', blogContent);

    await page.fill('input[name="filename"]', blogFilename);

    await page.click('button:has-text("Save")');

    // Register for automatic teardown immediately after save,
    // so cleanup runs even if the subsequent lookup/assertion fails
    contentCleanup.track("post", `${blogFilename}.md`);

    await page.goto("/admin/index.html#/collections/post/~");

    const blogPost = page.locator(`text=${blogFilename}`).first();
    await expect(blogPost).toBeVisible();
  });

  test("should reject filenames with spaces", async ({ page }) => {
    await page.fill('input[name="title"]', "Title");
    await page.fill('input[name="filename"]', "file with spaces");

    // Trigger validation by blurring the filename field
    await page.locator('input[name="filename"]').blur();

    const validationError = page.locator(
      'text=Must contain only a-z, A-Z, 0-9, -, _, ., or /.'
    );
    await expect(validationError).toBeVisible();
  });
});
