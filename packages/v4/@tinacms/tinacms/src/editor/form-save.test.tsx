import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { JsonValue } from '../core/json';
import { type PluginManifest, definePlugin } from '../core/plugin';
import type {
  CollectionSchema,
  HookRef,
  TinaDocument,
} from '../core/schema/types';
import { t } from '../index';
import { required } from '../plugins/fields';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { LabelledFields } from '../test/labelled-fields';
import {
  AfterSaveHookError,
  FormProvider,
  FormValidationError,
  type SaveHandler,
  TinaProvider,
  useFieldAddress,
  useFieldValue,
  useFormId,
  useFormSave,
  useFormSeedKey,
  useFormStatus,
} from './index';

const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [t.string({ name: 'title', label: 'Title' })],
};

const requiredTitle: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title', validators: [required()] }),
  ],
};

const observed = vi.fn();

const stampPlugin = definePlugin({
  name: 'test:hooks:stamp',
  provides: ['hooks'],
  hooks: ['stamp', 'veto', 'observe', 'brokenAfterSave'],
  client: async () => ({
    default: {
      hooks: {
        stamp: (label: JsonValue) => ({
          beforeSave: (document: TinaDocument) => ({
            ...document,
            trail: `${String(document.trail ?? '')}${String(label)}`,
          }),
        }),
        veto: () => ({
          beforeSave: () => {
            throw new Error('not today');
          },
        }),
        observe: () => ({ afterSave: observed }),
        brokenAfterSave: () => ({
          afterSave: () => {
            throw new Error('audit endpoint down');
          },
        }),
      },
    },
  }),
});

const withHooks = (hooks: HookRef[]): CollectionSchema => ({
  ...collection,
  hooks,
});

function SaveProbe({ onFailure }: { onFailure?: (cause: unknown) => void }) {
  const save = useFormSave();
  const status = useFormStatus(useFormId());
  return (
    <div>
      <span data-testid='seed'>{useFormSeedKey()}</span>
      <button
        type='button'
        onClick={() => save().catch(onFailure ?? (() => {}))}
      >
        save
      </button>
      <span data-testid='status'>{status}</span>
    </div>
  );
}

const renderWithSave = (
  onSave: SaveHandler,
  schema: CollectionSchema = collection,
  document: Record<string, unknown> = { title: 'Hi' },
  onFailure?: (cause: unknown) => void,
  extraPlugins: PluginManifest[] = []
) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [stringFieldPlugin, coreValidatorsPlugin, ...extraPlugins],
        schema: NO_COLLECTIONS,
      })}
    >
      <FormProvider
        collection={schema}
        path='content/posts/save.mdx'
        document={document}
        onSave={onSave}
      >
        <LabelledFields />
        <SaveProbe onFailure={onFailure} />
      </FormProvider>
    </TinaProvider>
  );

