import { test, expect } from "@playwright/test";

//TODO: Test is skipped because the implementation for local storage retain edit is not ready yet
test.skip("Local storage retain edit test", () => {
  const inputSelector = 'input[name="Title"]';
  const newValue = "Updated Author Name";

  test("Input value retain when page reload without saving", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:3000/admin/index.html#/collections/edit/author/first_author",
      { waitUntil: "domcontentloaded" }
    );

    //Need to dismiss the popup dialog to enter edit mode
    //TODO : Remove this click once figure out how the dialog state changes (ideal solution is to set the relevant state when the page load dialog dismiss during the e2e test)
    page.click('button[data-test="enter-edit-mode"]');
    // Fill the input field with the new value
    await page.fill('input[name="Title"]', newValue);

    // Refresh the page
    await page.reload();

    // Verify that the input field retains the new value
    const inputValue = await page.inputValue(inputSelector);
    expect(inputValue).toBe(newValue);
  });

  test("Rich text editor retains value when page reload without saving", async ({
    page,
  }) => {
    const richTextEditorSelector = 'div[contenteditable="true"]';
    const richTextNewValue = "Updated Rich Text Content";

    await page.goto(
      "http://localhost:3000/admin/index.html#/collections/edit/page/Test-rich_text_editor_local_storage",
      { waitUntil: "domcontentloaded" }
    );

    // Need to dismiss the popup dialog to enter edit mode
    // TODO: Remove this click once figure out how the dialog state changes (ideal solution is to set the relevant state when the page load dialog dismiss during the e2e test)
    await page.click('button[data-test="enter-edit-mode"]');

    // Fill the rich text editor with the new value
    await page.fill(richTextEditorSelector, richTextNewValue);

    // Refresh the page
    await page.reload();

    // Verify that the rich text editor retains the new value
    const richTextValue = await page.evaluate(() => {
      const span = document.querySelector('span[data-slate-string="true"]');
      return span ? span.innerHTML : "";
    });

    expect(richTextValue).toBe(richTextNewValue);
  });
});
