import { expect, Page } from '@playwright/test';

export async function checkMarkdownOutput(
  page: Page,
  inputText: string,
  expectedText: string,
  expectedTag: string
) {
  // Wait for the page content to be ready
  await page.waitForSelector('[data-test="form:content/page/home.mdx"]', {
    state: 'visible',
  });

  // Check if the overflow menu button exists
  if (
    await page.getByTestId('rich-text-editor-overflow-menu-button').isVisible()
  ) {
    // Click the overflow button if it's visible
    await page.getByTestId('rich-text-editor-overflow-menu-button').click();
  }

  await page.getByTestId('markdown-button').click();

  // The rich text editor uses a custom <div role="textbox"> element, not a standard input/textarea.
  // For such elements, we need to click to focus, then use keyboard.type() instead of .fill()
  const textbox = page.getByRole('textbox');
  await textbox.click();
  await page.keyboard.type(inputText);

  // Content is rendered by iframe
  const iframe = page.frameLocator('iframe[data-test="tina-iframe"]');

  // Locate the expected tag inside the iframe content and check if it contains the correct text
  const element = iframe.locator(expectedTag);

  // Assert that the expected element exists
  await expect(element).toBeVisible();

  // Assert that the expected element contains the correct text
  await expect(element).toHaveText(expectedText);
}