describe('useFormSave', () => {
  it('delivers the digested document to onSave and marks the form clean', async () => {
    const onSave = vi.fn();
    renderWithSave(onSave);
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, '!');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).toHaveBeenCalledWith({ title: 'Hi!' });
    expect(await screen.findByTestId('status')).toHaveTextContent('clean');
  });

  it('refuses to save while a field has a validation error', async () => {
    const onSave = vi.fn();
    renderWithSave(onSave, requiredTitle);
    const input = await screen.findByLabelText('Title');
    await userEvent.clear(input);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Title is required'
    );

    await userEvent.click(screen.getByText('save'));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
  });

  it('validates untouched fields on save and rejects with a FormValidationError', async () => {
    const onSave = vi.fn();
    const failures: unknown[] = [];
    renderWithSave(onSave, requiredTitle, { title: '' }, (cause) =>
      failures.push(cause)
    );
    const save = await screen.findByText('save');
    expect(screen.queryByRole('alert')).toBeNull();

    await userEvent.click(save);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Title is required'
    );
    expect(onSave).not.toHaveBeenCalled();
    expect(failures[0]).toBeInstanceOf(FormValidationError);
  });

  it('leaves the form dirty when onSave rejects', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('save failed'));
    renderWithSave(onSave);
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, '!');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
  });

  it('runs beforeSave hooks in the order the collection lists them', async () => {
    const onSave = vi.fn();
    renderWithSave(
      onSave,
      withHooks([
        { name: 'stamp', args: ['b'] },
        { name: 'stamp', args: ['a'] },
      ]),
      { title: 'Hi' },
      undefined,
      [stampPlugin]
    );
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, '!');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).toHaveBeenCalledWith({ title: 'Hi!', trail: 'ba' });
    expect(await screen.findByTestId('status')).toHaveTextContent('clean');
  });

  it('runs no hooks on a collection that lists none', async () => {
    const onSave = vi.fn();
    renderWithSave(onSave, collection, { title: 'Hi' }, undefined, [
      stampPlugin,
    ]);
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, '!');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).toHaveBeenCalledWith({ title: 'Hi!' });
  });

  it('leaves the form dirty and skips onSave when a beforeSave hook throws', async () => {
    const onSave = vi.fn();
    const failures: unknown[] = [];
    renderWithSave(
      onSave,
      withHooks([{ name: 'veto' }]),
      { title: 'Hi' },
      (cause) => failures.push(cause),
      [stampPlugin]
    );
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, '!');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
    expect((failures[0] as Error).message).toBe('not today');
  });

  it('runs afterSave with the saved document once the form is clean', async () => {
    const onSave = vi.fn();
    observed.mockClear();
    renderWithSave(
      onSave,
      withHooks([{ name: 'observe' }]),
      { title: 'Hi' },
      undefined,
      [stampPlugin]
    );
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, '!');

    await userEvent.click(screen.getByText('save'));
    expect(await screen.findByTestId('status')).toHaveTextContent('clean');
    expect(observed).toHaveBeenCalledWith(
      { title: 'Hi!' },
      expect.objectContaining({ path: 'content/posts/save.mdx' })
    );
    expect(onSave.mock.invocationCallOrder[0]).toBeLessThan(
      observed.mock.invocationCallOrder[0]
    );
  });

  it('rejects with an AfterSaveHookError once the save has landed', async () => {
    const onSave = vi.fn();
    const failures: unknown[] = [];
    renderWithSave(
      onSave,
      withHooks([{ name: 'brokenAfterSave' }]),
      { title: 'Hi' },
      (cause) => failures.push(cause),
      [stampPlugin]
    );
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, '!');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).toHaveBeenCalledWith({ title: 'Hi!' });
    expect(await screen.findByTestId('status')).toHaveTextContent('clean');
    expect(failures[0]).toBeInstanceOf(AfterSaveHookError);
    expect((failures[0] as Error).cause).toBeInstanceOf(Error);
  });

  it('does not run afterSave when onSave rejects', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('save failed'));
    observed.mockClear();
    renderWithSave(
      onSave,
      withHooks([{ name: 'observe' }]),
      { title: 'Hi' },
      undefined,
      [stampPlugin]
    );
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, '!');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).toHaveBeenCalled();
    expect(observed).not.toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
  });

  it('shows the document the save stored, and reads clean', async () => {
    const onSave = vi.fn(async (document: TinaDocument) => ({
      document: { ...document, title: String(document.title).toUpperCase() },
    }));
    renderWithSave(onSave);
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, '!');

    await userEvent.click(screen.getByText('save'));
    expect(await screen.findByDisplayValue('HI!')).toBe(input);
    expect(screen.getByTestId('status')).toHaveTextContent('clean');
  });

  it('clears a field the stored document drops, and reads clean', async () => {
    renderWithSave(async () => ({ document: {} }));
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, '!');

    await userEvent.click(screen.getByText('save'));
    await vi.waitFor(() => expect(input).toHaveValue(''));
    expect(screen.getByTestId('status')).toHaveTextContent('clean');
  });

  it('keeps edits typed while a save runs, and stays dirty', async () => {
    let finish: () => void = () => {};
    const onSave = vi.fn(
      (document: TinaDocument) =>
        new Promise<{ document: TinaDocument }>((resolve) => {
          finish = () =>
            resolve({ document: { ...document, title: 'Stored' } });
        })
    );
    renderWithSave(onSave);
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, '!');

    await userEvent.click(screen.getByText('save'));
    await vi.waitFor(() => expect(onSave).toHaveBeenCalled());
    await userEvent.type(input, '?');
    finish();

    await vi.waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('dirty')
    );
    expect(input).toHaveValue('Hi!?');
  });

  it('advances the seed key only when the stored document differs, so uncontrolled widgets redraw', async () => {
    const onSave = vi.fn(async (document: TinaDocument) => ({ document }));
    renderWithSave(onSave);
    const input = await screen.findByLabelText('Title');
    const seed = () => screen.getByTestId('seed').textContent;
    const opened = seed();

    await userEvent.type(input, '!');
    await userEvent.click(screen.getByText('save'));
    expect(await screen.findByTestId('status')).toHaveTextContent('clean');
    expect(seed()).toBe(opened);

    onSave.mockImplementation(async (document) => ({
      document: { ...document, title: 'Changed by a hook' },
    }));
    await userEvent.type(input, '?');
    await userEvent.click(screen.getByText('save'));
    await screen.findByDisplayValue('Changed by a hook');
    expect(seed()).not.toBe(opened);
  });

  it('rejects with an AfterSaveHookError when the save reports a failed server afterSave', async () => {
    const failures: unknown[] = [];
    renderWithSave(
      async (document) => ({
        document,
        hookWarnings: ['The afterSave hook "audit" failed.'],
      }),
      collection,
      { title: 'Hi' },
      (cause) => failures.push(cause)
    );
    await userEvent.type(await screen.findByLabelText('Title'), '!');

    await userEvent.click(screen.getByText('save'));
    expect(await screen.findByTestId('status')).toHaveTextContent('clean');
    await vi.waitFor(() =>
      expect(failures[0]).toBeInstanceOf(AfterSaveHookError)
    );
  });

  it('does not run beforeSave when validation fails', async () => {
    const onSave = vi.fn();
    const schema: CollectionSchema = {
      ...requiredTitle,
      hooks: [{ name: 'stamp', args: ['a'] }],
    };
    renderWithSave(onSave, schema, { title: '' }, undefined, [stampPlugin]);
    await screen.findByText('save');

    await userEvent.click(screen.getByText('save'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Title is required'
    );
    expect(onSave).not.toHaveBeenCalled();
  });
});

const structureFieldPlugin = definePlugin({
  name: 'test:field:structure',
  provides: ['field'],
  field: { type: 'structure', contractVersion: 1 },
  client: async () => ({
    default: {
      field: {
        Component: StructureField,
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
      id={address}
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
          plugins: [structureFieldPlugin, coreValidatorsPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider
          collection={structureCollection}
          path='content/posts/structure.mdx'
          document={{ body: 'Original.' }}
          onSave={onSave}
        >
          <LabelledFields />
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
