import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, describe, expect, it } from 'vitest';
import { createServer } from './server';
import { createTinaProject } from './test-utils';

type Project = Awaited<ReturnType<typeof createTinaProject>>;

const cleanups: (() => Promise<unknown>)[] = [];
afterEach(async () => {
  await Promise.all(cleanups.splice(0).map((fn) => fn()));
});

const connect = async (
  project: Project,
  allowWrites: boolean,
  token?: string
) => {
  const server = createServer({
    url: 'http://localhost:4001/graphql',
    fetch: project.fetch,
    allowWrites,
    token,
  });
  const client = new Client({ name: 'test', version: '0.0.0' });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  cleanups.push(() => client.close());
  return client;
};

const setup = async (allowWrites: boolean, token?: string) => {
  const project = await createTinaProject();
  cleanups.push(project.cleanup);
  const client = await connect(project, allowWrites, token);
  const call = async (name: string, args: Record<string, unknown> = {}) => {
    const result = await client.callTool({ name, arguments: args });
    const [first] = result.content as { type: string; text: string }[];
    return { isError: result.isError === true, text: first.text };
  };
  return { project, client, call };
};

describe('tool registration', () => {
  it('exposes only the read tools by default', async () => {
    const { client } = await setup(false);
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      'get_document',
      'list_collections',
      'list_documents',
    ]);
    expect(tools.every((t) => t.annotations?.readOnlyHint === true)).toBe(true);
  });

  it('adds create and update when writes are allowed', async () => {
    const { client } = await setup(true);
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      'create_document',
      'get_document',
      'list_collections',
      'list_documents',
      'update_document',
    ]);
  });
});

describe('read tools', () => {
  it('lists collections with their fields', async () => {
    const { call } = await setup(false);
    const result = await call('list_collections');
    expect(result.isError).toBe(false);
    const [post] = JSON.parse(result.text);
    expect(post).toMatchObject({ name: 'post', label: 'Posts', format: 'md' });
    expect(post.fields.map((f: { name: string }) => f.name)).toEqual([
      'title',
      'tags',
      'draft',
      'body',
    ]);
    expect(post.fields[0]).toMatchObject({ type: 'string', required: true });
    expect(post.fields[1]).toMatchObject({ list: true });
  });

  it('lists documents in a collection', async () => {
    const { call } = await setup(false);
    const result = await call('list_documents', { collection: 'post' });
    const parsed = JSON.parse(result.text);
    expect(parsed.totalCount).toBe(1);
    expect(parsed.documents).toEqual([
      { relativePath: 'hello.md', title: 'Hello world', template: 'post' },
    ]);
    expect(parsed.pageInfo.hasNextPage).toBe(false);
  });

  it('pages through documents', async () => {
    const { call } = await setup(true);
    for (const name of ['b', 'c']) {
      await call('create_document', {
        collection: 'post',
        relativePath: `${name}.md`,
        values: { title: `Post ${name}` },
      });
    }
    const first = JSON.parse(
      (await call('list_documents', { collection: 'post', first: 2 })).text
    );
    expect(first.documents).toHaveLength(2);
    expect(first.pageInfo.hasNextPage).toBe(true);
    const second = JSON.parse(
      (
        await call('list_documents', {
          collection: 'post',
          first: 2,
          after: first.pageInfo.endCursor,
        })
      ).text
    );
    expect(second.documents).toHaveLength(1);
    expect(second.pageInfo.hasNextPage).toBe(false);
    const seen = [...first.documents, ...second.documents].map(
      (d: { relativePath: string }) => d.relativePath
    );
    expect(new Set(seen).size).toBe(3);
  });

  it('reads one document', async () => {
    const { call } = await setup(false);
    const result = await call('get_document', {
      collection: 'post',
      relativePath: 'hello.md',
    });
    const doc = JSON.parse(result.text);
    expect(doc.relativePath).toBe('hello.md');
    expect(doc.values).toMatchObject({
      title: 'Hello world',
      tags: ['intro'],
      draft: true,
    });
  });

  it('reports a missing document as a tool error', async () => {
    const { call } = await setup(false);
    const result = await call('get_document', {
      collection: 'post',
      relativePath: 'nope.md',
    });
    expect(result.isError).toBe(true);
    expect(result.text).toMatch(/^Tina error: /);
  });

  it('sends the token as X-API-KEY', async () => {
    const { project, call } = await setup(false, 'secret-token');
    await call('list_collections');
    expect(project.requests[0].headers['X-API-KEY']).toBe('secret-token');
  });
});

