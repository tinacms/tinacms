// Originally from
// https://github.com/vercel/next.js/blob/canary/packages/create-next-app/helpers/examples.ts
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { x } from 'tar';

export type RepoInfo = {
  username: string;
  name: string;
  branch: string;
  filePath: string;
};

async function downloadTarStream(url: string) {
  const res = await fetch(url);

  if (!res.body) {
    throw new Error(`Failed to download: ${url}`);
  }

  return Readable.fromWeb(res.body as import('stream/web').ReadableStream);
}

export async function downloadAndExtractRepo(
  root: string,
  { username, name, branch, filePath }: RepoInfo
) {
  await pipeline(
    await downloadTarStream(
      `https://codeload.github.com/${username}/${name}/tar.gz/${branch}`
    ),
    x({
      cwd: root,
      strip: filePath ? filePath.split('/').length + 1 : 1,
      filter: (p) =>
        p.startsWith(
          `${name}-${branch.replace(/\//g, '-')}${
            filePath ? `/${filePath}/` : '/'
          }`
        ),
    })
  );
}

export async function downloadAndExtractExample(root: string, name: string) {
  if (name === '__internal-testing-retry') {
    throw new Error('This is an internal example for testing the CLI.');
  }

  await pipeline(
    await downloadTarStream(
      'https://codeload.github.com/vercel/next.js/tar.gz/canary'
    ),
    x({
      cwd: root,
      strip: 2 + name.split('/').length,
      filter: (p) => p.includes(`next.js-canary/examples/${name}/`),
    })
  );
}
