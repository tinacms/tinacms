import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toFieldAddress } from '../core/field/address';
import type { ReferenceStep } from '../editor/preview-activate';
import { toFormId, useFormStore } from '../form/form-store';
import type { AdminRoute } from './routing';
import { useKeptEditsNotice } from './use-kept-edits-notice';

const shown = vi.hoisted(() => vi.fn());
vi.mock('@tinacms/ui/components/toast', () => ({
  toast: Object.assign(shown, { dismiss: vi.fn() }),
}));
vi.mock('../editor/branch', () => ({ useBranchView: () => undefined }));

const POST = 'content/posts/a.mdx';
const AUTHOR = 'content/authors/jane.md';
const OTHER = 'content/posts/b.mdx';
const doc = (collection: string, path: string): AdminRoute => ({
  view: 'document',
  collection,
  path,
});
const post = doc('post', POST);
const author = doc('author', AUTHOR);
const other = doc('post', OTHER);
const step: ReferenceStep = {
  from: { collection: 'post', path: POST },
  prefix: 'author',
};

const dirty = (path: string) => {
  const id = toFormId(path);
  act(() => {
    useFormStore
      .getState()
      .registerForm(id, { [toFieldAddress('title')]: 'x' });
    useFormStore
      .getState()
      .setFieldValue(id, toFieldAddress('title'), 'edited');
  });
};

const ids = () => shown.mock.calls.map(([call]) => call.id as string);
const titles = () => shown.mock.calls.map(([call]) => call.title as string);

describe('kept-edits notice through a reference step', () => {
  beforeEach(() => {
    shown.mockClear();
    act(() => useFormStore.setState({ forms: {} }));
  });

  const setup = () =>
    renderHook(
      ({ route, step }: { route: AdminRoute; step: ReferenceStep | null }) =>
        useKeptEditsNotice(route, vi.fn(), step),
      { initialProps: { route: post, step: null as ReferenceStep | null } }
    );

  it('says nothing when the post is left for a reference step, or when the step goes back to it', () => {
    dirty(POST);
    const { rerender } = setup();
    rerender({ route: author, step });
    expect(titles()).toEqual([]);
    rerender({ route: post, step: null });
    expect(titles()).toEqual([]);
  });

  it('says nothing for the post when a second reference replaces the step', () => {
    dirty(POST);
    const { rerender } = setup();
    rerender({ route: author, step });
    rerender({ route: doc('author', 'content/authors/other.md'), step });
    expect(titles()).toEqual([]);
  });

  it('names the post, and a dirty author, when the step is left for another document', () => {
    dirty(POST);
    dirty(AUTHOR);
    const { rerender } = setup();
    rerender({ route: author, step });
    rerender({ route: other, step: null });
    expect(ids().sort()).toEqual([
      `kept-edits:${AUTHOR}`,
      `kept-edits:${POST}`,
    ]);
  });

  it('says nothing for the post when the step is left for the post itself', () => {
    dirty(POST);
    const { rerender } = setup();
    rerender({ route: author, step });
    rerender({ route: post, step: null });
    expect(titles()).toEqual([]);
  });
});
