import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { dispatchContentRequest } from './content-request';
import { type LocalDataLayer, createLocalDataLayer } from './local-data-layer';

const HELLO_RAW = `---
title: Hello World
featured: false
---

Body prose.
`;

let rootDir: string;
let dataLayer: LocalDataLayer;

beforeEach(async () => {
  rootDir = await fs.mkdtemp(path.join(tmpdir(), 'tina-graphql-'));
  await fs.mkdir(path.join(rootDir, 'content/posts'), { recursive: true });
  await fs.writeFile(path.join(rootDir, 'content/posts/hello.mdx'), HELLO_RAW);
  dataLayer = createLocalDataLayer({
    rootDir,
    collections: [
      {
        name: 'post',
        path: 'content/posts',
        format: 'mdx',
        fields: [
          { name: 'title', type: 'string', required: true },
          { name: 'featured', type: 'boolean' },
          { name: 'body', type: 'rich-text', isBody: true },
        ],
      },
    ],
  });
});

afterEach(() => fs.rm(rootDir, { recursive: true, force: true }));

describe('graphql (the v3 pipeline)', () => {
  it('answers a v3 single-document query', async () => {
    const result = await dataLayer.graphql(
      'query($relativePath: String!) { post(relativePath: $relativePath) { title featured } }',
      { relativePath: 'hello.mdx' }
    );
    expect(result.errors).toBeUndefined();
    expect(result.data?.post).toMatchObject({
      title: 'Hello World',
      featured: false,
    });
  });

  it('answers a v3 connection (list) query', async () => {
    const result = await dataLayer.graphql(
      'query { postConnection { edges { node { title } } } }'
    );
    expect(result.errors).toBeUndefined();
    expect(result.data?.postConnection).toMatchObject({
      edges: [{ node: { title: 'Hello World' } }],
    });
  });

  it('sees a save made after the pipeline booted (reindex-on-save)', async () => {
    await dataLayer.graphql('query { postConnection { totalCount } }');
    await dataLayer.update('post', 'content/posts/hello.mdx', {
      title: 'Renamed',
      featured: true,
    });
    const result = await dataLayer.graphql(
      'query { post(relativePath: "hello.mdx") { title } }'
    );
    expect(result.data?.post).toMatchObject({ title: 'Renamed' });
  });

  it('serves the markdown body as the v3 mdx AST, surviving a frontmatter save', async () => {
    const query = 'query { post(relativePath: "hello.mdx") { body } }';
    const before = await dataLayer.graphql(query);
    expect(before.errors).toBeUndefined();
    expect(before.data?.post).toMatchObject({
      body: {
        type: 'root',
        children: [
          { type: 'p', children: [{ type: 'text', text: 'Body prose.' }] },
        ],
      },
    });
    await dataLayer.update('post', 'content/posts/hello.mdx', {
      title: 'Renamed',
      featured: true,
    });
    // The query selects only the body, so the whole envelope must round-trip.
    const after = await dataLayer.graphql(query);
    expect(after.data).toEqual(before.data);
  });

  it('dispatches over the wire protocol', async () => {
    const result = await dispatchContentRequest(dataLayer, {
      op: 'graphql',
      query: 'query { post(relativePath: "hello.mdx") { title } }',
    });
    expect(result).toMatchObject({
      data: { post: { title: 'Hello World' } },
    });
  });
});
