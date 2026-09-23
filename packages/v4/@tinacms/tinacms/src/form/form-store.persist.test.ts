import { describe, expect, it, vi } from 'vitest';
import { toFieldAddress } from '../core/field/address';
import { simulateReload } from '../test/simulate-reload';
import {
  DRAFT_STORAGE_KEY,
  formStatus,
  toFormId,
  useFormStore,
} from './form-store';

const title = toFieldAddress('title');
const seo = toFieldAddress('seo');
const postA = toFormId('posts/a.mdx');
const postB = toFormId('posts/b.mdx');
const store = useFormStore;

const storedDrafts = (): Record<string, unknown> => {
  const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) return {};
  const parsed: { state: { forms: Record<string, unknown> } } = JSON.parse(raw);
  return parsed.state.forms;
};

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
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).not.toBeNull();
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
      DRAFT_STORAGE_KEY,
      JSON.stringify({ state: { forms: { [postA]: 'garbage' } }, version: 1 })
    );
    await store.persist.rehydrate();
    expect(store.getState().forms).toEqual({});
  });
});
