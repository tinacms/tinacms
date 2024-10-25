import { test } from "@playwright/test";
import { checkMarkdownOutput } from "./markdown-parsing-utils";

//Skipping this test due to new line is not supported
test.skip("should be able to parse newline from markdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/admin/index.html#/~", {
      waitUntil: "domcontentloaded",
    });

    page.click('button[data-test="enter-edit-mode"]');
  });

  test("Newline is correctly rendered from markdown using \n", async ({
    page,
  }) => {
    await checkMarkdownOutput(
      page,
      "First line \n Second line",
      "First line Second line",
      "p"
    );
  });
});
