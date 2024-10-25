import { test } from "@playwright/test";
import { checkMarkdownOutput } from "./markdown-parsing-utils";

test.describe("should be able to parse bold from markdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/admin/index.html#/~", {
      waitUntil: "domcontentloaded",
    });

    page.click('button[data-test="enter-edit-mode"]');
  });

  test("Bold is correctly rendered from markdown using **", async ({
    page,
  }) => {
    await checkMarkdownOutput(
      page,
      "Testing **Bold** rendering correctly in markdown",
      "Bold",
      "strong"
    );
  });

  test("Bold is correctly rendered from markdown using __", async ({
    page,
  }) => {
    await checkMarkdownOutput(
      page,
      "Testing __Bold__ rendering correctly in markdown",
      "Bold",
      "strong"
    );
  });
});
