import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../../../config';
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
import datetimeFieldPlugin from './datetime-field.plugin';

// These tests render a runtime directly, and not a configured app. They therefore pass
// TinaProvider the resolved shape, and do not call defineConfig.
const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [t.datetime({ name: 'published', label: 'Published' })],
};

const publishedNode = collection.fields[0];

const requiredNode = t.datetime({
  name: 'published',
  label: 'Published',
  required: true,
});

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([datetimeFieldPlugin]);

const renderPublished = (document?: TinaDocument) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [datetimeFieldPlugin],
        schema: NO_COLLECTIONS,
      })}
    >
      <FormProvider
        collection={collection}
        path='content/posts/published.mdx'
        document={document}
      >
        <Field address='published' />
      </FormProvider>
    </TinaProvider>
  );

describe('DatetimeField rendering', () => {
  it('renders a stored datetime clipped to what the native input accepts', async () => {
    renderPublished({ published: '2024-05-01T09:30:00.000Z' });
    const input = (await screen.findByLabelText(
      'published'
    )) as HTMLInputElement;
    expect(input.value).toBe('2024-05-01T09:30');
  });

  it('renders a stored date with no time as midnight', async () => {
    renderPublished({ published: '2024-05-01' });
    const input = (await screen.findByLabelText(
      'published'
    )) as HTMLInputElement;
    expect(input.value).toBe('2024-05-01T00:00');
  });

  it('renders empty when the value is absent', async () => {
    renderPublished();
    const input = (await screen.findByLabelText(
      'published'
    )) as HTMLInputElement;
    expect(input.value).toBe('');
  });
});

describe('DatetimeField value updates', () => {
  it('writes the picked datetime back through the form store', async () => {
    renderPublished({ published: '2024-05-01T09:30' });
    const input = (await screen.findByLabelText(
      'published'
    )) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '2025-12-24T18:00' } });
    expect(input.value).toBe('2025-12-24T18:00');
  });
});

describe('DatetimeField validation', () => {
  it('accepts an ISO datetime and a plain date', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('datetime');
    expect(
      validateField(publishedNode, descriptor, '2024-05-01T09:30')
    ).toEqual([]);
    expect(validateField(publishedNode, descriptor, '2024-05-01')).toEqual([]);
  });

  it('accepts a Date instance, the shape a YAML frontmatter date arrives in', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('datetime');
    expect(
      validateField(publishedNode, descriptor, new Date('2024-05-01T09:30:00Z'))
    ).toEqual([]);
  });

  it('rejects a string that is not a date', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('datetime');
    expect(
      validateField(publishedNode, descriptor, 'not-a-date')
    ).not.toEqual([]);
  });

  it('accepts an absent value as optional', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('datetime');
    expect(validateField(publishedNode, descriptor, undefined)).toEqual([]);
    expect(validateField(publishedNode, descriptor, null)).toEqual([]);
    expect(validateField(publishedNode, descriptor, '')).toEqual([]);
  });

  it('rejects an absent value when the field is required', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('datetime');
    expect(validateField(requiredNode, descriptor, undefined)).not.toEqual([]);
    expect(validateField(requiredNode, descriptor, '')).not.toEqual([]);
  });
});

describe('DatetimeField ingest and digest', () => {
  it('round-trips a stored string unchanged', async () => {
    const registry = await resolveRegistry();
    for (const published of ['2024-05-01T09:30:00.000Z', '2024-05-01']) {
      const ingested = ingestDocument(
        { published },
        collection.fields,
        registry
      );
      expect(ingested).toEqual({ published });
      expect(digestDocument(ingested, collection.fields, registry)).toEqual({
        published,
      });
    }
  });

  it('ingests a YAML Date instance as its ISO string', async () => {
    const registry = await resolveRegistry();
    const ingested = ingestDocument(
      { published: new Date('2024-05-01T09:30:00.000Z') },
      collection.fields,
      registry
    );
    expect(ingested).toEqual({ published: '2024-05-01T09:30:00.000Z' });
  });

  it('writes nothing for an absent value', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, registry)).toEqual({});
  });
});
