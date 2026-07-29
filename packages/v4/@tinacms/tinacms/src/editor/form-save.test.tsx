import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import { definePlugin } from '../core/plugin';
import type { CollectionSchema } from '../core/schema/types';
import { t } from '../index';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import {
  Field,
  FormProvider,
  type SaveHandler,
  TinaProvider,
  useFieldAddress,
  useFieldValue,
  useFormId,
  useFormSave,
  useFormStatus,
} from './index';

// These tests render a runtime directly, and not a configured app. They therefore pass
// TinaProvider the resolved shape, and do not call defineConfig.
const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [t.string({ name: 'title', label: 'Title' })],
};

function SaveProbe() {
  const save = useFormSave();
  const status = useFormStatus(useFormId());
  return (
    <div>
      <button type='button' onClick={() => save().catch(() => {})}>
        save
      </button>
      <span data-testid='status'>{status}</span>
    </div>
  );
}

const renderWithSave = (onSave: SaveHandler) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [stringFieldPlugin],
        schema: NO_COLLECTIONS,
      })}
    >
      <FormProvider
        collection={collection}
        path='content/posts/save.mdx'
        document={{ title: 'Hi' }}
        onSave={onSave}
      >
        <Field address='title' />
        <SaveProbe />
      </FormProvider>
    </TinaProvider>
  );

describe('useFormSave', () => {
  it('delivers the digested document to onSave and marks the form clean', async () => {
    const onSave = vi.fn();
    renderWithSave(onSave);
    const input = await screen.findByLabelText('title');
    await userEvent.type(input, '!');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).toHaveBeenCalledWith({ title: 'Hi!' });
    expect(await screen.findByTestId('status')).toHaveTextContent('clean');
  });

  it('leaves the form dirty when onSave rejects', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('save failed'));
    renderWithSave(onSave);
    const input = await screen.findByLabelText('title');
    await userEvent.type(input, '!');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
  });
});

// A field whose value is a structure, and not a primitive. It uses a plain input, so a
// test can simulate the edit. The rich-text field is the real case, but Plate needs a
// browser to accept a keystroke, and the fault has nothing to do with Plate.
//
// The regression: the store reads the formState subscription of RHF, which sends a clone
// of each value, but markSaved keeps the values that RHF holds as the baseline. Two
// primitives compare equal across that split under `Object.is`. Two structures never do,
// so the form stayed dirty through every save.
const structureFieldPlugin = definePlugin({
  name: 'test:field:structure',
  provides: ['field'],
  field: { type: 'structure', contractVersion: 1 },
  client: async () => ({
    default: {
      field: {
        Component: StructureField,
        // This matches the rich-text field. The stored value is a string, the editor
        // value is a structure, and each edit makes a new object.
        parse: (stored: unknown) => ({ text: String(stored ?? '') }),
        serialize: (value: unknown) => (value as { text: string }).text,
      },
    },
  }),
});

function StructureField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<{ text: string }>(address);
  return (
    <input
      aria-label={address}
      value={value?.text ?? ''}
      onChange={(event) => setValue({ text: event.target.value })}
    />
  );
}

const structureCollection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [{ name: 'body', type: 'structure' }],
};

describe('useFormSave with a structured field value', () => {
  it('reaches clean after a save, despite RHF cloning the value', async () => {
    const onSave = vi.fn();
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [structureFieldPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider
          collection={structureCollection}
          path='content/posts/structure.mdx'
          document={{ body: 'Original.' }}
          onSave={onSave}
        >
          <Field address='body' />
          <SaveProbe />
        </FormProvider>
      </TinaProvider>
    );

    const input = await screen.findByLabelText('body');
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');

    await userEvent.type(input, '!');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).toHaveBeenCalledWith({ body: 'Original.!' });
    expect(await screen.findByTestId('status')).toHaveTextContent('clean');
  });
});
