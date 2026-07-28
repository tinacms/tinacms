import { describe, expect, it } from 'vitest';
import {
  adapterForPath,
  collectionFormats,
  formatAdapterFor,
  formatAdaptersFor,
} from './format-adapters';

const MDX_RAW = `---
title: Hello World
featured: false
category: not-in-schema
---

Body prose the schema does not know about.
`;

describe('markdown adapter', () => {
  const adapter = formatAdapterFor('mdx');

  it('parses frontmatter as the document', () => {
    expect(adapter.parse(MDX_RAW)).toEqual({
      title: 'Hello World',
      featured: false,
      category: 'not-in-schema',
    });
  });

  it('preserves unknown frontmatter keys and the body across a save', () => {
    const saved = adapter.serialize(
      { title: 'Renamed', featured: true },
      MDX_RAW
    );
    expect(adapter.parse(saved)).toEqual({
      title: 'Renamed',
      featured: true,
      category: 'not-in-schema',
    });
    expect(saved).toContain('Body prose the schema does not know about.');
  });

  it('serializes a fresh document without a previous file', () => {
    const saved = adapter.serialize({ title: 'New' });
    expect(adapter.parse(saved)).toEqual({ title: 'New' });
  });

  it('parses the body under the collection body field', () => {
    expect(adapter.parse(MDX_RAW, 'body')).toEqual({
      title: 'Hello World',
      featured: false,
      category: 'not-in-schema',
      body: 'Body prose the schema does not know about.\n',
    });
  });

  it('writes an edited body back as markdown, not frontmatter', () => {
    const saved = adapter.serialize(
      { title: 'Hello World', body: 'Rewritten prose.\n' },
      MDX_RAW,
      'body'
    );
    expect(saved).not.toContain('body:');
    expect(adapter.parse(saved, 'body')).toMatchObject({
      title: 'Hello World',
      body: 'Rewritten prose.\n',
    });
  });

  it('rewrites the file byte-identically when nothing changed', () => {
    const document = adapter.parse(MDX_RAW, 'body');
    expect(adapter.serialize(document, MDX_RAW, 'body')).toBe(MDX_RAW);
  });

  it('leaves the body alone when the save omits the body field', () => {
    const saved = adapter.serialize({ title: 'Renamed' }, MDX_RAW, 'body');
    expect(saved).toContain('Body prose the schema does not know about.');
  });

  // Coercing instead of rejecting would write "[object Object]" as the whole
  // file — the body arrives straight off the wire, so its shape isn't a given.
  it('rejects a non-string body rather than coercing it', () => {
    for (const body of [{ type: 'root', children: [] }, 42, null]) {
      expect(() =>
        adapter.serialize({ title: 'Renamed', body }, MDX_RAW, 'body')
      ).toThrow(/Expected a string for body field/);
    }
  });
});

describe('json adapter', () => {
  const adapter = formatAdapterFor('json');

  it('round-trips and preserves unknown keys', () => {
    const previous = JSON.stringify({ title: 'Old', extra: 'kept' });
    const saved = adapter.serialize({ title: 'New' }, previous);
    expect(adapter.parse(saved)).toEqual({ title: 'New', extra: 'kept' });
    expect(saved.endsWith('\n')).toBe(true);
  });
});

it('throws on an unsupported format', () => {
  expect(() => formatAdapterFor('yaml')).toThrow(/No format adapter/);
});

describe('multi-format collections', () => {
  it('reads a single format and a list of one as the same collection', () => {
    expect(collectionFormats('mdx')).toEqual(['mdx']);
    expect(collectionFormats(['mdx'])).toEqual(['mdx']);
    expect(collectionFormats(['mdx', 'json'])).toEqual(['mdx', 'json']);
  });

  it('resolves one adapter per declared format, in schema order', () => {
    expect(
      formatAdaptersFor(['mdx', 'json']).map((adapter) => adapter.extension)
    ).toEqual(['.mdx', '.json']);
  });

  it('picks the adapter by the file extension, not the collection', () => {
    const adapters = formatAdaptersFor(['mdx', 'json']);
    expect(adapterForPath(adapters, 'content/posts/a.mdx')?.extension).toBe(
      '.mdx'
    );
    expect(adapterForPath(adapters, 'content/posts/b.json')?.extension).toBe(
      '.json'
    );
    expect(adapterForPath(adapters, 'content/posts/c.txt')).toBeUndefined();
  });

  // '.mdx'.endsWith('.md') is false, so the two never shadow each other.
  it('keeps md and mdx distinct', () => {
    const adapters = formatAdaptersFor(['md', 'mdx']);
    expect(adapterForPath(adapters, 'a.md')?.extension).toBe('.md');
    expect(adapterForPath(adapters, 'a.mdx')?.extension).toBe('.mdx');
  });

  it('rejects formats that collide on one extension', () => {
    expect(() => formatAdaptersFor(['mdx', 'mdx'])).toThrow(
      /duplicate extensions/
    );
  });

  it('rejects a collection with no format at all', () => {
    expect(() => formatAdaptersFor([])).toThrow(/at least one `format`/);
  });
});
