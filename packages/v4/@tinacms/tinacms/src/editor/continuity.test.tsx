import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import { toFieldAddress } from '../core/field/address';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import {
  type FormId,
  type FormStore,
  isEdited,
  toFormId,
  useFormErrors,
  useFormStore,
  useFormValues,
} from '../form/form-store';
import { t } from '../index';

// A pristine form has never been validated, so the store gives it no error map at all,
// and not an empty one. Refer to form-store.ts. This narrowing keeps that shape, so no
// assertion reaches through the union.
const errorsOf = (forms: FormStore['forms'], formId: FormId) => {
  const scope = forms[formId];
  return isEdited(scope) ? scope.errors : undefined;
};
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

// These tests render a runtime directly, and not a configured app. They therefore pass
// TinaProvider the resolved shape, and do not call defineConfig.
const NO_COLLECTIONS = { collections: [] };

// The same shape as the post collection of the playground. The min of 3 gives these
// tests one validation failure to keep across a change of document. The max of 20 gives
// a second failure. A test for a leak between forms needs two different messages.
const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
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

// The switcher of the playground. Its FormProvider has a key, so a change of path tears
// the form down and hosts the other document. The store keeps the edits.
const host = (path: string, document: TinaDocument, onSave?: SaveHandler) => (
  <TinaProvider
    config={asResolvedConfig({
      plugins: [stringFieldPlugin],
      schema: NO_COLLECTIONS,
    })}
  >
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
    // The document of B only. The save does not change the scope of A.
    expect(onSave).toHaveBeenCalledWith({ title: 'Doc B two' });

    rerender(host(pathA, { title: 'Doc A' }, onSave));
    const backOnA = await screen.findByLabelText('title');
    await waitFor(() => expect(backOnA).toHaveValue('x'));
    // RHF derives no error from defaultValues, so this message is here only because
    // the provider validated the kept edits again.
    await screen.findByText('Title must be at least 3 characters');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
  });

  it('a pristine kept scope never shadows changed document content', async () => {
    const { unmount } = render(host(pathA, { title: 'Old content' }));
    const input = await screen.findByLabelText('title');
    expect(input).toHaveValue('Old content');
    unmount();

    // No one edited this form, so the kept scope is pristine. The remount must adopt
    // the incoming document, because a pristine form is never stale. It must not
    // serve the old mirror.
    render(host(pathA, { title: 'New content' }));
    const revisited = await screen.findByLabelText('title');
    await waitFor(() => expect(revisited).toHaveValue('New content'));
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');
  });

  it('a document swap under kept edits keeps the edits', async () => {
    const { unmount } = render(host(pathA, { title: 'Doc A' }));
    await userEvent.type(await screen.findByLabelText('title'), ' edited');
    unmount();

    // This remounts onto the kept edits, and the host then changes the document prop
    // under the same path. The edits win, because the store does nothing for an
    // edited form, and the seed follows.
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
      expect(errorsOf(useFormStore.getState().forms, formIdA)?.[title]).toEqual(
        ['Title must be at least 3 characters']
      )
    );
    unmount();

    // Record every error state that the scope of A passes through during the
    // remount. The new RHF instance derives an empty map before its first trigger,
    // and that must not clear the kept errors, not even for one render. Such a gap
    // makes the badge flicker, and it loses the errors when the form unmounts inside
    // it.
    const seen: unknown[] = [];
    const unsubscribe = useFormStore.subscribe((state, previous) => {
      const errors = errorsOf(state.forms, formIdA);
      if (errors !== errorsOf(previous.forms, formIdA)) seen.push(errors);
    });
    render(host(pathA, { title: 'Doc A' }));
    await screen.findByText('Title must be at least 3 characters');
    unsubscribe();
    expect(
      seen.every((errors) => errors != null && Object.keys(errors).length > 0)
    ).toBe(true);
    expect(errorsOf(useFormStore.getState().forms, formIdA)?.[title]).toEqual([
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
      expect(errorsOf(useFormStore.getState().forms, formIdA)?.[title]).toEqual(
        ['Title must be at least 3 characters']
      )
    );

    // A correct value clears the mirror through the same path.
    await userEvent.type(inputA, 'yz');
    await waitFor(() =>
      expect(
        errorsOf(useFormStore.getState().forms, formIdA)?.[title]
      ).toBeUndefined()
    );
    await userEvent.clear(inputA);
    await userEvent.type(inputA, 'x');
    await waitFor(() =>
      expect(errorsOf(useFormStore.getState().forms, formIdA)?.[title]).toEqual(
        ['Title must be at least 3 characters']
      )
    );

    // A is torn down, and its mirrored errors are still readable while B is hosted.
    // This is the case that the collection badge needs.
    rerender(host(pathB, { title: 'Doc B' }));
    await waitFor(() =>
      expect(screen.getByLabelText('title')).toHaveValue('Doc B')
    );
    expect(errorsOf(useFormStore.getState().forms, formIdA)?.[title]).toEqual([
      'Title must be at least 3 characters',
    ]);
  });
});

// There is no key here, so one FormProvider instance hosts the other path. This is the
// harder change. Nothing remounts, and each part must hold by itself.
const unkeyedHost = (
  path: string,
  document: TinaDocument,
  onSave?: SaveHandler
) => (
  <TinaProvider
    config={asResolvedConfig({
      plugins: [stringFieldPlugin],
      schema: NO_COLLECTIONS,
    })}
  >
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

    // The same content, and a different path. Only the form id separates the two.
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

    // A carries a different error, max and not min, so a leak between the two shows.
    const { rerender } = render(unkeyedHost(pathA, { title: 'Doc A' }));
    const inputA = await screen.findByLabelText('title');
    await userEvent.type(inputA, ' with far too long a title');
    await waitFor(() =>
      expect(
        errorsOf(useFormStore.getState().forms, toFormId(pathA))?.[title]
      ).toContain('Title must be at most 20 characters')
    );

    const seen: unknown[] = [];
    const unsubscribe = useFormStore.subscribe((state, previous) => {
      const errors = errorsOf(state.forms, formIdB);
      if (errors !== errorsOf(previous.forms, formIdB)) seen.push(errors);
    });
    rerender(unkeyedHost(pathB, { title: 'Doc B' }));
    await waitFor(() =>
      expect(screen.getByLabelText('title')).toHaveValue('xy')
    );
    await screen.findByText('Title must be at least 3 characters');
    unsubscribe();

    // The scope of B never held the error of A, and nothing cleared it.
    expect(
      seen.every(
        (errors) =>
          errors != null &&
          Object.keys(errors).length > 0 &&
          !JSON.stringify(errors).includes('at most')
      )
    ).toBe(true);
    expect(errorsOf(useFormStore.getState().forms, formIdB)?.[title]).toEqual([
      'Title must be at least 3 characters',
    ]);
    // The error of A is still on A.
    expect(
      errorsOf(useFormStore.getState().forms, toFormId(pathA))?.[title]
    ).toContain('Title must be at most 20 characters');

    // The mirror works under the new owner. A new edit in B reaches the mirror. The
    // ownership guard skips one run, and never the stream.
    const inputB = screen.getByLabelText('title');
    await userEvent.clear(inputB);
    await userEvent.type(inputB, 'now far too long for the max rule');
    await waitFor(() =>
      expect(
        errorsOf(useFormStore.getState().forms, formIdB)?.[title]
      ).toContain('Title must be at most 20 characters')
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
