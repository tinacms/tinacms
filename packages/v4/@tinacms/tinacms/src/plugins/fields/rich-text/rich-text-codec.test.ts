import { INVALID_MARKDOWN_TYPE } from '@tinacms/rich-text';
import { describe, expect, it } from 'vitest';
import {
  type FieldRegistry,
  resolveFieldPlugins,
} from '../../../core/field/registry';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import type { CollectionSchema } from '../../../core/schema/types';
import { t } from '../../../index';
import { codecFor, markdownCodec, mdxCodec } from './mdx-codec';
import type { RichTextCodec } from './rich-text-codec';
import richTextFieldPlugin from './rich-text-field.plugin';

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([richTextFieldPlugin]);

// The whole point of the codec seam: the format is replaceable without the
// editor, the schema, or the save flow knowing. This one stores the body as
// upper-cased plain text — deliberately nothing like markdown, so a test passing
// with it proves no markdown assumption leaked out of the codec.
const shoutCodec: RichTextCodec = {
  parse: (source) => ({
    type: 'root',
    children: [{ type: 'p', children: [{ type: 'text', text: source }] }],
  }),
  serialize: (value) => {
    const paragraph = value.children[0] as
      | { children?: { text?: string }[] }
      | undefined;
    return (paragraph?.children?.[0]?.text ?? '').toUpperCase();
  },
};

describe('codec selection', () => {
  it('defaults to markdown when a field declares none', () => {
    expect(codecFor(t.richText({ name: 'body' }))).toBe(mdxCodec);
  });

  it("uses the field's own codec when it declares one", () => {
    expect(codecFor(t.richText({ name: 'body', codec: shoutCodec }))).toBe(
      shoutCodec
    );
  });
});

// One collection can hold .md and .mdx documents, so the parser follows the file
// rather than the collection — the plate stack's half of multi-format collections.
describe('codec selection follows the document', () => {
  const body = t.richText({ name: 'body' });

  it('reads a .mdx document as MDX and a .md document as markdown', () => {
    expect(codecFor(body, { documentPath: 'content/posts/a.mdx' })).toBe(
      mdxCodec
    );
    expect(codecFor(body, { documentPath: 'content/posts/a.md' })).toBe(
      markdownCodec
    );
  });

  // .json/.yaml hold rich text as a markdown string (as v3 does) with no format
  // of their own to name, so they take the branch that round-trips an unparseable
  // body instead of blanking it.
  it('falls back to MDX for a format with no markdown file of its own', () => {
    expect(codecFor(body, { documentPath: 'content/posts/a.json' })).toBe(
      mdxCodec
    );
    expect(codecFor(body, {})).toBe(mdxCodec);
    expect(codecFor(body, { documentPath: 'no-extension' })).toBe(mdxCodec);
  });

  it("lets a field's declared codec win over the document's extension", () => {
    expect(
      codecFor(t.richText({ name: 'body', codec: shoutCodec }), {
        documentPath: 'content/posts/a.md',
      })
    ).toBe(shoutCodec);
  });
});

describe('the two parsers genuinely differ', () => {
  const body = t.richText({ name: 'body' });
  // Braces are an MDX expression and ordinary characters in markdown. A price in
  // .md prose is the everyday case: MDX rejects the whole body over it.
  const PROSE_WITH_BRACES = 'Costs {100} dollars\n';

  it('reads braces in .md prose as text where MDX fails the whole body', () => {
    expect(markdownCodec.parse(PROSE_WITH_BRACES, body)).toEqual({
      type: 'root',
      children: [
        {
          type: 'p',
          children: [{ type: 'text', text: 'Costs {100} dollars' }],
        },
      ],
    });
    expect(mdxCodec.parse(PROSE_WITH_BRACES, body).children[0]).toMatchObject({
      type: INVALID_MARKDOWN_TYPE,
    });
  });

  it('round-trips ordinary markdown unchanged', () => {
    const source = '# Heading\n\nSome *prose* here.\n';
    expect(
      markdownCodec.serialize(markdownCodec.parse(source, body), body)
    ).toBe(source);
  });

  // The reason the schema refuses a per-field `parser: 'markdown'`: serializeMDX's
  // markdown branch returns before its invalid_markdown check, so an unparsed body
  // would save as blank. The codec guards it instead — without this, opening a
  // body the parser choked on and hitting save destroys the file.
  it('writes an unparsed body back as its original source, never blank', () => {
    const source = 'Body the parser could not read\n';
    const unparsed = {
      type: 'root' as const,
      children: [
        {
          type: INVALID_MARKDOWN_TYPE,
          value: source,
          message: 'nope',
          children: [{ type: 'text', text: '' }],
        },
      ],
    };
    expect(markdownCodec.serialize(unparsed, body)).toBe(source);
  });
});

describe('a document carries its format through ingest and digest', () => {
  const fields = [t.richText({ name: 'body', isBody: true })];
  const PROSE_WITH_BRACES = 'Costs {100} dollars\n';

  it('round-trips a .md body that MDX would have failed on', async () => {
    const registry = await resolveRegistry();
    const context = { documentPath: 'content/posts/prices.md' };
    const values = ingestDocument(
      { body: PROSE_WITH_BRACES },
      fields,
      registry,
      context
    );
    expect(values.body).toMatchObject({
      children: [{ type: 'p' }],
    });
    expect(digestDocument(values, fields, registry, context)).toEqual({
      body: PROSE_WITH_BRACES,
    });
  });

  it('still parses the same body as MDX when the document is .mdx', async () => {
    const registry = await resolveRegistry();
    const values = ingestDocument(
      { body: PROSE_WITH_BRACES },
      fields,
      registry,
      {
        documentPath: 'content/posts/prices.mdx',
      }
    );
    expect(values.body).toMatchObject({
      children: [{ type: INVALID_MARKDOWN_TYPE }],
    });
  });
});

describe('a field carries its content through its codec', () => {
  const collection: CollectionSchema = {
    name: 'post',
    format: 'mdx',
    fields: [t.richText({ name: 'body', isBody: true, codec: shoutCodec })],
  };

  it('reads the stored body through the codec, not the markdown parser', async () => {
    const registry = await resolveRegistry();
    const values = ingestDocument(
      { body: 'hello there' },
      collection.fields,
      registry
    );
    // The markdown parser would have produced a text node of "hello there" too,
    // so assert the structure this codec makes rather than the text alone.
    expect(values.body).toEqual({
      type: 'root',
      children: [
        { type: 'p', children: [{ type: 'text', text: 'hello there' }] },
      ],
    });
  });

  it('writes what the codec serializes, not markdown', async () => {
    const registry = await resolveRegistry();
    const values = ingestDocument(
      { body: 'hello there' },
      collection.fields,
      registry
    );
    expect(digestDocument(values, collection.fields, registry)).toEqual({
      body: 'HELLO THERE',
    });
  });

  it('leaves a field on the default codec untouched by the swap', async () => {
    const registry = await resolveRegistry();
    const markdownCollection: CollectionSchema = {
      name: 'post',
      format: 'mdx',
      fields: [t.richText({ name: 'body', isBody: true })],
    };
    const values = ingestDocument(
      { body: '# Heading\n' },
      markdownCollection.fields,
      registry
    );
    expect(digestDocument(values, markdownCollection.fields, registry)).toEqual(
      {
        body: '# Heading\n',
      }
    );
  });
});
