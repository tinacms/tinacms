import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { toFieldAddress } from '../core/field/address';
import { simulateReload } from '../test/simulate-reload';
import { draftKey, readDraft } from './drafts';
import {
  formStatus,
  staleDraft,
  syncDrafts,
  toFormId,
  useFormStore,
} from './form-store';

const title = toFieldAddress('title');
const seo = toFieldAddress('seo');
const summary = toFieldAddress('summary');
const postA = toFormId('posts/a.mdx');
const postB = toFormId('posts/b.mdx');
const store = useFormStore;

const syncing = () => onTestFinished(syncDrafts());

const otherTabWrites = (formId: string, text: string) =>
  localStorage.setItem(
    draftKey(formId),
    JSON.stringify({
      version: 1,
      values: { title: text },
      baseline: { title: 'Hello' },
    })
  );

const editA = (text: string) => {
  store.getState().registerForm(postA, { [title]: 'Hello' });
  store.getState().setFieldValue(postA, title, text);
};

describe('form drafts', () => {
  it('stores the values and baseline of a dirty form', () => {
    syncing();
    editA('Edited');
    expect(readDraft(postA)).toEqual({
      values: { title: 'Edited' },
      baseline: { title: 'Hello' },
    });
  });

  it('drops the draft when the form is edited back to its baseline', () => {
    syncing();
    editA('Edited');
    store.getState().setFieldValue(postA, title, 'Hello');
    expect(readDraft(postA)).toBeUndefined();
  });

  it('drops the draft when the form saves', () => {
    syncing();
    editA('Edited');
    store.getState().markSaved(postA);
    expect(readDraft(postA)).toBeUndefined();
  });

  it('drops the draft when the edits are discarded', () => {
    syncing();
    editA('Edited');
    store.getState().discardEdits(postA);
    expect(readDraft(postA)).toBeUndefined();
  });

  it('restores a draft after a reload, still dirty', () => {
    syncing();
    editA('Edited');
    simulateReload();

    store.getState().registerForm(postA, { [title]: 'Hello' });
    expect(store.getState().forms[postA]?.values[title]).toBe('Edited');
    expect(formStatus(store.getState().forms[postA])).toBe('dirty');
  });

  it('round-trips a nested value', () => {
    syncing();
    const loaded = { [seo]: { title: 'Old', tags: ['a'] } };
    store.getState().registerForm(postA, loaded);
    store
      .getState()
      .setFieldValue(postA, seo, { title: 'New', tags: ['a', 'b'] });
    simulateReload();

    store.getState().registerForm(postA, loaded);
    expect(store.getState().forms[postA]?.values[seo]).toEqual({
      title: 'New',
      tags: ['a', 'b'],
    });
  });

  it('opens on the file when the stored draft has an unknown shape', () => {
    localStorage.setItem(draftKey(postA), JSON.stringify({ version: 1 }));
    store.getState().registerForm(postA, { [title]: 'Hello' });
    expect(formStatus(store.getState().forms[postA])).toBe('pristine');
  });

  it('never writes the draft of a form this tab did not change', () => {
    syncing();
    otherTabWrites(postB, 'Theirs');
    editA('Mine');
    expect(readDraft(postB)?.values).toEqual({ title: 'Theirs' });
  });

  it('opens on the file after another tab saved it', () => {
    syncing();
    otherTabWrites(postA, 'Theirs');
    localStorage.removeItem(draftKey(postA));
    store.getState().registerForm(postA, { [title]: 'Saved elsewhere' });
    expect(store.getState().forms[postA]?.values[title]).toBe(
      'Saved elsewhere'
    );
    expect(formStatus(store.getState().forms[postA])).toBe('pristine');
  });

  it('opens a stale draft on the file, and keeps the draft for the editor to resolve', () => {
    syncing();
    editA('Mine');
    simulateReload();

    const changed = { [title]: 'Changed elsewhere' };
    store.getState().registerForm(postA, changed);
    expect(store.getState().forms[postA]?.values[title]).toBe(
      'Changed elsewhere'
    );
    expect(formStatus(store.getState().forms[postA])).toBe('pristine');
    expect(staleDraft(postA, changed)?.values).toEqual({ title: 'Mine' });
  });

  it('resumes a stale draft over the file, with the file as its baseline', () => {
    syncing();
    editA('Mine');
    simulateReload();
    const changed = { [title]: 'Changed elsewhere' };
    store.getState().registerForm(postA, changed);

    store.getState().resumeDraft(postA, {
      values: { [title]: 'Mine' },
      baseline: { [title]: 'Hello' },
    });
    expect(store.getState().forms[postA]?.values[title]).toBe('Mine');
    expect(formStatus(store.getState().forms[postA])).toBe('dirty');
    expect(readDraft(postA)).toEqual({
      values: { title: 'Mine' },
      baseline: { title: 'Changed elsewhere' },
    });
    expect(staleDraft(postA, changed)).toBeUndefined();
  });

  it('resumes only the fields the draft changed, keeping newer fields of the file', () => {
    store.getState().registerForm(postA, {
      [title]: 'Hello',
      [summary]: 'Theirs',
    });
    store.getState().resumeDraft(postA, {
      values: { [title]: 'Mine', [summary]: 'Old' },
      baseline: { [title]: 'Hello', [summary]: 'Old' },
    });
    expect(store.getState().forms[postA]?.values).toEqual({
      [title]: 'Mine',
      [summary]: 'Theirs',
    });
  });

  it('opens and edits forms when the browser blocks site data', () => {
    const blocked = vi
      .spyOn(globalThis, 'localStorage', 'get')
      .mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });
    onTestFinished(() => blocked.mockRestore());
    syncing();

    expect(() => editA('Edited')).not.toThrow();
    expect(store.getState().forms[postA]?.values[title]).toBe('Edited');
    expect(staleDraft(postA, { [title]: 'Hello' })).toBeUndefined();
  });
});
