// The `tinacms init` command. It writes the files that a v4 project commits (the CLI
// rule in packages/v4/README.md): the starter tina/config.ts with the plugin
// registration, and one document to open. It does not wrap a process, and it does not
// edit a file that exists. A file belongs to the project once it is written, so a
// second run keeps every one of them. The admin route is codegen's, not init's.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CONFIG_TEMPLATE = `// The content model of this project. Two consumers import it: the Vite plugin runs it
// in node to serve the local data layer, and the admin imports it in the browser. One
// declaration serves both, so the two cannot drift.

import {
  type CollectionSchema,
  defineConfig,
  localContentPlugin,
  t,
} from '@tinacms/tinacms';

export const postCollection = {
  name: 'post',
  label: 'Posts',
  path: 'content/posts',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title', required: true }),
  ],
} satisfies CollectionSchema;

export default defineConfig({
  plugins: [localContentPlugin()],
  schema: { collections: [postCollection] },
});
`;

const FIRST_DOCUMENT_TEMPLATE = `---
title: Hello World
---

Write your first post here. A save in the admin writes this file back to disk.
`;

export const INIT_FILES: { relativePath: string; content: string }[] = [
  { relativePath: path.join('tina', 'config.ts'), content: CONFIG_TEMPLATE },
  {
    relativePath: path.join('content', 'posts', 'hello-world.mdx'),
    content: FIRST_DOCUMENT_TEMPLATE,
  },
];

// The admin route itself comes from codegen, not init: `tinacms codegen` (and the
// Vite plugin on dev) scaffolds public/admin/index.html, tina/admin.tsx, and
// tina/admin.css once. After that the project owns them.
export const INIT_NEXT_STEPS = `
Next steps:

  1. Mount Tina in vite.config.ts:

       import { tinaLocalDataLayerVitePlugin } from '@tinacms/tinacms/local-data-layer/vite';
       // ...
       plugins: [
         tinaLocalDataLayerVitePlugin({ rootDir, config: tina }),
       ],

  2. Run the dev server of your framework, and open /admin/. There is no \`tinacms dev\`.
     Dev runs codegen for you: it scaffolds public/admin/index.html, tina/admin.tsx,
     and tina/admin.css (yours to edit), and refreshes tina/tina-lock.json — commit them.
`;

export interface InitOptions {
  rootDir: string;
}

export type InitFileOutcome =
  | 'created'
  // The file exists, so init left it as it is. The project owns it.
  | 'kept';

export interface InitResult {
  files: { path: string; outcome: InitFileOutcome }[];
}

export const runInit = async (options: InitOptions): Promise<InitResult> => {
  const files: InitResult['files'] = [];
  for (const { relativePath, content } of INIT_FILES) {
    const target = path.join(options.rootDir, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    try {
      await writeFile(target, content, { flag: 'wx' });
      files.push({ path: target, outcome: 'created' });
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code !== 'EEXIST') throw cause;
      files.push({ path: target, outcome: 'kept' });
    }
  }
  return { files };
};