describe('write tools', () => {
  it('creates a document on disk', async () => {
    const { project, call } = await setup(true);
    const result = await call('create_document', {
      collection: 'post',
      relativePath: 'second.md',
      values: { title: 'Second post', tags: ['a', 'b'], draft: false },
    });
    expect(result.isError).toBe(false);
    expect(JSON.parse(result.text).values.title).toBe('Second post');
    const file = await project.read('content/posts/second.md');
    expect(file).toContain('title: Second post');
    expect(file).toContain('- a');
  });

  it('updates only the fields that were passed', async () => {
    const { project, call } = await setup(true);
    const result = await call('update_document', {
      collection: 'post',
      relativePath: 'hello.md',
      values: { draft: false },
    });
    expect(result.text).not.toMatch(/error/i);
    expect(result.isError).toBe(false);
    const file = await project.read('content/posts/hello.md');
    expect(file).toContain('draft: false');
    expect(file).toContain('title: Hello world');
    expect(file).toContain('- intro');
    expect(file).toContain('First paragraph.');
  });

  it('rejects a value that breaks the schema and writes nothing', async () => {
    const { project, call } = await setup(true);
    const before = await project.read('content/posts/hello.md');
    const result = await call('update_document', {
      collection: 'post',
      relativePath: 'hello.md',
      values: { draft: 'not-a-boolean' },
    });
    expect(result.isError).toBe(true);
    expect(result.text).toMatch(/^Tina error: /);
    expect(await project.read('content/posts/hello.md')).toBe(before);
  });

  it('creates and updates a document in a collection with templates', async () => {
    const { project, call } = await setup(true);
    const created = await call('create_document', {
      collection: 'page',
      relativePath: 'about.json',
      template: 'text',
      values: { text: 'About us' },
    });
    expect(created.text).not.toMatch(/error/i);
    expect(JSON.parse(await project.read('content/pages/about.json'))).toEqual({
      _template: 'text',
      text: 'About us',
    });

    const updated = await call('update_document', {
      collection: 'page',
      relativePath: 'home.json',
      values: { headline: 'Welcome back' },
    });
    expect(updated.text).not.toMatch(/error/i);
    expect(JSON.parse(await project.read('content/pages/home.json'))).toEqual({
      _template: 'hero',
      headline: 'Welcome back',
      cta: 'Sign up',
    });
  });

  it('asks for a template when the collection has several', async () => {
    const { project, call } = await setup(true);
    const result = await call('create_document', {
      collection: 'page',
      relativePath: 'about.json',
      values: { text: 'About us' },
    });
    expect(result.isError).toBe(true);
    expect(result.text).toContain('hero, text');
    await expect(project.read('content/pages/about.json')).rejects.toThrow();
  });

  it('rejects a template on a collection that has none', async () => {
    const { call } = await setup(true);
    const result = await call('create_document', {
      collection: 'post',
      relativePath: 'x.md',
      template: 'post',
      values: { title: 'x' },
    });
    expect(result.isError).toBe(true);
    expect(result.text).toContain('no templates');
  });

  it('refuses to create over an existing document', async () => {
    const { project, call } = await setup(true);
    const before = await project.read('content/posts/hello.md');
    const result = await call('create_document', {
      collection: 'post',
      relativePath: 'hello.md',
      values: { title: 'Overwritten' },
    });
    expect(result.isError).toBe(true);
    expect(await project.read('content/posts/hello.md')).toBe(before);
  });

  it('refuses to update a document that does not exist', async () => {
    const { call } = await setup(true);
    const result = await call('update_document', {
      collection: 'post',
      relativePath: 'ghost.md',
      values: { title: 'x' },
    });
    expect(result.isError).toBe(true);
  });
});
