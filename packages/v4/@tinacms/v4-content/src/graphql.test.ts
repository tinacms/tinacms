import { readFileSync } from 'node:fs';
import path from 'node:path';
import { buildDotTinaFiles } from '@tinacms/graphql';
import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { lockToGraphQL, toV3Collection } from './graphql';
import { parseTinaLock } from './lock';
import type { CollectionSchema } from './schema';

const FIXTURE = path.resolve(__dirname, '../fixtures/kitchen-sink');

const fixture = (file: string): string =>
  readFileSync(path.join(FIXTURE, file), 'utf8');

const lockWith = (collections: CollectionSchema[]) => ({
  schema: {
    collections,
    version: { fullVersion: '0.0.0', major: '0', minor: '0', patch: '0' },
  },
});

const author: CollectionSchema = {
  name: 'author',
  path: 'content/authors',
  format: 'md',
  fields: [{ name: 'name', type: 'string' }],
};

const tagged: CollectionSchema = {
  name: 'tagged',
  path: 'content/tagged',
  format: 'md',
  fields: [
    {
      name: 'tags',
      type: 'array',
      of: { name: 'tag', type: 'select' },
    } as CollectionSchema['fields'][number],
  ],
};

describe('lockToGraphQL', () => {
  it('builds the golden schema and lookup from the fixture lock', async () => {
    const lock = parseTinaLock(fixture('tina-lock.json'));
    const result = await lockToGraphQL(lock);
    expect(`${print(result.graphQLSchema)}\n`).toBe(
      fixture('expected/graphql.graphql')
    );
    expect(`${JSON.stringify(result.lookup, null, 2)}\n`).toBe(
      fixture('expected/lookup.json')
    );
    expect(result.skipped).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('skips a collection with a field type v3 cannot serve, where v3 throws', async () => {
    await expect(
      buildDotTinaFiles({
        config: { schema: { collections: [toV3Collection(tagged)] } },
        buildSDK: false,
      })
    ).rejects.toThrow();
    const result = await lockToGraphQL(lockWith([author, tagged]));
    expect(result.skipped).toEqual([
      {
        collection: 'tagged',
        reason: 'The field type "select" has no GraphQL type in the v3 engine.',
      },
    ]);
    const sdl = print(result.graphQLSchema);
    expect(sdl).toContain('type Author implements');
    expect(sdl).not.toContain('type Tagged implements');
  });

  it('finds an unserved type inside templates and object fields', async () => {
    const nested: CollectionSchema = {
      name: 'page',
      format: 'md',
      path: 'content/pages',
      fields: [
        {
          name: 'blocks',
          type: 'array',
          templates: [
            {
              name: 'hero',
              fields: [
                {
                  name: 'meta',
                  type: 'object',
                  fields: [{ name: 'tint', type: 'color' }],
                } as CollectionSchema['fields'][number],
              ],
            },
          ],
        },
      ],
    };
    const result = await lockToGraphQL(lockWith([author, nested]));
    expect(result.skipped).toEqual([
      {
        collection: 'page',
        reason: 'The field type "color" has no GraphQL type in the v3 engine.',
      },
    ]);
  });

  it('skips a collection that references a skipped collection, through a chain', async () => {
    const linker: CollectionSchema = {
      name: 'linker',
      path: 'content/linkers',
      format: 'md',
      fields: [{ name: 'to', type: 'reference', collections: ['tagged'] }],
    };
    const chained: CollectionSchema = {
      name: 'chained',
      path: 'content/chained',
      format: 'md',
      fields: [{ name: 'to', type: 'reference', collections: ['linker'] }],
    };
    const result = await lockToGraphQL(
      lockWith([chained, linker, tagged, author])
    );
    expect(result.skipped.map(({ collection }) => collection)).toEqual([
      'tagged',
      'linker',
      'chained',
    ]);
    expect(result.skipped[1].reason).toBe(
      'It references the collection "tagged", which is skipped.'
    );
    expect(print(result.graphQLSchema)).toContain('type Author implements');
  });

  it('builds a schema when it skips every collection', async () => {
    const result = await lockToGraphQL(lockWith([tagged]));
    expect(result.skipped.map(({ collection }) => collection)).toEqual([
      'tagged',
    ]);
    expect(print(result.graphQLSchema)).toContain('type Query');
  });

  it('warns about a multi-format collection that is skipped too', async () => {
    const result = await lockToGraphQL(
      lockWith([author, { ...tagged, format: ['md', 'json'] }])
    );
    expect(result.skipped.map(({ collection }) => collection)).toEqual([
      'tagged',
    ]);
    expect(result.warnings).toEqual([
      'Collection "tagged" declares formats md, json, but GraphQL indexes "md" only — json documents are editable but will not appear in query results.',
    ]);
  });

  it('returns a warning for each collection with more than one format', async () => {
    const result = await lockToGraphQL(
      lockWith([{ ...author, format: ['md', 'json'] }])
    );
    expect(result.warnings).toEqual([
      'Collection "author" declares formats md, json, but GraphQL indexes "md" only — json documents are editable but will not appear in query results.',
    ]);
  });
});
