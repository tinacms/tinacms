import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { toUserId } from '../core/auth/contract';
import { toFieldAddress } from '../core/field/address';
import { simulateReload } from '../test/simulate-reload';
import {
  draftKey,
  listStoredDraftIds,
  readDraft,
  readWaitingDrafts,
  removeDraft,
  writeDraft,
} from './drafts';
import {
  type FormId,
  formStatus,
  syncDrafts,
  toFormId,
  useFormStore,
} from './form-store';

const title = toFieldAddress('title');
const seo = toFieldAddress('seo');
const summary = toFieldAddress('summary');
const postA = toFormId('posts/a.mdx');
const postB = toFormId('posts/b.mdx');
const ada = toUserId('ada');
const grace = toUserId('grace');
const store = useFormStore;

const syncing = () => onTestFinished(syncDrafts());

const otherTabWrites = (formId: FormId, text: string) =>
  localStorage.setItem(
    draftKey(formId),
    JSON.stringify({
      version: 2,
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

  // Rows of the draft recovery contract (.factory/spec.md), one test each.
  const FILE = { [title]: 'Hello', [summary]: 'Same' };
  const open = (file: Record<string, unknown> = FILE) =>
    store.getState().registerForm(postA, file as never);
  const typeTitle = (text: string) =>
    store.getState().setFieldValue(postA, title, text);
  const waitingOf = () => store.getState().waiting[postA] ?? [];
  const form = () => store.getState().forms[postA];
  const failWrites = (match: (key: string) => boolean) => {
    const real = localStorage.setItem.bind(localStorage);
    const spy = vi
      .spyOn(localStorage, 'setItem')
      .mockImplementation((key, value) => {
        if (match(key)) throw new DOMException('full', 'QuotaExceededError');
        real(key, value);
      });
    onTestFinished(() => spy.mockRestore());
  };
  const reloadWithEdit = (text = 'Mine') => {
    syncing();
    open();
    typeTitle(text);
    simulateReload();
  };

  it('row 1: opens a document with nothing stored on the file, clean', () => {
    open();
    expect(formStatus(form())).toBe('pristine');
    expect(waitingOf()).toEqual([]);
  });

  it('row 2: opening never applies a stored draft, even for the same file version', () => {
    reloadWithEdit();
    open();
    expect(form()?.values[title]).toBe('Hello');
    expect(formStatus(form())).toBe('pristine');
    expect(waitingOf()).toEqual([
      { values: { title: 'Mine', summary: 'Same' }, baseline: FILE },
    ]);
    expect(readDraft(postA)).toBeUndefined();
  });

  it('row 3: a draft typed on an older file waits too', () => {
    reloadWithEdit();
    open({ [title]: 'Changed elsewhere', [summary]: 'Same' });
    expect(form()?.values[title]).toBe('Changed elsewhere');
    expect(waitingOf()).toHaveLength(1);
    expect(readDraft(postA)).toBeUndefined();
  });

  it('row 5: a stored copy equal to the file is removed with no waiting copy', () => {
    reloadWithEdit();
    open({ [title]: 'Mine', [summary]: 'Same' });
    expect(waitingOf()).toEqual([]);
    expect(readDraft(postA)).toBeUndefined();
    expect(listStoredDraftIds()).toEqual([]);
  });

  it('rows 6 and 15: a second change to the file adds a copy and leaves the first byte for byte', () => {
    reloadWithEdit('Mine');
    open();
    const first = localStorage.getItem(`${draftKey(postA)}#waiting`);
    syncing();
    typeTitle('Mine, later');
    simulateReload();
    open({ [title]: 'Hello v2', [summary]: 'Same' });
    expect(waitingOf().map((copy) => copy.values.title)).toEqual([
      'Mine',
      'Mine, later',
    ]);
    expect(
      JSON.parse(localStorage.getItem(`${draftKey(postA)}#waiting`) ?? '{}')
        .copies[0]
    ).toEqual(JSON.parse(first ?? '{}').copies[0]);
    simulateReload();
    open({ [title]: 'Hello v3', [summary]: 'Same' });
    expect(waitingOf()).toHaveLength(2);
  });

  it('row 7: typing under the toast stores the edit in the live copy and leaves waiting copies alone', () => {
    reloadWithEdit();
    open();
    const before = waitingOf();
    syncing();
    store.getState().setFieldValue(postA, summary, 'Typed');
    expect(readDraft(postA)?.values).toEqual({
      title: 'Hello',
      summary: 'Typed',
    });
    expect(waitingOf()).toEqual(before);
    expect(readWaitingDrafts(postA)).toEqual(before);
  });

  it('row 8: Resume with nothing typed applies the copy, writes it as the live copy, then removes the waiting copy', () => {
    reloadWithEdit();
    open();
    syncing();
    store.getState().resumeWaiting(postA);
    expect(form()?.values[title]).toBe('Mine');
    expect(formStatus(form())).toBe('dirty');
    expect(readDraft(postA)?.values).toEqual({
      title: 'Mine',
      summary: 'Same',
    });
    expect(readWaitingDrafts(postA)).toEqual([]);
    expect(waitingOf()).toEqual([]);
  });

  it('row 10: Resume keeps a different field that was typed', () => {
    reloadWithEdit();
    open();
    syncing();
    store.getState().setFieldValue(postA, summary, 'Typed');
    store.getState().resumeWaiting(postA);
    expect(form()?.values).toEqual({ [title]: 'Mine', [summary]: 'Typed' });
    expect(readWaitingDrafts(postA)).toEqual([]);
  });

  it('row 9: a collision keeps the typed value and stores the earlier value in a leftover copy', () => {
    reloadWithEdit('Earlier');
    open();
    syncing();
    typeTitle('Typed now');
    store.getState().resumeWaiting(postA);
    expect(form()?.values[title]).toBe('Typed now');
    expect(waitingOf()).toEqual([
      {
        values: { title: 'Earlier', summary: 'Same' },
        baseline: FILE,
        leftover: true,
      },
    ]);
    expect(readWaitingDrafts(postA)).toEqual(waitingOf());
    expect(readDraft(postA)?.values.title).toBe('Typed now');
  });

  it('row 9: Resume on the leftover swaps the values without dropping either', () => {
    reloadWithEdit('Earlier');
    open();
    syncing();
    typeTitle('Typed now');
    store.getState().resumeWaiting(postA);
    store.getState().resumeWaiting(postA);
    expect(form()?.values[title]).toBe('Earlier');
    expect(waitingOf()).toEqual([
      {
        values: { title: 'Typed now', summary: 'Same' },
        baseline: FILE,
        leftover: true,
      },
    ]);
    store.getState().resumeWaiting(postA);
    expect(form()?.values[title]).toBe('Typed now');
  });

  it('row 11: discarding in the toast removes waiting copies only, not the live copy or the form', () => {
    reloadWithEdit();
    open();
    syncing();
    store.getState().setFieldValue(postA, summary, 'Typed');
    store.getState().discardWaiting(postA);
    expect(waitingOf()).toEqual([]);
    expect(readWaitingDrafts(postA)).toEqual([]);
    expect(form()?.values[summary]).toBe('Typed');
    expect(readDraft(postA)?.values.summary).toBe('Typed');
  });

  it('row 13: Discard unsaved edits removes the live copy and keeps waiting copies', () => {
    reloadWithEdit();
    open();
    syncing();
    store.getState().setFieldValue(postA, summary, 'Typed');
    store.getState().discardEdits(postA);
    expect(readDraft(postA)).toBeUndefined();
    expect(readWaitingDrafts(postA)).toHaveLength(1);
  });

  it('row 14: a good save removes the live copy and keeps every waiting copy', () => {
    reloadWithEdit();
    open();
    syncing();
    store.getState().setFieldValue(postA, summary, 'Typed');
    store.getState().markSaved(postA);
    expect(readDraft(postA)).toBeUndefined();
    expect(readWaitingDrafts(postA)).toHaveLength(1);
    expect(listStoredDraftIds()).toEqual([postA]);
  });

  it('rows 18 and 19: reload after typing under the toast leaves the older copy and the typed copy', () => {
    reloadWithEdit('Earlier');
    open();
    syncing();
    store.getState().setFieldValue(postA, summary, 'Typed');
    simulateReload();
    open();
    expect(waitingOf().map((copy) => copy.values.summary)).toEqual([
      'Same',
      'Typed',
    ]);
    expect(readDraft(postA)).toBeUndefined();
  });

  it('row 20: reload after Resume waits again as the newest copy', () => {
    reloadWithEdit();
    open();
    syncing();
    store.getState().resumeWaiting(postA);
    simulateReload();
    open();
    expect(waitingOf()).toHaveLength(1);
    expect(waitingOf()[0]?.values.title).toBe('Mine');
  });

  it('row 17: switching branch compares copies only with their own branch', () => {
    syncing();
    store.getState().setBranch('feature');
    open();
    typeTitle('On feature');
    store.getState().setBranch(undefined);
    open();
    expect(waitingOf()).toEqual([]);
    expect(readDraft(postA, undefined, 'feature')?.values.title).toBe(
      'On feature'
    );
    expect(listStoredDraftIds()).toEqual([]);
    expect(listStoredDraftIds(undefined, 'feature')).toEqual([postA]);
  });

  it('row 22: when the copy cannot be moved aside, nothing is removed, the toast still reads it and edits stay in memory', () => {
    reloadWithEdit();
    failWrites((key) => key.endsWith('#waiting'));
    open();
    expect(readDraft(postA)?.values.title).toBe('Mine');
    expect(waitingOf()).toHaveLength(1);
    expect(store.getState().held[postA]).toBe(true);
    expect(store.getState().unstored[postA]).toBe(true);
    syncing();
    store.getState().setFieldValue(postA, summary, 'Typed');
    expect(form()?.values[summary]).toBe('Typed');
    expect(readDraft(postA)?.values).toEqual({
      title: 'Mine',
      summary: 'Same',
    });
  });

  it('row 22: a held copy is still discardable, and what was typed since takes the live slot', () => {
    reloadWithEdit();
    failWrites((key) => key.endsWith('#waiting'));
    open();
    syncing();
    store.getState().setFieldValue(postA, summary, 'Typed');
    store.getState().discardWaiting(postA);
    expect(store.getState().held[postA]).toBeUndefined();
    expect(readDraft(postA)?.values).toEqual({
      title: 'Hello',
      summary: 'Typed',
    });
    expect(store.getState().unstored[postA]).toBeUndefined();
  });

  it('row 23: a failed edit write keeps the last stored copy and marks the edits unstored', () => {
    syncing();
    open();
    typeTitle('One');
    failWrites((key) => key === draftKey(postA));
    typeTitle('Two');
    expect(readDraft(postA)?.values.title).toBe('One');
    expect(store.getState().unstored[postA]).toBe(true);
  });

  it('row 24: a failed Resume write applies the values and keeps every waiting copy', () => {
    reloadWithEdit();
    open();
    syncing();
    failWrites((key) => key === draftKey(postA));
    store.getState().resumeWaiting(postA);
    expect(form()?.values[title]).toBe('Mine');
    expect(readWaitingDrafts(postA)).toHaveLength(1);
    expect(store.getState().unstored[postA]).toBe(true);
  });

  it('row 25: with storage blocked nothing is stored and nothing warns', () => {
    const blocked = vi
      .spyOn(globalThis, 'localStorage', 'get')
      .mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });
    onTestFinished(() => blocked.mockRestore());
    syncing();
    open();
    typeTitle('Edited');
    expect(form()?.values[title]).toBe('Edited');
    expect(waitingOf()).toEqual([]);
    expect(store.getState().unstored[postA]).toBeUndefined();
  });

  // Two copies on one field plus typing: every Resume keeps every value somewhere.
  const threeValues = () => {
    syncing();
    open();
    typeTitle('DRAFT A');
    simulateReload();
    open({ [title]: 'File 2', [summary]: 'Same' });
    typeTitle('DRAFT B');
    simulateReload();
    open({ [title]: 'File 3', [summary]: 'Same' });
    typeTitle('TYPED C');
    return { [title]: 'File 3', [summary]: 'Same' };
  };
  const allTitles = () =>
    [
      form()?.values[title],
      readDraft(postA)?.values.title,
      ...readWaitingDrafts(postA).map((copy) => copy.values.title),
    ].filter(Boolean);

  const otherTabAddsCopy = (text: string) => {
    const key = `${draftKey(postA)}#waiting`;
    const list = JSON.parse(localStorage.getItem(key) ?? '{"copies":[]}');
    list.version = 2;
    list.copies.push({
      values: { title: text, summary: 'Same' },
      baseline: FILE,
    });
    localStorage.setItem(key, JSON.stringify(list));
  };

  it('row 11: Confirm removes the copies shown, and a copy another tab added since stays', () => {
    reloadWithEdit('Mine');
    open();
    const shown = waitingOf();
    otherTabAddsCopy('Other tab');
    store.getState().discardWaiting(postA, shown);
    expect(readWaitingDrafts(postA).map((copy) => copy.values.title)).toEqual([
      'Other tab',
    ]);
  });

  it('row 8: Resume reads the list from storage at the click, so a copy another tab added is applied', () => {
    reloadWithEdit('Mine');
    open();
    syncing();
    otherTabAddsCopy('Other tab');
    store.getState().resumeWaiting(postA);
    expect([
      form()?.values[title],
      ...waitingOf().map((copy) => copy.values.title),
    ]).toEqual(expect.arrayContaining(['Mine', 'Other tab']));
  });

  it('row 9: a second Resume keeps every earlier collision value', () => {
    threeValues();
    const resume = () => store.getState().resumeWaiting(postA);
    resume();
    expect(form()?.values[title]).toBe('TYPED C');
    for (let at = 0; at < 4; at++) {
      resume();
      expect(allTitles()).toEqual(
        expect.arrayContaining(['DRAFT A', 'DRAFT B', 'TYPED C'])
      );
    }
  });

  it('row 9: a swap that cannot be stored changes nothing and warns', () => {
    syncing();
    reloadWithEdit('Earlier');
    open();
    typeTitle('Typed now');
    store.getState().resumeWaiting(postA);
    failWrites((key) => key.endsWith('#waiting'));
    store.getState().resumeWaiting(postA);
    expect(form()?.values[title]).toBe('Typed now');
    expect(readDraft(postA)?.values.title).toBe('Typed now');
    expect(readWaitingDrafts(postA).map((copy) => copy.values.title)).toEqual([
      'Earlier',
    ]);
    expect(store.getState().failures[postA]).toBeGreaterThan(0);
    expect(store.getState().hidden[postA]).toBeUndefined();
  });

  it('row 24: a failed Resume hides the prompt until the next open, and keeps every copy', () => {
    reloadWithEdit();
    open();
    syncing();
    failWrites((key) => key === draftKey(postA));
    store.getState().resumeWaiting(postA);
    expect(store.getState().hidden[postA]).toBe(true);
    expect(readWaitingDrafts(postA)).toHaveLength(1);
    simulateReload();
    open();
    expect(store.getState().hidden[postA]).toBeUndefined();
    expect(waitingOf().length).toBeGreaterThan(0);
  });

  it('row 9: a displaced value equal to the file leaves no empty leftover', () => {
    reloadWithEdit('Earlier');
    open();
    syncing();
    typeTitle('Typed now');
    store.getState().resumeWaiting(postA);
    store.getState().markSaved(postA);
    store.getState().resumeWaiting(postA);
    expect(
      waitingOf().every((copy) => Object.keys(copy.values).length > 0)
    ).toBe(true);
    expect(
      waitingOf().filter(
        (copy) => copy.leftover && copy.values.title === 'Typed now'
      )
    ).toEqual([]);
  });

  it('row 28: discarding a document with no file removes the live copy, waiting copies and in-memory edits', () => {
    reloadWithEdit();
    open();
    syncing();
    store.getState().setFieldValue(postA, summary, 'Typed');
    store.getState().discardStoredDraft(postA);
    expect(listStoredDraftIds()).toEqual([]);
    expect(form()).toBeUndefined();
    expect(waitingOf()).toEqual([]);
  });

  it('row 26: Status bar kept words need a confirmed write', () => {
    reloadWithEdit();
    open();
    expect(store.getState().unstored[postA]).toBeUndefined();
    expect(waitingOf()).toHaveLength(1);
  });

  it('opens on the file when the stored draft has an unknown shape', () => {
    localStorage.setItem(draftKey(postA), JSON.stringify({ version: 2 }));
    open();
    expect(formStatus(form())).toBe('pristine');
    expect(waitingOf()).toEqual([]);
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

  it('treats a draft with a blank field name as no draft', () => {
    localStorage.setItem(
      draftKey(postA),
      JSON.stringify({
        version: 2,
        values: { '': 'x', title: 'Mine' },
        baseline: { title: 'Hello' },
      })
    );
    expect(readDraft(postA)).toBeUndefined();
    expect(() =>
      store.getState().registerForm(postA, { [title]: 'Hello' })
    ).not.toThrow();
    expect(formStatus(store.getState().forms[postA])).toBe('pristine');
  });

  it('encodes special characters in user ids so keys never collide', () => {
    const colonUser = toUserId('auth0:ada');
    const plainUser = toUserId('auth0');
    const subPost = toFormId('ada:posts/a.mdx');
    expect(draftKey(postA, colonUser)).not.toBe(draftKey(subPost, plainUser));
    expect(draftKey(postA, ada)).not.toBe(draftKey(postA));
  });

  it('neither reads nor writes drafts while signed out under an auth plugin', () => {
    writeDraft(
      postA,
      { values: { title: 'Mine' }, baseline: { title: 'Hello' } },
      null
    );
    expect(localStorage.length).toBe(0);

    writeDraft(postA, {
      values: { title: 'Mine' },
      baseline: { title: 'Hello' },
    });
    expect(readDraft(postA, null)).toBeUndefined();
    removeDraft(postA, null);
    expect(readDraft(postA)).toBeDefined();
  });

  it('keeps unsaved edits from carrying over to the next editor in the same tab, and returns them as a waiting copy', () => {
    syncing();
    store.getState().setUserId(ada);
    editA('Ada draft');
    expect(readDraft(postA, ada)?.values).toEqual({ title: 'Ada draft' });

    store.getState().setUserId(null);
    expect(store.getState().forms[postA]).toBeUndefined();
    expect(readDraft(postA, ada)?.values).toEqual({ title: 'Ada draft' });

    store.getState().setUserId(grace);
    store.getState().registerForm(postA, { [title]: 'Hello' });
    expect(store.getState().forms[postA]?.values[title]).toBe('Hello');
    expect(store.getState().waiting[postA] ?? []).toEqual([]);

    store.getState().setUserId(null);
    store.getState().setUserId(ada);
    store.getState().registerForm(postA, { [title]: 'Hello' });
    expect(store.getState().forms[postA]?.values[title]).toBe('Hello');
    expect(store.getState().waiting[postA]?.[0]?.values).toEqual({
      title: 'Ada draft',
    });
  });

  it('isolates drafts per editor across a browser reload', () => {
    syncing();
    store.getState().setUserId(ada);
    editA('Ada draft');
    store.getState().setUserId(null);

    simulateReload();
    store.getState().setUserId(grace);
    store.getState().registerForm(postA, { [title]: 'Hello' });
    expect(store.getState().waiting[postA] ?? []).toEqual([]);

    simulateReload();
    store.getState().setUserId(ada);
    store.getState().registerForm(postA, { [title]: 'Hello' });
    expect(store.getState().waiting[postA]).toHaveLength(1);
  });
});
