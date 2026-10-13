import { describe, expect, it } from 'vitest';
import type { CollectionSchema, FieldSchema } from '../schema/types';
import { collectReferences, resolveReferences } from './references';

const collections: CollectionSchema[] = [
  { name: 'post', format: 'mdx', path: 'content/posts', fields: [] },
  { name: 'page', format: 'mdx', path: 'content/pages', fields: [] },
];

const pageReference: FieldSchema = {
  name: 'page',
  type: 'reference',
  collections: ['page'],
};

const fields: FieldSchema[] = [
  { name: 'title', type: 'string' },
  pageReference,
  {
    name: 'related',
    type: 'array',
    fields: [pageReference],
  } as FieldSchema,
  {
    name: 'blocks',
    type: 'array',
    templates: [
      { name: 'hero', fields: [{ name: 'title', type: 'string' }] },
      { name: 'featured', fields: [pageReference] },
    ],
  },
  {
    name: 'pages',
    type: 'array',
    of: pageReference,
  } as FieldSchema,
];

const page = { title: 'Test Title' };
const resolve = () => page;

describe('collectReferences', () => {
  it('names the collection that owns a stored path', () => {
    const targets = collectReferences(
      { page: 'content/pages/test.mdx' },
      fields,
      collections
    );
    expect(targets).toEqual([
      { collection: 'page', path: 'content/pages/test.mdx' },
    ]);
  });

  it('reaches references inside array items', () => {
    const targets = collectReferences(
      { related: [{ page: 'content/pages/test.mdx' }] },
      fields,
      collections
    );
    expect(targets).toEqual([
      { collection: 'page', path: 'content/pages/test.mdx' },
    ]);
  });

  it('reaches references inside template items', () => {
    const targets = collectReferences(
      {
        blocks: [
          { _template: 'hero', title: 'content/pages/test.mdx' },
          { _template: 'featured', page: 'content/pages/test.mdx' },
        ],
      },
      fields,
      collections
    );
    expect(targets).toEqual([
      { collection: 'page', path: 'content/pages/test.mdx' },
    ]);
  });

  it('reaches each reference in an `of` list', () => {
    const targets = collectReferences(
      { pages: ['content/pages/test.mdx', 'content/pages/other.mdx'] },
      fields,
      collections
    );
    expect(targets).toEqual([
      { collection: 'page', path: 'content/pages/test.mdx' },
      { collection: 'page', path: 'content/pages/other.mdx' },
    ]);
  });

  it('ignores a path that no listed collection owns', () => {
    expect(
      collectReferences(
        { page: 'content/posts/other.mdx' },
        fields,
        collections
      )
    ).toEqual([]);
  });

  it('ignores an empty reference', () => {
    expect(collectReferences({ page: '' }, fields, collections)).toEqual([]);
  });
});

describe('resolveReferences', () => {
  it('replaces the path with the document it points at', () => {
    expect(
      resolveReferences(
        { title: 'Hello', page: 'content/pages/test.mdx' },
        fields,
        collections,
        resolve
      )
    ).toEqual({ title: 'Hello', page });
  });

  it('resolves inside array items', () => {
    expect(
      resolveReferences(
        { related: [{ page: 'content/pages/test.mdx' }] },
        fields,
        collections,
        resolve
      )
    ).toEqual({ related: [{ page }] });
  });

  it('resolves inside template items', () => {
    expect(
      resolveReferences(
        {
          blocks: [
            { _template: 'hero', title: 'Hi' },
            { _template: 'featured', page: 'content/pages/test.mdx' },
          ],
        },
        fields,
        collections,
        resolve
      )
    ).toEqual({
      blocks: [
        { _template: 'hero', title: 'Hi' },
        { _template: 'featured', page },
      ],
    });
  });

  it('resolves each reference in an `of` list', () => {
    expect(
      resolveReferences(
        { pages: ['content/pages/test.mdx'] },
        fields,
        collections,
        resolve
      )
    ).toEqual({ pages: [page] });
  });

  it('keeps the path when the document is not available', () => {
    expect(
      resolveReferences(
        { page: 'content/pages/test.mdx' },
        fields,
        collections,
        () => undefined
      )
    ).toEqual({ page: 'content/pages/test.mdx' });
  });

  it('leaves the values it was given alone', () => {
    const values = { page: 'content/pages/test.mdx' };
    resolveReferences(values, fields, collections, resolve);
    expect(values).toEqual({ page: 'content/pages/test.mdx' });
  });
});
