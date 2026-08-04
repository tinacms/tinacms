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
import {
  FormProvider,
  TinaProvider,
  toFieldAddress,
  useFieldValue,
} from '../../../editor';
import { t } from '../../../index';
import { LabelledFields } from '../../../test/labelled-fields';
import datetimeFieldPlugin from './datetime-field.plugin';

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
        <LabelledFields />
        <StoredValue />
      </FormProvider>
    </TinaProvider>
  );

function StoredValue() {
  const [value] = useFieldValue<string | undefined>(
    toFieldAddress('published')
  );
  return <output data-testid='stored'>{value ?? ''}</output>;
}

const storedValue = (): string =>
  screen.getByTestId('stored').textContent ?? '';

/**
 * Derives the local wall clock by offset arithmetic on the UTC value. The field
 * derives it from the local calendar getters, so the two disagree if either is
 * wrong.
 */
const localWallClock = (instant: string): string => {
  const utc = new Date(instant);
  const shifted = new Date(utc.getTime() - utc.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
};

const CARRIES_A_ZONE = /(?:Z|[+-]\d{2}:\d{2})$/;

describe('DatetimeField rendering', () => {
  it('renders a stored instant as the local wall clock of the editor', async () => {
    renderPublished({ published: '2024-05-01T09:30:00.000Z' });
    const input = (await screen.findByLabelText(
      'Published'
    )) as HTMLInputElement;
    expect(input.value).toBe(localWallClock('2024-05-01T09:30:00.000Z'));
  });

  it('renders a stored value with no zone as the wall clock it spells', async () => {
    renderPublished({ published: '2024-05-01T09:30' });
    const input = (await screen.findByLabelText(
      'Published'
    )) as HTMLInputElement;
    expect(input.value).toBe('2024-05-01T09:30');
  });

  it('renders a stored date with no time as midnight', async () => {
    renderPublished({ published: '2024-05-01' });
    const input = (await screen.findByLabelText(
      'Published'
    )) as HTMLInputElement;
    expect(input.value).toBe('2024-05-01T00:00');
  });

  it('renders empty when the value is absent', async () => {
    renderPublished();
    const input = (await screen.findByLabelText(
      'Published'
    )) as HTMLInputElement;
    expect(input.value).toBe('');
  });
});

describe('DatetimeField value updates', () => {
  it('writes the picked datetime back through the form store', async () => {
    renderPublished({ published: '2024-05-01T09:30' });
    const input = (await screen.findByLabelText(
      'Published'
    )) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '2025-12-24T18:00' } });
    expect(input.value).toBe('2025-12-24T18:00');
  });

  it('keeps the instant when an editor opens the field and touches it', async () => {
    const stored = '2024-05-01T09:30:00.000Z';
    renderPublished({ published: stored });
    const input = (await screen.findByLabelText(
      'Published'
    )) as HTMLInputElement;
    const displayed = input.value;

    fireEvent.change(input, { target: { value: '2024-06-15T12:00' } });
    fireEvent.change(input, { target: { value: displayed } });

    const written = storedValue();
    // A value with no zone reads as a different instant in a different zone.
    // The instant survives only if the value still carries one.
    expect(written).toMatch(CARRIES_A_ZONE);
    expect(Date.parse(written)).toBe(Date.parse(stored));
  });

  it('keeps the value zone-qualified when an editor touches it', async () => {
    renderPublished({ published: '2024-05-01T09:30:00.000Z' });
    const input = (await screen.findByLabelText(
      'Published'
    )) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '2024-06-15T12:00' } });

    expect(storedValue()).toMatch(CARRIES_A_ZONE);
  });

  it('leaves a stored value with no zone without one', async () => {
    renderPublished({ published: '2024-05-01T09:30' });
    const input = (await screen.findByLabelText(
      'Published'
    )) as HTMLInputElement;

    fireEvent.change(input, { target: { value: '2025-12-24T18:00' } });

    expect(storedValue()).toBe('2025-12-24T18:00');
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
    expect(validateField(publishedNode, descriptor, 'not-a-date')).not.toEqual(
      []
    );
  });

  it('rejects a date shape the input cannot show, even when Date.parse takes it', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('datetime');
    for (const value of ['May 1, 2024', '2024/05/01', '2024-05-01 09:30']) {
      expect(Number.isNaN(Date.parse(value))).toBe(false);
      expect(validateField(publishedNode, descriptor, value)).not.toEqual([]);
    }
  });

  it('accepts an offset-qualified datetime', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('datetime');
    expect(
      validateField(publishedNode, descriptor, '2024-05-01T09:30:00+10:00')
    ).toEqual([]);
  });

  it('rejects a month that the calendar does not have', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get('datetime');
    expect(validateField(publishedNode, descriptor, '2024-13-01')).not.toEqual(
      []
    );
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
