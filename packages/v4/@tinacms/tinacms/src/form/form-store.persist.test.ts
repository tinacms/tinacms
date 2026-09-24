import { describe, expect, it, vi } from 'vitest';
import { toFieldAddress } from '../core/field/address';
import { simulateReload } from '../test/simulate-reload';
import {
  DRAFT_STORAGE_KEY,
  formStatus,
  isEdited,
  toFormId,
  useFormStore,
} from './form-store';

const title = toFieldAddress('title');
const seo = toFieldAddress('seo');
const body = toFieldAddress('body');
const postA = toFormId('posts/a.mdx');
const postB = toFormId('posts/b.mdx');
const store = useFormStore;

const keyOf = (formId: string) => `${DRAFT_STORAGE_KEY}:${formId}`;

const storedDrafts = (): Record<string, unknown> => {
  const drafts: Record<string, unknown> = {};
  for (const key of Object.keys(localStorage)) {
    const raw = localStorage.getItem(key);
    if (!key.startsWith(keyOf('')) || !raw) continue;
    const entry: { draft: unknown } = JSON.parse(raw);
    drafts[key.slice(keyOf('').length)] = entry.draft;
  }
  return drafts;
};

const otherTabWrites = (formId: string, text: string) =>
  localStorage.setItem(
    keyOf(formId),
    JSON.stringify({
      version: 1,
      draft: { values: { title: text }, baseline: { title: 'Hello' } },
    })
  );

describe('form-store draft persistence', () => {
  it('stores the values and baseline of a dirty form', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Edited');
    expect(storedDrafts()[postA]).toEqual({
      values: { [title]: 'Edited' },
      baseline: { [title]: 'Hello' },
    });
  });

  it('never stores a pristine or clean form', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().registerForm(postB, { [title]: 'Hello' });
    store.getState().setFieldValue(postB, title, 'Edited');
    store.getState().setFieldValue(postB, title, 'Hello');
    expect(storedDrafts()).toEqual({});
  });

  it('restores a draft after a reload as a dirty form', async () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Edited');
    await simulateReload();

    store.getState().registerForm(postA, { [title]: 'Hello' });
    expect(store.getState().forms[postA]?.values[title]).toBe('Edited');
    expect(formStatus(store.getState().forms[postA])).toBe('dirty');
  });

  it('keeps its own edits and adopts fields another writer changed', async () => {
    store.getState().registerForm(postA, { [title]: 'Hello', [body]: 'Old' });
    store.getState().setFieldValue(postA, title, 'Mine');
    await simulateReload();

    store
      .getState()
      .registerForm(postA, { [title]: 'Hello', [body]: 'Theirs' });
    const scope = store.getState().forms[postA];
    expect(scope?.values).toEqual({ [title]: 'Mine', [body]: 'Theirs' });
    expect(isEdited(scope) && scope.baseline).toEqual({
      [title]: 'Hello',
      [body]: 'Theirs',
    });
    expect(formStatus(scope)).toBe('dirty');
  });

  it('keeps its own edit on a field another writer also changed', async () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Mine');
    await simulateReload();

    store.getState().registerForm(postA, { [title]: 'Theirs' });
    expect(store.getState().forms[postA]?.values[title]).toBe('Mine');
    expect(formStatus(store.getState().forms[postA])).toBe('dirty');
  });

  it('adopts the equality the form registers after a restore', async () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Edited');
    await simulateReload();

    const equal = vi.fn(() => false);
    store.getState().registerForm(postA, { [title]: 'Hello' }, equal);
    store.getState().setFieldValue(postA, title, 'Again');
    expect(equal).toHaveBeenCalled();
  });

  it('drops the draft when the form saves', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Edited');
    expect(storedDrafts()).toHaveProperty([postA]);
    store.getState().markSaved(postA);
    expect(storedDrafts()).toEqual({});
  });

  it('drops the draft when the edits are discarded', () => {
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Edited');
    expect(storedDrafts()).toHaveProperty([postA]);
    store.getState().discardEdits(postA);
    expect(storedDrafts()).toEqual({});
  });

  it('round-trips a nested value', async () => {
    store
      .getState()
      .registerForm(postA, { [seo]: { title: 'Old', tags: ['a'] } });
    store
      .getState()
      .setFieldValue(postA, seo, { title: 'New', tags: ['a', 'b'] });
    await simulateReload();

    expect(store.getState().forms[postA]?.values[seo]).toEqual({
      title: 'New',
      tags: ['a', 'b'],
    });
  });

  it('ignores stored drafts in an unknown shape', async () => {
    localStorage.setItem(
      keyOf(postA),
      JSON.stringify({ version: 1, draft: 'garbage' })
    );
    await store.persist.rehydrate();
    expect(store.getState().forms).toEqual({});
  });

  it('leaves a draft another tab wrote', () => {
    otherTabWrites(postB, 'Theirs');
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Mine');
    expect(storedDrafts()[postB]).toEqual({
      values: { title: 'Theirs' },
      baseline: { title: 'Hello' },
    });
  });

  it('does not roll back a draft another tab updated after this tab loaded', async () => {
    otherTabWrites(postB, 'First');
    await simulateReload();
    otherTabWrites(postB, 'Second');

    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Mine');
    expect(storedDrafts()[postB]).toEqual({
      values: { title: 'Second' },
      baseline: { title: 'Hello' },
    });
  });

  it('removes only the draft of the form that saved', () => {
    otherTabWrites(postB, 'Theirs');
    store.getState().registerForm(postA, { [title]: 'Hello' });
    store.getState().setFieldValue(postA, title, 'Mine');
    store.getState().markSaved(postA);
    expect(Object.keys(storedDrafts())).toEqual([postB]);
  });
});
