import { describe, expect, it } from 'vitest';
import {
  type FieldRegistry,
  resolveFieldPlugins,
} from '../../../core/field/registry';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import type { CollectionSchema } from '../../../core/schema/types';
import { t } from '../../../index';
import { codecFor, mdxCodec } from './mdx-codec';
import type { RichTextCodec } from './rich-text-codec';
import richTextFieldPlugin from './rich-text-field.plugin';

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([richTextFieldPlugin]);

// The whole point of the codec seam: the format is replaceable without the
// editor, the schema, or the save flow knowing. This one stores the body as
// upper-cased plain text — deliberately nothing like markdown, so a test passing
// with it proves no markdown assumption leaked out of the codec.
const shoutCodec: RichTextCodec = {
  name: 'shout',
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
    expect(mdxCodec.name).toBe('mdx');
  });

  it("uses the field's own codec when it declares one", () => {
    expect(codecFor(t.richText({ name: 'body', codec: shoutCodec }))).toBe(
      shoutCodec
    );
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
