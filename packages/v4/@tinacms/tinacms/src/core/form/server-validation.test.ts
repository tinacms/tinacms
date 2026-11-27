import { describe, expect, it } from 'vitest';
import { resolveFieldPlugins } from '../field/registry';
import { definePlugin, resolveClientSegments } from '../plugin';
import { validateDocument } from '../../editor/resolver';
import { corePlugins, t } from '../../plugins/fields';
import type { CollectionSchema, TinaDocument } from '../schema/types';
import { createValidatorRegistry } from '../validator/registry';
import { digestDocument, ingestDocument } from './ingest';
import { storedHelpersOf, validateStoredDocument } from './server-validation';

const required = { name: 'required' };

const registry = await resolveFieldPlugins(corePlugins);
const validators = createValidatorRegistry(
  await resolveClientSegments(corePlugins)
);
const stored = storedHelpersOf(corePlugins);

// Every field type the Backend reads through `field.stored`, each with built-ins.
const fixture: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [
    t.string({
      name: 'title',
      validators: [required, { name: 'min', args: [3] }],
    }),
    t.number({ name: 'rank', validators: [{ name: 'min', args: [3] }] }),
    t.boolean({ name: 'featured', validators: [required] }),
    t.richText({ name: 'body', validators: [required] }),
    t.object({
      name: 'seo',
      validators: [required],
      fields: [t.string({ name: 'description', validators: [required] })],
    }),
    t.array({
      name: 'authors',
      fields: [t.string({ name: 'alias', validators: [required] })],
    }),
    t.array({
      name: 'blocks',
      templates: [
        {
          name: 'hero',
          fields: [t.string({ name: 'headline', validators: [required] })],
        },
      ],
    }),
  ],
};

const context = { documentPath: 'a.mdx', registry };

// The same stored document, read once through the form and once through the Backend.
const bothSides = (storedDocument: TinaDocument, collection = fixture) => {
  const editorValues = ingestDocument(
    storedDocument,
    collection.fields,
    context
  );
  const sent = digestDocument(editorValues, collection.fields, context);
  return {
    form: validateDocument(collection, registry, validators, editorValues),
    backend: validateStoredDocument(collection, sent, { validators, stored }),
  };
};

describe('the Backend validation matches the form', () => {
  it.each([
    ['an empty document', {}],
    [
      'a valid document',
      {
        title: 'Hello',
        rank: 5,
        featured: false,
        body: 'Text',
        seo: { description: 'd' },
        authors: [{ alias: 'a' }],
        blocks: [{ _template: 'hero', headline: 'h' }],
      },
    ],
    [
      'a required object with every subfield unset',
      { title: 'Hello', seo: {}, body: 'x' },
    ],
    [
      'items that miss a required field',
      {
        title: 'Hello',
        seo: { description: 'd' },
        body: 'x',
        authors: [{ alias: 'a' }, {}],
        blocks: [{ _template: 'hero' }],
      },
    ],
    ['values below a minimum', { title: 'ab', rank: 2, body: '  ' }],
  ])('gives the same addresses and messages for %s', (_name, document) => {
    const { form, backend } = bothSides(document);
    expect(backend).toEqual(form);
  });

  it('shows the two known differences', () => {
    const rich: CollectionSchema = {
      ...fixture,
      fields: [
        t.richText({
          name: 'body',
          validators: [{ name: 'pattern', args: ['^#'] }],
        }),
        t.number({ name: 'rank', validators: [{ name: 'min', args: [3] }] }),
      ],
    };
    // The form ignores `pattern` on a rich-text value. The Backend runs it on the Markdown source.
    const pattern = bothSides({ body: 'plain' }, rich);
    expect(pattern.form).toEqual({});
    expect(pattern.backend).toEqual({ body: ['body is invalid'] });

    // A whitespace-only number is empty in the form, and `serialize` stores it as 0.
    const editorValues = { body: null, rank: '  ' };
    const sent = digestDocument(editorValues, rich.fields, context);
    expect(validateDocument(rich, registry, validators, editorValues)).toEqual(
      {}
    );
    expect(validateStoredDocument(rich, sent, { validators, stored })).toEqual({
      rank: ['rank must be at least 3'],
    });
  });
});

describe('stored helpers after a field override', () => {
  const overridingBoolean = definePlugin({
    name: 'test:field:boolean-override',
    provides: ['field'],
    overrides: [{ capability: 'field', key: 'boolean' }],
    field: { type: 'boolean', contractVersion: 1 },
    client: async () => ({ default: {} }),
  });

  it('reads an overridden boolean with the default, not the built-in helpers', () => {
    expect(storedHelpersOf(corePlugins).get('boolean')).toBeDefined();
    const overridden = storedHelpersOf([...corePlugins, overridingBoolean]);
    expect(overridden.get('boolean')).toBeUndefined();
    const errors = validateStoredDocument(
      {
        name: 'p',
        format: 'mdx',
        fields: [t.boolean({ name: 'featured', validators: [required] })],
      },
      { featured: false },
      { validators, stored: overridden }
    );
    expect(errors).toEqual({});
  });
});
