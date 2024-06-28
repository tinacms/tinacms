import { test, expect } from "@playwright/test";
import deleteBlogPost from "../utils/deleteBlogPost";
import { client } from "../tina/__generated__/client";

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
    await page.fill('input[name="title"]', blogTitle);

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

  test.afterEach(async () => {
    if (isNewBlogCreated) {
      const collection = "post";
      const relativePath = `${blogFilename}.md`;

      try {
        //TODO: Another better way calling the backend is using the import client from the generated/client
        const response = await deleteBlogPost(collection, relativePath);
        console.log("Delete response:", response);
      } catch (error) {
        console.error("Error deleting blog post:", error);
      }
    }
  });
});
