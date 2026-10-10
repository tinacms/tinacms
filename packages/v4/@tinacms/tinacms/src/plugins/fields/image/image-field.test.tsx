import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../../../config';
import type { FieldRegistry } from '../../../core/field/registry';
import { resolveFieldPlugins } from '../../../core/field/registry';
import { digestDocument, ingestDocument } from '../../../core/form/ingest';
import type {
  CollectionSchema,
  TinaDocument,
} from '../../../core/schema/types';
import { validateField } from '../../../core/validation';
import { FormProvider, TinaProvider } from '../../../editor';
import { required, t } from '../../../index';
import { coreValidatorRegistry } from '../../../test/core-validators';
import { LabelledFields } from '../../../test/labelled-fields';
import coreValidatorsPlugin from '../../validators/core-validators.plugin';
import imageFieldPlugin from './image-field.plugin';
import { IMAGE_FIELD_TYPE } from './image-field.schema';

const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [t.image({ name: 'cover', label: 'Cover' })],
};

const requiredCollection: CollectionSchema = {
  ...collection,
  fields: [
    t.image({ name: 'cover', label: 'Cover', validators: [required()] }),
  ],
};

const resolveRegistry = (): Promise<FieldRegistry> =>
  resolveFieldPlugins([imageFieldPlugin]);

const validateFieldWithCore: typeof validateField = (
  node,
  descriptor,
  value,
  options
) =>
  validateField(node, descriptor, value, {
    validators: coreValidatorRegistry,
    ...options,
  });

const errorsFor = async (
  config: Parameters<typeof t.image>[0],
  value: unknown
): Promise<string[]> => {
  const registry = await resolveRegistry();
  return validateFieldWithCore(t.image(config), registry.get('image'), value);
};

const renderCover = (
  document?: TinaDocument,
  open: CollectionSchema = collection
) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [imageFieldPlugin, coreValidatorsPlugin],
        schema: NO_COLLECTIONS,
      })}
    >
      <FormProvider
        collection={open}
        path='content/posts/test.mdx'
        document={document}
      >
        <LabelledFields />
      </FormProvider>
    </TinaProvider>
  );

describe('ImageField registration', () => {
  it('registers the image descriptor under its type key', async () => {
    const registry = await resolveRegistry();
    expect(IMAGE_FIELD_TYPE).toBe('image');
    expect(registry.has(IMAGE_FIELD_TYPE)).toBe(true);
  });
});

describe('ImageField rendering', () => {
  it('renders the ingested media path into a text input', async () => {
    renderCover({ cover: 'posts/hero.jpg' });
    const input = (await screen.findByLabelText('Cover')) as HTMLInputElement;
    expect(input.value).toBe('posts/hero.jpg');
  });

  it('falls back to the descriptor default value when absent', async () => {
    renderCover();
    const input = (await screen.findByLabelText('Cover')) as HTMLInputElement;
    expect(input.value).toBe('');
  });
});

describe('ImageField value updates', () => {
  it('writes keystrokes back through the form store', async () => {
    renderCover({ cover: '' });
    const input = (await screen.findByLabelText('Cover')) as HTMLInputElement;
    await userEvent.type(input, 'posts/hero.jpg');
    expect(input.value).toBe('posts/hero.jpg');
  });
});

describe('ImageField validation', () => {
  it('passes the shared validation path with a stored media path', async () => {
    const registry = await resolveRegistry();
    expect(
      validateFieldWithCore(
        collection.fields[0],
        registry.get(IMAGE_FIELD_TYPE),
        'posts/hero.jpg'
      )
    ).toEqual([]);
  });

  it('reports an empty required field', async () => {
    const registry = await resolveRegistry();
    expect(
      validateFieldWithCore(
        requiredCollection.fields[0],
        registry.get(IMAGE_FIELD_TYPE),
        ''
      )
    ).toEqual(['Cover is required']);
  });
});

describe('ImageField schema optional', () => {
  it('accepts an empty optional field', async () => {
    expect(await errorsFor({ name: 'cover', label: 'Cover' }, '')).toEqual([]);
  });

  it('accepts a missing optional field', async () => {
    expect(await errorsFor({ name: 'cover', label: 'Cover' }, null)).toEqual(
      []
    );
  });

  it('accepts a stored media path', async () => {
    expect(
      await errorsFor({ name: 'cover', label: 'Cover' }, 'posts/hero.jpg')
    ).toEqual([]);
  });
});

describe('ImageField schema required', () => {
  it('reports an empty required field', async () => {
    expect(
      await errorsFor(
        { name: 'cover', label: 'Cover', validators: [required()] },
        ''
      )
    ).toEqual(['Cover is required']);
  });

  it('reports a missing required field', async () => {
    expect(
      await errorsFor(
        { name: 'cover', label: 'Cover', validators: [required()] },
        undefined
      )
    ).toEqual(['Cover is required']);
  });
});

describe('ImageField ingest and digest', () => {
  it('ingests a stored path and digests it back unchanged', async () => {
    const registry = await resolveRegistry();
    const ingested = ingestDocument(
      { cover: 'posts/hero.jpg' } satisfies TinaDocument,
      collection.fields,
      { registry }
    );
    expect(ingested).toEqual({ cover: 'posts/hero.jpg' });
    expect(digestDocument(ingested, collection.fields, { registry })).toEqual({
      cover: 'posts/hero.jpg',
    });
  });

  it('seeds the default value on ingest when the field is absent', async () => {
    const registry = await resolveRegistry();
    expect(ingestDocument({}, collection.fields, { registry })).toEqual({
      cover: '',
    });
  });

  it('preserves null vs absent on digest', async () => {
    const registry = await resolveRegistry();
    expect(
      digestDocument({ cover: null }, collection.fields, { registry })
    ).toEqual({ cover: null });
    expect(digestDocument({}, collection.fields, { registry })).toEqual({});
  });
});

describe('ImageField accept', () => {
  it('defaults to no accept list when the config omits it', () => {
    expect(t.image({ name: 'cover' }).accept).toBeUndefined();
  });

  it('carries a single accept entry through', () => {
    expect(t.image({ name: 'cover', accept: 'image' }).accept).toBe('image');
  });

  it('carries an accept list through', () => {
    expect(t.image({ name: 'cover', accept: ['png', 'webp'] }).accept).toEqual([
      'png',
      'webp',
    ]);
  });
});

describe('ImageField metadata wrapping', () => {
  it('registers the image descriptor with its declared metadata', async () => {
    const registry = await resolveRegistry();
    const descriptor = registry.get(IMAGE_FIELD_TYPE);
    expect(descriptor?.metadata).toEqual({ layout: 'inline' });
    expect(descriptor?.defaultValue).toBe('');
  });
});
