import { test, expect } from "@playwright/test";

test.describe("Rich Text Editor Parsing Spec", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/admin/index.html#/~", {
      waitUntil: "domcontentloaded",
    });

    page.click('button[data-test="enter-edit-mode"]');
  });

  test("Italic is correctly rendered from markdown", async ({ page }) => {
    //Waiting Page content ready
    await page.waitForSelector('[data-test="form:content/page/home.mdx"]', {
      state: "visible",
    });
    // Check if the overflow menu button exists
    if (
      await page
        .getByTestId("rich-text-editor-overflow-menu-button")
        .isVisible()
    ) {
      // Click the overflow button if it's visible
      await page.getByTestId("rich-text-editor-overflow-menu-button").click();
    }

    await page.getByTestId("markdown-button").click();

    //Fill in the text with Italic
    await page.getByRole("textbox").fill("*Italic*");

    //Content is render by iframe
    const iframe = page.frameLocator('iframe[data-test="tina-iframe"]');

    // Locate the <em> tag inside the iframe content and check if it contains the correct text
    const italicElement = iframe.locator("em");

    // Assert that the italic element exists
    await expect(italicElement).toBeVisible();

    // Assert that the italic element contains the correct text
    await expect(italicElement).toHaveText("Italic");
  });
});
