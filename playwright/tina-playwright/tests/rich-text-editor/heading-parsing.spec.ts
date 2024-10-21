import { test } from "@playwright/test";
import { checkMarkdownOutput } from "./markdown-parsing-utils";

test.describe("should be able to parse heading from markdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/admin/index.html#/~", {
      waitUntil: "domcontentloaded",
    });

    page.click('button[data-test="enter-edit-mode"]');
  });

  test("Heading1 is correctly rendered from markdown using #", async ({
    page,
  }) => {
    await checkMarkdownOutput(page, "# Testing H1 \n", "Testing H1", "h1");
  });

  test("Heading6 is correctly rendered from markdown using ######", async ({
    page,
  }) => {
    await checkMarkdownOutput(page, "###### Testing H6 \n", "Testing H6", "h6");
  });
});
