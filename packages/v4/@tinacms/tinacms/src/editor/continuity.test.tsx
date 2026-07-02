import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { toFieldAddress } from '../core/field/address';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { toFormId, useFormStore, useFormValues } from '../form/form-store';
import { t } from '../index';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import {
  Field,
  FormProvider,
  type SaveHandler,
  TinaProvider,
  useFormId,
  useFormSave,
  useFormStatus,
} from './index';

// Same shape as the playground's post collection: min 3 gives the tests a real
// validation failure to keep alive across a document switch.
const collection: CollectionSchema = {
  name: 'post',
  fields: [t.string({ name: 'title', label: 'Title', required: true, min: 3 })],
};

const pathA = 'content/posts/a.mdx';
const pathB = 'content/posts/b.mdx';
const title = toFieldAddress('title');

function StatusProbe() {
  return <span data-testid='status'>{useFormStatus(useFormId())}</span>;
}

function SaveProbe() {
  const save = useFormSave();
  return (
    <button type='button' onClick={() => void save()}>
      save
    </button>
  );
}

// The playground's switcher shape: keyed FormProvider, so a path change is a
// full teardown + host of the other document (the store keeps the edits).
const host = (path: string, document: TinaDocument, onSave?: SaveHandler) => (
  <TinaProvider plugins={[stringFieldPlugin]}>
    <FormProvider
      key={path}
      collection={collection}
      path={path}
      document={document}
      onSave={onSave}
    >
      <Field address='title' />
      <StatusProbe />
      <SaveProbe />
    </FormProvider>
  </TinaProvider>
);

describe('form continuity across mounts', () => {
  it('re-adopts kept edits into a fresh RHF instance, still dirty', async () => {
    const { unmount } = render(host(pathA, { title: 'Hello' }));
    const input = await screen.findByLabelText('title');
    await userEvent.type(input, '!');
    unmount();

    render(host(pathA, { title: 'Hello' }));
    const revisited = await screen.findByLabelText('title');
    expect(revisited).toHaveValue('Hello!');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
  });

  it('a saved form re-mounts clean on its saved values', async () => {
    const { unmount } = render(host(pathA, { title: 'Hello' }, () => {}));
    const input = await screen.findByLabelText('title');
    await userEvent.type(input, '!');
    await userEvent.click(screen.getByText('save'));
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('clean')
    );
    unmount();

    render(host(pathA, { title: 'Hello' }, () => {}));
    const revisited = await screen.findByLabelText('title');
    expect(revisited).toHaveValue('Hello!');
    expect(screen.getByTestId('status')).toHaveTextContent('clean');
  });

  it('switching A → B → A keeps A’s edits while B stays pristine', async () => {
    const { rerender } = render(host(pathA, { title: 'Doc A' }));
    const inputA = await screen.findByLabelText('title');
    await userEvent.type(inputA, ' edited');

    rerender(host(pathB, { title: 'Doc B' }));
    const inputB = await screen.findByLabelText('title');
    await waitFor(() => expect(inputB).toHaveValue('Doc B'));
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');

    rerender(host(pathA, { title: 'Doc A' }));
    const backOnA = await screen.findByLabelText('title');
    await waitFor(() => expect(backOnA).toHaveValue('Doc A edited'));
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
  });

  it('saving B is never blocked by A’s invalid kept edits — and A re-derives its error', async () => {
    const onSave = vi.fn();
    const { rerender } = render(host(pathA, { title: 'Doc A' }, onSave));
    const inputA = await screen.findByLabelText('title');
    await userEvent.clear(inputA);
    await userEvent.type(inputA, 'x');
    await screen.findByText('Title must be at least 3 characters');

    rerender(host(pathB, { title: 'Doc B' }, onSave));
    const inputB = await screen.findByLabelText('title');
    await waitFor(() => expect(inputB).toHaveValue('Doc B'));
    await userEvent.type(inputB, ' two');
    await userEvent.click(screen.getByText('save'));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    // B's document only — A's scope is untouched by the save.
    expect(onSave).toHaveBeenCalledWith({ title: 'Doc B two' });

    rerender(host(pathA, { title: 'Doc A' }, onSave));
    const backOnA = await screen.findByLabelText('title');
    await waitFor(() => expect(backOnA).toHaveValue('x'));
    // trigger-on-re-adopt: RHF derives no errors from defaultValues, so this
    // message is only here because the provider re-validated the kept edits.
    await screen.findByText('Title must be at least 3 characters');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
  });

  it('mirrored errors survive the unmount and report from anywhere', async () => {
    const formIdA = toFormId(pathA);
    const { rerender } = render(host(pathA, { title: 'Doc A' }));
    const inputA = await screen.findByLabelText('title');
    await userEvent.clear(inputA);
    await userEvent.type(inputA, 'x');
    await waitFor(() =>
      expect(useFormStore.getState().forms[formIdA]?.errors?.[title]).toEqual([
        'Title must be at least 3 characters',
      ])
    );

    // Fixing the value clears the mirror through the same chokepoint.
    await userEvent.type(inputA, 'yz');
    await waitFor(() =>
      expect(
        useFormStore.getState().forms[formIdA]?.errors?.[title]
      ).toBeUndefined()
    );
    await userEvent.clear(inputA);
    await userEvent.type(inputA, 'x');
    await waitFor(() =>
      expect(useFormStore.getState().forms[formIdA]?.errors?.[title]).toEqual([
        'Title must be at least 3 characters',
      ])
    );

    // A is torn down; its mirrored errors are still readable while B is hosted
    // — the collection-level badge case.
    rerender(host(pathB, { title: 'Doc B' }));
    await waitFor(() =>
      expect(screen.getByLabelText('title')).toHaveValue('Doc B')
    );
    expect(useFormStore.getState().forms[formIdA]?.errors?.[title]).toEqual([
      'Title must be at least 3 characters',
    ]);
  });
});

describe('useFormValues', () => {
  it('reports undefined for an unopened form, then live values', () => {
    const formId = toFormId(pathA);
    const { result } = renderHook(() => useFormValues(formId));
    expect(result.current).toBeUndefined();

    act(() => {
      useFormStore.getState().registerForm(formId, { [title]: 'Hello' });
    });
    expect(result.current).toEqual({ title: 'Hello' });

    act(() => {
      useFormStore.getState().setFieldValue(formId, title, 'Edited');
    });
    expect(result.current).toEqual({ title: 'Edited' });
  });
});
