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
import {
  toFormId,
  useFormErrors,
  useFormStore,
  useFormValues,
} from '../form/form-store';
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
// validation failure to keep alive across a document switch, and max 20 a
// second, distinguishable one (bleed detection needs two distinct messages).
const collection: CollectionSchema = {
  name: 'post',
  fields: [
    t.string({
      name: 'title',
      label: 'Title',
      required: true,
      min: 3,
      max: 20,
    }),
  ],
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

  it('a pristine kept scope never shadows changed document content', async () => {
    const { unmount } = render(host(pathA, { title: 'Old content' }));
    const input = await screen.findByLabelText('title');
    expect(input).toHaveValue('Old content');
    unmount();

    // Never edited: the kept scope is pristine, so the re-mount must re-adopt
    // the incoming document (registerForm's "pristine is never stale"), not
    // re-serve the old mirror.
    render(host(pathA, { title: 'New content' }));
    const revisited = await screen.findByLabelText('title');
    await waitFor(() => expect(revisited).toHaveValue('New content'));
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');
  });

  it('a document swap under kept edits keeps the edits', async () => {
    const { unmount } = render(host(pathA, { title: 'Doc A' }));
    await userEvent.type(await screen.findByLabelText('title'), ' edited');
    unmount();

    // Re-mounted onto kept edits, then the host swaps the document prop under
    // the same path: edits win (the store's edited no-op, mirrored by the seed).
    const { rerender } = render(host(pathA, { title: 'Doc A' }));
    const revisited = await screen.findByLabelText('title');
    await waitFor(() => expect(revisited).toHaveValue('Doc A edited'));
    rerender(host(pathA, { title: 'Reloaded from disk' }));
    expect(screen.getByLabelText('title')).toHaveValue('Doc A edited');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
  });

  it('re-adoption never clobbers kept errors, not even pre-derivation', async () => {
    const formIdA = toFormId(pathA);
    const { unmount } = render(host(pathA, { title: 'Doc A' }));
    const inputA = await screen.findByLabelText('title');
    await userEvent.clear(inputA);
    await userEvent.type(inputA, 'x');
    await waitFor(() =>
      expect(useFormStore.getState().forms[formIdA]?.errors?.[title]).toEqual([
        'Title must be at least 3 characters',
      ])
    );
    unmount();

    // Record every distinct error state A's scope passes through during the
    // re-mount: the fresh RHF instance's pre-trigger empty derivation must not
    // wipe the kept errors even transiently (a badge blip — or a permanent
    // loss if the form unmounts inside that window).
    const seen: unknown[] = [];
    const unsubscribe = useFormStore.subscribe((state, previous) => {
      const errors = state.forms[formIdA]?.errors;
      if (errors !== previous.forms[formIdA]?.errors) seen.push(errors);
    });
    render(host(pathA, { title: 'Doc A' }));
    await screen.findByText('Title must be at least 3 characters');
    unsubscribe();
    expect(
      seen.every((errors) => errors != null && Object.keys(errors).length > 0)
    ).toBe(true);
    expect(useFormStore.getState().forms[formIdA]?.errors?.[title]).toEqual([
      'Title must be at least 3 characters',
    ]);
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

// No key: the same FormProvider instance re-hosts the other path — the harder
// switch, where nothing remounts and every seam must hold by itself.
const unkeyedHost = (
  path: string,
  document: TinaDocument,
  onSave?: SaveHandler
) => (
  <TinaProvider plugins={[stringFieldPlugin]}>
    <FormProvider
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

describe('unkeyed document switches (same FormProvider instance)', () => {
  it('identical-content documents still reset — edits never save under the other path', async () => {
    const onSave = vi.fn();
    const { rerender } = render(unkeyedHost(pathA, { title: 'Same' }, onSave));
    const input = await screen.findByLabelText('title');
    await userEvent.type(input, ' edited');

    // Same content, different path: only the formId distinguishes the two.
    rerender(unkeyedHost(pathB, { title: 'Same' }, onSave));
    await waitFor(() =>
      expect(screen.getByLabelText('title')).toHaveValue('Same')
    );
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');

    await userEvent.click(screen.getByText('save'));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith({ title: 'Same' });
  });

  it('a switch never bleeds the outgoing form’s errors into the incoming scope', async () => {
    const formIdB = toFormId(pathB);
    // B waits unhosted with its own invalid kept edit and mirrored error.
    useFormStore.getState().registerForm(formIdB, { [title]: 'Doc B' });
    useFormStore.getState().setFieldValue(formIdB, title, 'xy');
    useFormStore.getState().setFieldErrors(formIdB, {
      [title]: ['Title must be at least 3 characters'],
    });

    // A carries a DIFFERENT error (max, not min), so a bleed is distinguishable.
    const { rerender } = render(unkeyedHost(pathA, { title: 'Doc A' }));
    const inputA = await screen.findByLabelText('title');
    await userEvent.type(inputA, ' with far too long a title');
    await waitFor(() =>
      expect(
        useFormStore.getState().forms[toFormId(pathA)]?.errors?.[title]
      ).toContain('Title must be at most 20 characters')
    );

    const seen: unknown[] = [];
    const unsubscribe = useFormStore.subscribe((state, previous) => {
      const errors = state.forms[formIdB]?.errors;
      if (errors !== previous.forms[formIdB]?.errors) seen.push(errors);
    });
    rerender(unkeyedHost(pathB, { title: 'Doc B' }));
    await waitFor(() =>
      expect(screen.getByLabelText('title')).toHaveValue('xy')
    );
    await screen.findByText('Title must be at least 3 characters');
    unsubscribe();

    // B's scope never held A's error and was never wiped in transit.
    expect(
      seen.every(
        (errors) =>
          errors != null &&
          Object.keys(errors).length > 0 &&
          !JSON.stringify(errors).includes('at most')
      )
    ).toBe(true);
    expect(useFormStore.getState().forms[formIdB]?.errors?.[title]).toEqual([
      'Title must be at least 3 characters',
    ]);
    // A's own error is still where it belongs.
    expect(
      useFormStore.getState().forms[toFormId(pathA)]?.errors?.[title]
    ).toContain('Title must be at most 20 characters');

    // And the mirror is alive under the new owner: a fresh edit in B mirrors
    // (the ownership guard skips one run, never the stream).
    const inputB = screen.getByLabelText('title');
    await userEvent.clear(inputB);
    await userEvent.type(inputB, 'now far too long for the max rule');
    await waitFor(() =>
      expect(useFormStore.getState().forms[formIdB]?.errors?.[title]).toContain(
        'Title must be at most 20 characters'
      )
    );
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

describe('useFormErrors', () => {
  it('reports {} for unregistered and pristine forms with a stable identity', () => {
    const formId = toFormId(pathA);
    const { result, rerender } = renderHook(() => useFormErrors(formId));
    expect(result.current).toEqual({});
    const unregistered = result.current;

    act(() => {
      useFormStore.getState().registerForm(formId, { [title]: 'Hello' });
    });
    rerender();
    expect(result.current).toBe(unregistered);
  });

  it('reports the mirrored map for an edited form and follows clears', () => {
    const formId = toFormId(pathA);
    const { result } = renderHook(() => useFormErrors(formId));
    act(() => {
      useFormStore.getState().registerForm(formId, { [title]: 'Hello' });
      useFormStore.getState().setFieldValue(formId, title, 'x');
      useFormStore
        .getState()
        .setFieldErrors(formId, { [title]: ['Too short'] });
    });
    expect(result.current).toEqual({ [title]: ['Too short'] });

    act(() => {
      useFormStore.getState().setFieldErrors(formId, {});
    });
    expect(result.current).toEqual({});
  });
});
