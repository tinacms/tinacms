import { test } from "@playwright/test";
import { checkMarkdownOutput } from "./markdown-parsing-utils";

test.describe("should be able to parse italic from markdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/admin/index.html#/~", {
      waitUntil: "domcontentloaded",
    });

    page.click('button[data-test="enter-edit-mode"]');
  });

  test("Italic is correctly rendered from markdown using *", async ({
    page,
  }) => {
    await checkMarkdownOutput(
      page,
      "Testing *Italic* rendering correctly in markdown",
      "Italic",
      "em"
    );
  });

  test("Italic is correctly rendered from markdown using _", async ({
    page,
  }) => {
    await checkMarkdownOutput(
      page,
      "Testing _Italic_ rendering correctly in markdown",
      "Italic",
      "em"
    );
  });
});
