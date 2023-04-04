import { test, expect } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await page.getByRole('paragraph').click()
  await page.getByRole('paragraph').click()
  await page.getByRole('textbox').nth(1).fill('Hello, world!')
  await page.getByRole('textbox').nth(1).press('Enter')
  await page
    .getByRole('textbox')
    .filter({ hasText: /^Hello, world!$/ })
    .press('Enter')
  await page
    .getByRole('textbox')
    .filter({ hasText: /^Hello, world!$/ })
    .fill('Hello, world!\n\n\n\n\nconst test = "yes"')
  await page
    .getByText('Hello, world!const test = "yes"This is a new')
    .fill(
      'Hello, world!\n\n\n\n\nconst test = "yes"\n\nThis is a new paragraph'
    )
  await page
    .getByText('Hello, world!const test = "yes"This is a new')
    .press('Enter')
  await page
    .getByText('Hello, world!const test = "yes"This is a new paragraph')
    .fill(
      'Hello, world!\n\n\n\n\nconst test = "yes"\n\nThis is a new paragraph\n\nand here is a list'
    )
  await page
    .getByText('Hello, world!const test = "yes"This is a new paragraph')
    .press('Enter')
  await page
    .getByText(
      'Hello, world!const test = "yes"This is a new paragraphand here is a list'
    )
    .fill(
      'Hello, world!\n\n\n\n\nconst test = "yes"\n\nThis is a new paragraph\n\nand here is a list\n\nwith a sub-paragraph'
    )
  await page
    .getByText(
      'Hello, world!const test = "yes"This is a new paragraphand here is a list'
    )
    .press('Enter')
  await page
    .getByText(
      'Hello, world!const test = "yes"This is a new paragraphand here is a listwith a s'
    )
    .fill(
      'Hello, world!\n\n\n\n\nconst test = "yes"\n\nThis is a new paragraph\n\nand here is a list\n\nwith a sub-paragraph\n\nAnd even a blockquote'
    )
  await page
    .getByText(
      'Hello, world!const test = "yes"This is a new paragraphand here is a listwith a s'
    )
    .press('Enter')
  await page
    .getByText(
      'Hello, world!const test = "yes"This is a new paragraphand here is a listwith a s'
    )
    .press('Enter')
  await page
    .getByText(
      'Hello, world!const test = "yes"This is a new paragraphand here is a listwith a s'
    )
    .press('Enter')
  await page
    .getByText(
      'Hello, world!const test = "yes"This is a new paragraphand here is a listwith a s'
    )
    .fill(
      'Hello, world!\n\n\n\n\nconst test = "yes"\n\nThis is a new paragraph\n\nand here is a list\n\nwith a sub-paragraph\n\nAnd even a blockquote\n\nYou can get out if it with a couple of returns'
    )
  await page
    .getByText(
      'Hello, world!const test = "yes"This is a new paragraphand here is a listwith a s'
    )
    .press('Enter')
  await page
    .getByText(
      'Hello, world!const test = "yes"This is a new paragraphand here is a listwith a s'
    )
    .press('Enter')
  await page
    .getByText(
      'Hello, world!const test = "yes"This is a new paragraphand here is a listwith a s'
    )
    .press('Enter')
  await page
    .getByText(
      'Hello, world!const test = "yes"This is a new paragraphand here is a listwith a s'
    )
    .fill(
      'Hello, world!\n\n\n\n\nconst test = "yes"\n\nThis is a new paragraph\n\nand here is a list\n\nwith a sub-paragraph\n\nAnd even a blockquote\n\nYou can get out if it with a couple of returns\n\nAnd then more returns to get all the way out of it.'
    )
})
