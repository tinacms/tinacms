import { describe, expect, it } from 'vitest';
import {
  type FieldRegistry,
  resolveFieldPlugins,
} from '../../../core/field/registry';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import type { CollectionSchema } from '../../../core/schema/types';
import { validateField } from '../../../core/validation';
import { t } from '../../../index';
import { formatAdapterFor } from '../../content/local/format-adapters';
import { INVALID_MARKDOWN_TYPE } from './error-message';
import type { RichTextValue } from './rich-text-codec';
import richTextFieldPlugin from './rich-text-field.plugin';

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [
    t.richText({ name: 'body', label: 'Body', isBody: true, required: true }),
  ],
};

const bodyNode = collection.fields[0];

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([richTextFieldPlugin]);

const ast = (markdown: string, registry: FieldRegistry): RichTextValue =>
  ingestDocument({ body: markdown }, collection.fields, registry)
    .body as RichTextValue;

describe('RichTextField ingest and digest', () => {
  it('parses stored markdown into the mdx AST', async () => {
    const registry = await resolveRegistry();
    expect(ast('# Heading\n\nSome prose.\n', registry)).toEqual({
      type: 'root',
      children: [
        { type: 'h1', children: [{ type: 'text', text: 'Heading' }] },
        { type: 'p', children: [{ type: 'text', text: 'Some prose.' }] },
      ],
    });
  });

  it('serializes the AST back to markdown', async () => {
    const registry = await resolveRegistry();
    const values = { body: ast('# Heading\n\nSome prose.\n', registry) };
    expect(digestDocument(values, collection.fields, registry)).toEqual({
      body: '# Heading\n\nSome prose.\n',
    });
  });

  it('seeds an empty root when the field is absent', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, registry)).toEqual({
      body: { type: 'root', children: [] },
    });
  });
});

// The AST has no concept of leading whitespace, so serializing drops the blank
// line separating frontmatter from prose. The markdown adapter writes it back —
// without that, opening and saving any v3 document would restyle it.
describe('RichTextField round-trip through the format adapter', () => {
  const adapter = formatAdapterFor('mdx');
  const RAW = '---\ntitle: Hello World\n---\n\nBody prose.\n';

  it('rewrites an untouched document byte-identically', async () => {
    const registry = await resolveRegistry();
    const stored = adapter.parse(RAW, 'body');
    const values = ingestDocument(stored, collection.fields, registry);
    const digested = digestDocument(values, collection.fields, registry);
    expect(adapter.serialize({ ...stored, ...digested }, RAW, 'body')).toBe(
      RAW
    );
  });

  it('keeps the separator when the body is edited', async () => {
    const registry = await resolveRegistry();
    const values = { body: ast('Rewritten prose.\n', registry) };
    const digested = digestDocument(values, collection.fields, registry);
    expect(
      adapter.serialize({ title: 'Hello World', ...digested }, RAW, 'body')
    ).toBe('---\ntitle: Hello World\n---\n\nRewritten prose.\n');
  });
});

// `parse`/`serialize` take the field node for exactly one reason: the parser
// reads `templates` off it. Without them an embed degrades to a raw html node,
// so this is the test that fails if the node argument is ever dropped again.
describe('RichTextField templates through the node argument', () => {
  const withTemplates: CollectionSchema = {
    name: 'post',
    format: 'mdx',
    fields: [
      t.richText({
        name: 'body',
        isBody: true,
        templates: [
          {
            name: 'Callout',
            label: 'Callout',
            key: 'callout',
            fields: [{ name: 'text', type: 'string' }],
          },
        ],
      }),
    ],
  };
  const SOURCE = 'Before.\n\n<Callout text="hi" />\n\nAfter.\n';

  it('parses a configured embed into an element carrying its props', async () => {
    const registry = await resolveRegistry();
    const parsed = ingestDocument(
      { body: SOURCE },
      withTemplates.fields,
      registry
    ).body as RichTextValue;
    expect(parsed.children[1]).toMatchObject({
      type: 'mdxJsxFlowElement',
      name: 'Callout',
      props: { text: 'hi' },
    });
  });

  it('round-trips the embed back to its original source', async () => {
    const registry = await resolveRegistry();
    const values = ingestDocument(
      { body: SOURCE },
      withTemplates.fields,
      registry
    );
    expect(digestDocument(values, withTemplates.fields, registry)).toEqual({
      body: SOURCE,
    });
  });

  it('degrades the embed to raw html when templates are absent', async () => {
    const registry = await resolveRegistry();
    const parsed = ingestDocument({ body: SOURCE }, collection.fields, registry)
      .body as RichTextValue;
    expect(parsed.children[1]).toMatchObject({ type: 'html' });
  });
});

// Saving is what makes an unparseable body dangerous — validation reports it but
// does not block the write, so the serializer has to hand the source back intact.
describe('RichTextField unparseable markdown', () => {
  const BROKEN = '<Unclosed\n';

  it('keeps the original source through a full save round-trip', async () => {
    const registry = await resolveRegistry();
    const values = ingestDocument(
      { body: BROKEN },
      collection.fields,
      registry
    );
    expect((values.body as RichTextValue).children[0]).toMatchObject({
      type: INVALID_MARKDOWN_TYPE,
    });
    expect(digestDocument(values, collection.fields, registry)).toEqual({
      body: BROKEN,
    });
  });
});

describe('RichTextField validation', () => {
  it('rejects an empty required body', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('rich-text');
    expect(
      validateField(bodyNode, descriptor, { type: 'root', children: [] })
    ).not.toEqual([]);
  });

  it('accepts a body with content', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('rich-text');
    expect(validateField(bodyNode, descriptor, ast('# Hi', registry))).toEqual(
      []
    );
  });

  it('rejects markdown the parser could not read', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('rich-text');
    const unparsed: RichTextValue = {
      type: 'root',
      children: [{ type: INVALID_MARKDOWN_TYPE }],
    };
    expect(validateField(bodyNode, descriptor, unparsed)).not.toEqual([]);
  });

  it('rejects a value that is not rich text at all', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('rich-text');
    expect(validateField(bodyNode, descriptor, 'plain string')).not.toEqual([]);
  });

  it('accepts an absent value when the field is optional', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('rich-text');
    const optional = t.richText({ name: 'body' });
    expect(validateField(optional, descriptor, undefined)).toEqual([]);
  });

  it('reports an absent required body as required, not as malformed', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('rich-text');
    expect(validateField(bodyNode, descriptor, undefined)).toEqual([
      'Body is required',
    ]);
  });
});

describe('RichTextField metadata wrapping', () => {
  it('registers the rich-text descriptor as a block field', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('rich-text');
    expect(descriptor?.metadata).toEqual({ layout: 'block' });
    expect(descriptor?.defaultValue).toEqual({ type: 'root', children: [] });
  });
});
