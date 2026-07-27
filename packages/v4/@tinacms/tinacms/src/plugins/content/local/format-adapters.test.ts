import { describe, expect, it } from 'vitest';
import { formatAdapterFor } from './format-adapters';

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
      body: '\nBody prose the schema does not know about.\n',
    });
  });

  it('writes an edited body back as markdown, not frontmatter', () => {
    const saved = adapter.serialize(
      { title: 'Hello World', body: '\nRewritten prose.\n' },
      MDX_RAW,
      'body'
    );
    expect(saved).not.toContain('body:');
    expect(adapter.parse(saved, 'body')).toMatchObject({
      title: 'Hello World',
      body: '\nRewritten prose.\n',
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
