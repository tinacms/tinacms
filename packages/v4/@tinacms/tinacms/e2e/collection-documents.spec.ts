import { promises as fs } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const POSTS = path.resolve('playground/content/posts');
const LINKED = path.join(POSTS, 'guides/getting-started.mdx');
const RENAMED = path.join(POSTS, 'guides/started-guide.mdx');
const REFERRER = path.join(POSTS, 'related-post.mdx');

test.describe.configure({ mode: 'serial' });

test('renaming a post rewrites the post that references it', async ({
  page,
}) => {
  const linkedBefore = await fs.readFile(LINKED, 'utf8');
  const referrerBefore = await fs.readFile(REFERRER, 'utf8');
  try {
    await page.goto('/#/collections/post/folder/guides');
    await page
      .getByRole('button', { name: 'Actions for Getting started' })
      .click();
    await page.getByRole('menuitem', { name: 'Rename' }).click();
    await page
      .getByRole('textbox', { name: 'File name' })
      .fill('started-guide');
    await page.getByRole('button', { name: 'Rename' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.reload();
    await expect(
      page.getByRole('button', { name: 'Getting started', exact: true })
    ).toBeVisible();
    await expect(fs.readFile(RENAMED, 'utf8')).resolves.toContain(
      'A post in a nested folder.'
    );
    await expect(fs.access(LINKED)).rejects.toThrow();
    const referrer = await fs.readFile(REFERRER, 'utf8');
    expect(referrer).toContain(
      'related: content/posts/guides/started-guide.mdx'
    );
    expect(referrer).not.toContain('getting-started.mdx');
  } finally {
    await fs.rm(RENAMED, { force: true });
    await fs.writeFile(LINKED, linkedBefore);
    await fs.writeFile(REFERRER, referrerBefore);
  }
});
