import type { Schema } from '@tinacms/schema-tools';
import { MemoryLevel } from 'memory-level';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSchema, createDatabaseInternal } from '..';
import type { Bridge } from '../database/bridge';
import { createResolver } from '../resolver';

class InMemoryBridge implements Bridge {
  rootPath = '';
  private files = new Map<string, string>();
  seed(filepath: string, content: string) {
    this.files.set(filepath, content);
    return this;
  }
  async glob(pattern: string) {
    return [...this.files.keys()].filter((f) => f.startsWith(pattern));
  }
  async get(filepath: string) {
    const content = this.files.get(filepath);
    if (content === undefined) throw new Error(`No file ${filepath}`);
    return content;
  }
  async put(filepath: string, content: string) {
    this.files.set(filepath, content);
  }
  async delete(filepath: string) {
    this.files.delete(filepath);
  }
  supportsBuilding() {
    return true;
  }
}

const schema: Schema = {
  collections: [
    {
      name: 'page',
      label: 'Page',
      path: 'content/pages',
      format: 'json',
      fields: [
        {
          name: 'title',
          label: 'T',
          type: 'string',
          isTitle: true,
          required: true,
        },
        {
          name: 'blocks',
          label: 'Blocks',
          type: 'object',
          list: true,
          templates: [
            {
              name: 'accordion',
              label: 'Accordion',
              fields: [
                {
                  name: 'items',
                  label: 'Items',
                  type: 'object',
                  list: true,
                  fields: [
                    {
                      name: 'body',
                      label: 'Body',
                      type: 'rich-text',
                      templates: [
                        {
                          name: 'Button',
                          label: 'Button',
                          fields: [
                            {
                              name: 'destination',
                              label: 'D',
                              type: 'object',
                              templates: [
                                {
                                  name: 'internal',
                                  label: 'I',
                                  fields: [
                                    {
                                      name: 'page',
                                      label: 'P',
                                      type: 'reference',
                                      collections: ['page'],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'post',
      label: 'Post',
      path: 'content/posts',
      format: 'mdx',
      fields: [
        {
          name: 'title',
          label: 'T',
          type: 'string',
          isTitle: true,
          required: true,
        },
        {
          name: 'body',
          label: 'Body',
          type: 'rich-text',
          isBody: true,
          templates: [
            {
              name: 'Button',
              label: 'Button',
              fields: [
                {
                  name: 'page',
                  label: 'P',
                  type: 'reference',
                  collections: ['page'],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const TARGET = 'content/pages/locations.json';

/** A page whose only reference to `target` is in an MDX component, in rich text, in a block. */
const referringPage = (target: string) => ({
  title: 'Referring',
  blocks: [
    {
      _template: 'accordion',
      items: [
        {
          body: `<Button destination={{ _template: "internal", page: "${target}" }} />`,
        },
      ],
    },
  ],
});

let database: ReturnType<typeof createDatabaseInternal>;
let resolver: ReturnType<typeof createResolver>;

const setup = async (referrerCount: number) => {
  const bridge = new InMemoryBridge();
  bridge.seed(TARGET, JSON.stringify({ title: 'Locations' }));
  for (let i = 0; i < referrerCount; i++) {
    bridge.seed(
      `content/pages/ref-${String(i).padStart(3, '0')}.json`,
      JSON.stringify(referringPage(TARGET))
    );
  }
  database = createDatabaseInternal({
    bridge,
    level: new MemoryLevel<string, Record<string, any>>({
      valueEncoding: 'json',
    }),
    tinaDirectory: 'tina',
  });
  await database.indexContent(await buildSchema({ schema }));
  resolver = createResolver({
    config: {} as never,
    database,
    tinaSchema: await database.getSchema(),
    isAudit: false,
  });
};

const referrersOf = async (target: string) => {
  const collection = (await database.getSchema()).getCollection('page');
  const found = await (
    resolver as never as {
      findReferences: (
        id: string,
        c: unknown
      ) => Promise<Record<string, Record<string, string[]>>>;
    }
  ).findReferences(target, collection);
  return Object.keys(found.page ?? {}).sort();
};

describe('the reference index over real content', () => {
  beforeEach(async () => {
    await setup(3);
  });

  it('records a reference held inside rich text inside a block', async () => {
    expect(await referrersOf(TARGET)).toEqual([
      'content/pages/ref-000.json',
      'content/pages/ref-001.json',
      'content/pages/ref-002.json',
    ]);
  });

  it('records nothing for a document nothing points at', async () => {
    expect(await referrersOf('content/pages/ref-000.json')).toEqual([]);
  });

  it('renames every reference to it, inside the rich text', async () => {
    await resolver.resolveUpdateDocument({
      collectionName: 'page',
      relativePath: 'locations.json',
      newRelativePath: 'branches.json',
    });

    for (const referrer of [
      'content/pages/ref-000.json',
      'content/pages/ref-001.json',
      'content/pages/ref-002.json',
    ]) {
      const body = (await database.get<any>(referrer)).blocks[0].items[0].body;
      expect(body).toContain('content/pages/branches.json');
      expect(body).not.toContain('content/pages/locations.json');
    }
  });

  it('reindexes the referrers so the new path is the one that is findable', async () => {
    await resolver.resolveUpdateDocument({
      collectionName: 'page',
      relativePath: 'locations.json',
      newRelativePath: 'branches.json',
    });

    expect(await referrersOf('content/pages/branches.json')).toHaveLength(3);
    expect(await referrersOf(TARGET)).toEqual([]);
  });
});

/**
 * `findReferences` passed no `first`, so it took `query`'s default page of 50: a document with more
 * referrers than that had the rest silently left dangling by a rename.
 */
describe('the reference index beyond one page of results', () => {
  it('finds every referrer, not the first fifty', async () => {
    await setup(63);

    expect(await referrersOf(TARGET)).toHaveLength(63);
  });
});

describe('a reference in the document body', () => {
  const POST = 'content/posts/hello.mdx';

  beforeEach(async () => {
    const bridge = new InMemoryBridge();
    bridge.seed(TARGET, JSON.stringify({ title: 'Locations' }));
    bridge.seed(
      POST,
      `---\ntitle: Hello\n---\n\n<Button page="${TARGET}" />\n`
    );
    database = createDatabaseInternal({
      bridge,
      level: new MemoryLevel<string, Record<string, any>>({
        valueEncoding: 'json',
      }),
      tinaDirectory: 'tina',
    });
    await database.indexContent(await buildSchema({ schema }));
    resolver = createResolver({
      config: {} as never,
      database,
      tinaSchema: await database.getSchema(),
      isAudit: false,
    });
  });

  it('is indexed', async () => {
    expect(await referrersOf(TARGET)).toEqual([POST]);
  });

  it('is rewritten when the referenced document is renamed', async () => {
    await resolver.resolveUpdateDocument({
      collectionName: 'page',
      relativePath: 'locations.json',
      newRelativePath: 'branches.json',
      params: {},
    });

    const written = await database.bridge!.get(POST);
    expect(written).toContain('content/pages/branches.json');
    expect(written).not.toContain('content/pages/locations.json');
  });
});
