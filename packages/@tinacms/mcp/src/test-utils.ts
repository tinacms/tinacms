import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  buildDotTinaFiles,
  createDatabaseInternal,
  FilesystemBridge,
  resolve,
  type Schema,
} from '@tinacms/graphql';
import { MemoryLevel } from 'memory-level';
import type { FetchLike } from './client';

export const schema: Schema = {
  collections: [
    {
      name: 'post',
      label: 'Posts',
      path: 'content/posts',
      format: 'md',
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Title',
          isTitle: true,
          required: true,
        },
        { type: 'string', name: 'tags', label: 'Tags', list: true },
        { type: 'boolean', name: 'draft', label: 'Draft' },
        { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
      ],
    },
    {
      name: 'page',
      label: 'Pages',
      path: 'content/pages',
      format: 'json',
      templates: [
        {
          name: 'hero',
          label: 'Hero',
          fields: [
            { type: 'string', name: 'headline', label: 'Headline' },
            { type: 'string', name: 'cta', label: 'Call to action' },
          ],
        },
        {
          name: 'text',
          label: 'Text',
          fields: [{ type: 'string', name: 'text', label: 'Text' }],
        },
      ],
    },
  ],
};

const FIRST_POST = `---
title: Hello world
tags:
  - intro
draft: true
---

First paragraph.
`;

/**
 * A real TinaCMS database over a temporary project folder, exposed as a
 * `fetch` that answers GraphQL requests the way `tinacms dev` does.
 */
export const createTinaProject = async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tinacms-mcp-'));
  await fs.mkdir(path.join(root, 'content/posts'), { recursive: true });
  await fs.mkdir(path.join(root, 'content/pages'), { recursive: true });
  await fs.writeFile(path.join(root, 'content/posts/hello.md'), FIRST_POST);
  await fs.writeFile(
    path.join(root, 'content/pages/home.json'),
    JSON.stringify({ _template: 'hero', headline: 'Welcome', cta: 'Sign up' })
  );

  const database = await createDatabaseInternal({
    bridge: new FilesystemBridge(root),
    level: new MemoryLevel<string, Record<string, unknown>>({
      valueEncoding: 'json',
    }),
    tinaDirectory: '.tina',
  });
  const { graphQLSchema, tinaSchema, lookup } = await buildDotTinaFiles({
    config: { schema },
  });
  await database.indexContent({ graphQLSchema, tinaSchema, lookup });

  const requests: { headers: Record<string, string> }[] = [];
  const fetchImpl: FetchLike = async (_url, init) => {
    const { query, variables } = JSON.parse(String(init?.body));
    requests.push({ headers: init?.headers as Record<string, string> });
    const result = await resolve({
      query,
      variables,
      database,
      silenceErrors: true,
      verbose: false,
    });
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  };

  return {
    root,
    fetch: fetchImpl,
    requests,
    read: (relativePath: string) =>
      fs.readFile(path.join(root, relativePath), 'utf8'),
    cleanup: () => fs.rm(root, { recursive: true, force: true }),
  };
};
