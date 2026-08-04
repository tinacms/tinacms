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
  useDiscardEdits,
  useFormId,
  useFormSave,
  useFormSeedKey,
  useFormStatus,
} from './index';

const NO_COLLECTIONS = { collections: [] };

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

function DiscardProbe() {
  const discard = useDiscardEdits();
  return (
    <button type='button' onClick={discard}>
      discard
    </button>
  );
}

function SeedKeyProbe() {
  return <span data-testid='seed'>{useFormSeedKey()}</span>;
}

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
      <DiscardProbe />
      <SeedKeyProbe />
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
    let stored: TinaDocument = { title: 'Hello' };
    const onSave: SaveHandler = (document) => {
      stored = document;
    };
    const { unmount } = render(host(pathA, stored, onSave));
    const input = await screen.findByLabelText('title');
    await userEvent.type(input, '!');
    await userEvent.click(screen.getByText('save'));
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('clean')
    );
    unmount();

    render(host(pathA, stored, onSave));
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
    expect(onSave).toHaveBeenCalledWith({ title: 'Doc B two' });

    rerender(host(pathA, { title: 'Doc A' }, onSave));
    const backOnA = await screen.findByLabelText('title');
    await waitFor(() => expect(backOnA).toHaveValue('x'));
    await screen.findByText('Title must be at least 3 characters');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
  });

  it('a pristine kept scope never shadows changed document content', async () => {
    const { unmount } = render(host(pathA, { title: 'Old content' }));
    const input = await screen.findByLabelText('title');
    expect(input).toHaveValue('Old content');
    unmount();

    render(host(pathA, { title: 'New content' }));
    const revisited = await screen.findByLabelText('title');
    await waitFor(() => expect(revisited).toHaveValue('New content'));
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');
  });

  it('a clean kept scope never shadows changed document content', async () => {
    const { unmount } = render(host(pathA, { title: 'Old content' }, () => {}));
    const input = await screen.findByLabelText('title');
    await userEvent.type(input, '!');
    await userEvent.click(screen.getByText('save'));
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('clean')
    );
    unmount();

    render(host(pathA, { title: 'New content' }, () => {}));
    const revisited = await screen.findByLabelText('title');
    await waitFor(() => expect(revisited).toHaveValue('New content'));
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');
  });

  it('a document swap under kept edits keeps the edits', async () => {
    const { unmount } = render(host(pathA, { title: 'Doc A' }));
    await userEvent.type(await screen.findByLabelText('title'), ' edited');
    unmount();

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

    rerender(host(pathB, { title: 'Doc B' }));
    await waitFor(() =>
      expect(screen.getByLabelText('title')).toHaveValue('Doc B')
    );
    expect(errorsOf(useFormStore.getState().forms, formIdA)?.[title]).toEqual([
      'Title must be at least 3 characters',
    ]);
  });
});

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
    useFormStore.getState().registerForm(formIdB, { [title]: 'Doc B' });
    useFormStore.getState().setFieldValue(formIdB, title, 'xy');
    useFormStore.getState().setFieldErrors(formIdB, {
      [title]: ['Title must be at least 3 characters'],
    });

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
    expect(
      errorsOf(useFormStore.getState().forms, toFormId(pathA))?.[title]
    ).toContain('Title must be at most 20 characters');

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

describe('discarding edits', () => {
  it('puts RHF and the store back on the loaded content, under a new seed', async () => {
    render(host(pathA, { title: 'Hello' }));
    const input = await screen.findByLabelText('title');
    await userEvent.type(input, '!');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
    const seed = screen.getByTestId('seed').textContent;

    await userEvent.click(screen.getByText('discard'));

    await waitFor(() => expect(input).toHaveValue('Hello'));
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');
    expect(screen.getByTestId('seed').textContent).not.toBe(seed);
  });

  it('returns a saved form to what was saved, and not to what was loaded', async () => {
    render(host(pathA, { title: 'Hello' }, () => {}));
    const input = await screen.findByLabelText('title');
    await userEvent.type(input, ' one');
    await userEvent.click(screen.getByText('save'));
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('clean')
    );

    await userEvent.type(input, ' two');
    await userEvent.click(screen.getByText('discard'));
    await waitFor(() => expect(input).toHaveValue('Hello one'));
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');
  });

  it('takes the validation errors of the discarded edits with them', async () => {
    render(host(pathA, { title: 'Hello' }));
    const input = await screen.findByLabelText('title');
    await userEvent.clear(input);
    await userEvent.type(input, 'x');
    await screen.findByText('Title must be at least 3 characters');

    await userEvent.click(screen.getByText('discard'));
    await waitFor(() => expect(input).toHaveValue('Hello'));
    expect(
      screen.queryByText('Title must be at least 3 characters')
    ).toBeNull();
    expect(errorsOf(useFormStore.getState().forms, toFormId(pathA))).toBe(
      undefined
    );
  });

  it('does nothing to a form with no edits, and reseeds no editor', async () => {
    render(host(pathA, { title: 'Hello' }));
    const input = await screen.findByLabelText('title');
    const seed = screen.getByTestId('seed').textContent;

    await userEvent.click(screen.getByText('discard'));

    expect(input).toHaveValue('Hello');
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');
    expect(screen.getByTestId('seed').textContent).toBe(seed);
  });

  it('keeps the discarded form out of the way of another open form', async () => {
    const { rerender } = render(host(pathA, { title: 'Doc A' }));
    await userEvent.type(await screen.findByLabelText('title'), ' edited');

    rerender(host(pathB, { title: 'Doc B' }));
    await waitFor(() =>
      expect(screen.getByLabelText('title')).toHaveValue('Doc B')
    );
    await userEvent.type(screen.getByLabelText('title'), ' edited');
    await userEvent.click(screen.getByText('discard'));
    await waitFor(() =>
      expect(screen.getByLabelText('title')).toHaveValue('Doc B')
    );

    rerender(host(pathA, { title: 'Doc A' }));
    await waitFor(() =>
      expect(screen.getByLabelText('title')).toHaveValue('Doc A edited')
    );
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
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
