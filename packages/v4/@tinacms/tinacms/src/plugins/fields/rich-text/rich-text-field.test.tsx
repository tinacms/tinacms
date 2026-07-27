import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  type FieldRegistry,
  resolveFieldPlugins,
} from '../../../core/field/registry';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import type {
  CollectionSchema,
  TinaDocument,
} from '../../../core/schema/types';
import { validateField } from '../../../core/validation';
import { Field, FormProvider, TinaProvider } from '../../../editor';
import { t } from '../../../index';
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

const renderBody = (document?: TinaDocument) =>
  render(
    <TinaProvider plugins={[richTextFieldPlugin]}>
      <FormProvider
        collection={collection}
        path='content/posts/test.mdx'
        document={document}
      >
        <Field address='body' />
      </FormProvider>
    </TinaProvider>
  );

describe('RichTextField rendering', () => {
  it('renders the stored markdown source verbatim', async () => {
    renderBody({ body: '# Heading\n\nSome *prose*.\n' });
    const textarea = (await screen.findByLabelText(
      'body'
    )) as HTMLTextAreaElement;
    expect(textarea.value).toBe('# Heading\n\nSome *prose*.\n');
  });

  it('falls back to the descriptor default (empty) when absent', async () => {
    renderBody();
    const textarea = (await screen.findByLabelText(
      'body'
    )) as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
  });
});

describe('RichTextField value updates', () => {
  it('writes edits back through the form store', async () => {
    renderBody({ body: 'Start.' });
    const textarea = (await screen.findByLabelText(
      'body'
    )) as HTMLTextAreaElement;

    await userEvent.type(textarea, ' More.');
    expect(textarea.value).toBe('Start. More.');
  });
});

describe('RichTextField validation', () => {
  it('rejects an empty required body', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('rich-text');
    expect(validateField(bodyNode, descriptor, '')).not.toEqual([]);
    expect(validateField(bodyNode, descriptor, undefined)).not.toEqual([]);
  });

  it('accepts any non-empty markdown', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('rich-text');
    expect(validateField(bodyNode, descriptor, '# Hi')).toEqual([]);
  });

  it('accepts an absent value when the field is optional', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('rich-text');
    const optional = t.richText({ name: 'body' });
    expect(validateField(optional, descriptor, undefined)).toEqual([]);
    expect(validateField(optional, descriptor, '')).toEqual([]);
  });
});

describe('RichTextField ingest and digest', () => {
  // The stored value and the editor value are the same markdown string, so the
  // round-trip has to be byte-exact — the format adapter writes whatever comes
  // back out straight into the file.
  it('round-trips markdown untouched, leading newline and all', async () => {
    const registry = await resolveRegistry();
    const body = '\nBody prose.\n';
    const ingested = ingestDocument({ body }, collection.fields, registry);
    expect(ingested).toEqual({ body });
    expect(digestDocument(ingested, collection.fields, registry)).toEqual({
      body,
    });
  });
});

describe('RichTextField metadata wrapping', () => {
  it('registers the rich-text descriptor as a block field', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('rich-text');
    expect(descriptor?.metadata).toEqual({ layout: 'block' });
    expect(descriptor?.defaultValue).toBe('');
  });
});
