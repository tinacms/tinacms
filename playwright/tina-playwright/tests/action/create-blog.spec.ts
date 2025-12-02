import { test, expect } from "@playwright/test";
import deleteBlogPost from "../../utils/deleteBlogPost";

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
  const blogFilename = "This File is Created From Playwright Test";
  let isNewBlogCreated = false;

  test("should be able to create a blog", async ({ page }) => {
    await page.fill('input[name="title"]', blogTitle);

    await page.fill('textarea[name="body"]', blogContent);

    await page.fill('input[name="filename"]', blogFilename);

    await page.click('button:has-text("Save")');

    // After clicking Save, the user should be redirected to the edit page
    // Wait for the navigation to complete
    await page.waitForURL('**/collections/edit/post/**', { timeout: 5000 });

    // Verify we're on the edit page by checking for the Save button (which is present in edit mode)
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
    isNewBlogCreated = true;
  });

  test.afterEach(async () => {
    if (isNewBlogCreated) {
      const collection = "post";
      const relativePath = `${blogFilename}.md`;

      try {
        //TODO: Another better way calling the backend is using the import client from the generated/client
        await deleteBlogPost(collection, relativePath);
      } catch (error) {
        console.error("Error deleting blog post:", error);
      }
    }
  });
});
