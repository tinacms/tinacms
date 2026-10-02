import { describe, expect, it } from 'vitest';
import {
  adapterForPath,
  collectionFormats,
  formatAdapterFor,
  formatAdaptersFor,
} from './format-adapters';

const MDX_RAW = `---
title: Hello World
date: 2024-01-01
featured: false
category: not-in-schema
---

Body prose the schema does not know about.
`;

const overTheWire = (document: object) => JSON.parse(JSON.stringify(document));

describe('markdown adapter', () => {
  const adapter = formatAdapterFor('mdx');

  it('parses frontmatter as the document', () => {
    expect(adapter.parse(MDX_RAW)).toEqual({
      title: 'Hello World',
      date: new Date('2024-01-01T00:00:00.000Z'),
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
      date: new Date('2024-01-01T00:00:00.000Z'),
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
      date: new Date('2024-01-01T00:00:00.000Z'),
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

  it('rewrites the file byte-identically when the client echoes the document back over the wire', () => {
    const document = overTheWire(adapter.parse(MDX_RAW, 'body'));
    expect(adapter.serialize(document, MDX_RAW, 'body')).toBe(MDX_RAW);
  });

  it('keeps an untouched timestamp a timestamp when another field changes', () => {
    const document = overTheWire(adapter.parse(MDX_RAW, 'body'));
    const saved = adapter.serialize(
      { ...document, title: 'Renamed' },
      MDX_RAW,
      'body'
    );
    expect(saved).toContain('date: 2024-01-01T00:00:00.000Z');
    expect(saved).not.toContain("date: '");
    expect(adapter.parse(saved).date).toEqual(
      new Date('2024-01-01T00:00:00.000Z')
    );
  });

  it('writes an edited date as the save sends it', () => {
    const saved = adapter.serialize(
      { title: 'Hello World', date: '2025-06-15' },
      MDX_RAW
    );
    expect(adapter.parse(saved).date).toBe('2025-06-15');
  });

  it('leaves the body alone when the save omits the body field', () => {
    const saved = adapter.serialize({ title: 'Renamed' }, MDX_RAW, 'body');
    expect(saved).toContain('Body prose the schema does not know about.');
  });

  it('ignores a stale frontmatter key sharing the body field name', () => {
    const withStaleKey = `---\ntitle: Hello\nbody: stale frontmatter value\n---\n\nThe real body.\n`;
    const saved = adapter.serialize({ title: 'Renamed' }, withStaleKey, 'body');
    expect(adapter.parse(saved, 'body').body).toBe('The real body.\n');
  });

  it('drops a stale body key even when the save never mentions the body', () => {
    const withStaleKey = `---\ntitle: Hello\nbody: stale frontmatter value\n---\n\nThe real body.\n`;
    const saved = adapter.serialize({ title: 'Renamed' }, withStaleKey, 'body');
    expect(saved).not.toContain('stale frontmatter value');
    expect(saved).toBe('---\ntitle: Renamed\n---\n\nThe real body.\n');
  });

  it('rejects a non-string body rather than coercing it', () => {
    for (const body of [{ type: 'root', children: [] }, 42, null]) {
      expect(() =>
        adapter.serialize({ title: 'Renamed', body }, MDX_RAW, 'body')
      ).toThrow(/Expected a string for body field/);
    }
  });

  it('refuses to run code in frontmatter', () => {
    const globals = globalThis as Record<string, unknown>;
    for (const language of ['js', 'javascript', 'coffee', 'coffeescript']) {
      const raw = `---${language}\n{ pwned: (globalThis.PWNED = true) }\n---\n`;
      expect(() => adapter.parse(raw)).toThrow(/not allowed for security/);
      expect(() => adapter.serialize({ body: raw }, undefined, 'body')).toThrow(
        /not allowed for security/
      );
      expect(globals.PWNED).toBeUndefined();
    }
  });
});

describe('markdown adapter — documents with and without frontmatter', () => {
  const adapter = formatAdapterFor('md');

  const NO_FRONTMATTER_RAW = 'Body prose with no frontmatter block.\n';
  const FRONTMATTER_RAW =
    '---\ntitle: Hello\n---\n\nBody prose with frontmatter.\n';

  it('rewrites a frontmatter-less document byte-identically when nothing changed', () => {
    const document = adapter.parse(NO_FRONTMATTER_RAW, 'body');
    expect(adapter.serialize(document, NO_FRONTMATTER_RAW, 'body')).toBe(
      NO_FRONTMATTER_RAW
    );
  });

  it('rewrites a document with frontmatter byte-identically when nothing changed', () => {
    const document = adapter.parse(FRONTMATTER_RAW, 'body');
    expect(adapter.serialize(document, FRONTMATTER_RAW, 'body')).toBe(
      FRONTMATTER_RAW
    );
  });

  it('writes an edited body in a frontmatter-less document with no leading blank line', () => {
    const document = adapter.parse(NO_FRONTMATTER_RAW, 'body');
    const saved = adapter.serialize(
      { ...document, body: 'Rewritten prose.\n' },
      NO_FRONTMATTER_RAW,
      'body'
    );
    expect(saved).toBe('Rewritten prose.\n');
  });

  it('writes an edited body in a document with frontmatter, keeping the blank line', () => {
    const document = adapter.parse(FRONTMATTER_RAW, 'body');
    const saved = adapter.serialize(
      { ...document, body: 'Rewritten prose.\n' },
      FRONTMATTER_RAW,
      'body'
    );
    expect(saved).toBe('---\ntitle: Hello\n---\n\nRewritten prose.\n');
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

  it('picks the adapter whatever the case of the extension', () => {
    const adapters = formatAdaptersFor(['mdx', 'json']);
    expect(adapterForPath(adapters, 'content/posts/Hello.MDX')?.extension).toBe(
      '.mdx'
    );
    expect(adapterForPath(adapters, 'content/posts/A.Json')?.extension).toBe(
      '.json'
    );
    expect(
      adapterForPath(formatAdaptersFor(['md', 'mdx']), 'a.MD')?.extension
    ).toBe('.md');
  });

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
