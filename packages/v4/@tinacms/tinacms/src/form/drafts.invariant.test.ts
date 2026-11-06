import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { toFieldAddress } from '../core/field/address';
import { simulateReload } from '../test/simulate-reload';
import { draftKey, readDraft, readWaitingDrafts } from './drafts';
import { syncDrafts, toFormId, useFormStore } from './form-store';

const title = toFieldAddress('title');
const summary = toFieldAddress('summary');
const post = toFormId('posts/a.mdx');
const store = useFormStore;

const generator = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 2 ** 32;
  return seed / 2 ** 32;
};

type Failing = 'none' | 'waiting' | 'live' | 'all';
type Step =
  | 'type'
  | 'resume'
  | 'discard'
  | 'cancel-discard'
  | 'discard-edits'
  | 'save'
  | 'failed-save'
  | 'reload'
  | 'file-change'
  | 'fail-waiting'
  | 'fail-live'
  | 'fail-all'
  | 'writes-work';
const STEPS: Step[] = [
  'type',
  'type',
  'type',
  'resume',
  'resume',
  'resume',
  'discard',
  'cancel-discard',
  'discard-edits',
  'save',
  'failed-save',
  'reload',
  'reload',
  'file-change',
  'file-change',
  'fail-waiting',
  'fail-live',
  'fail-all',
  'writes-work',
  'writes-work',
];

const stringsIn = (record: Record<string, unknown> | undefined) =>
  Object.values(record ?? {}).filter(
    (value): value is string => typeof value === 'string'
  );

// Writes fail per key, so the test can break the waiting list and the live copy
// separately. The spy is installed once for the whole file.
let failing: Failing = 'none';
let failedWrites = 0;
let restore: () => void = () => {};

beforeAll(() => {
  const real = localStorage.setItem.bind(localStorage);
  const spy = vi
    .spyOn(localStorage, 'setItem')
    .mockImplementation((key, value) => {
      const waiting = key.endsWith('#waiting');
      const breaks =
        failing === 'all' ||
        (failing === 'waiting' && waiting) ||
        (failing === 'live' && !waiting);
      if (breaks) {
        failedWrites += 1;
        throw new DOMException('full', 'QuotaExceededError');
      }
      real(key, value);
    });
  restore = () => spy.mockRestore();
});
afterAll(() => restore());

const snapshot = () => JSON.stringify(Object.entries(localStorage).sort());

describe('draft recovery invariant', () => {
  it('keeps every typed value in the form, a stored copy or the file until a confirmed Discard or a good Save', () => {
    const only = Number(process.env.SEED);
    for (let seed = only || 1; seed <= (only || 1500); seed++) {
      localStorage.clear();
      simulateReload();
      failing = 'none';
      const unsync = syncDrafts();
      const random = generator(seed);
      let file: Record<string, string> = { title: 'file 0', summary: 'file 0' };
      let counter = 0;
      const typed = new Set<string>();
      const gone = new Set<string>();
      // Values that only exist in memory because a write failed. They die on reload.
      const memoryOnly = new Set<string>();
      const open = () =>
        store.getState().registerForm(post, { ...file } as never);
      open();
      const log: Step[] = [];

      const stored = () => [
        ...stringsIn(readDraft(post)?.values),
        ...readWaitingDrafts(post).flatMap((copy) => stringsIn(copy.values)),
      ];
      const inForm = () => stringsIn(store.getState().forms[post]?.values);
      const waitingValues = () =>
        readWaitingDrafts(post).flatMap((copy) => stringsIn(copy.values));

      for (let at = 0; at < 40; at++) {
        const step = STEPS[Math.floor(random() * STEPS.length)];
        log.push(step);
        const failedBefore = failedWrites;
        const beforeCancel = snapshot();
        const storedBefore = new Set(stored());
        switch (step) {
          case 'type': {
            const value = `typed ${++counter}`;
            typed.add(value);
            const field = random() < 0.5 ? title : summary;
            const replaced = store.getState().forms[post]?.values[field];
            if (
              typeof replaced === 'string' &&
              !waitingValues().includes(replaced)
            ) {
              gone.add(replaced);
            }
            store.getState().setFieldValue(post, field, value);
            break;
          }
          case 'resume':
            store.getState().resumeWaiting(post);
            break;
          case 'discard':
            for (const value of waitingValues()) gone.add(value);
            for (const copy of store.getState().waiting[post] ?? []) {
              for (const value of stringsIn(copy.values)) gone.add(value);
            }
            store
              .getState()
              .discardWaiting(post, store.getState().waiting[post] ?? []);
            break;
          case 'cancel-discard':
            break;
          case 'discard-edits': {
            const keep = new Set(waitingValues());
            for (const value of [
              ...inForm(),
              ...stringsIn(readDraft(post)?.values),
            ]) {
              if (!keep.has(value)) gone.add(value);
            }
            store.getState().discardEdits(post);
            break;
          }
          case 'save': {
            const values = store.getState().forms[post]?.values ?? {};
            file = { ...file, ...(values as Record<string, string>) };
            store.getState().markSaved(post);
            break;
          }
          case 'failed-save':
            store
              .getState()
              .setSavePhase(post, { phase: 'failed', message: 'no' });
            break;
          case 'file-change':
          case 'reload': {
            if (step === 'file-change') {
              file = { ...file, title: `file ${++counter}` };
            }
            for (const value of memoryOnly) gone.add(value);
            memoryOnly.clear();
            simulateReload();
            open();
            break;
          }
          case 'fail-waiting':
            failing = 'waiting';
            break;
          case 'fail-live':
            failing = 'live';
            break;
          case 'fail-all':
            failing = 'all';
            break;
          case 'writes-work':
            failing = 'none';
            break;
        }
        if (step === 'cancel-discard' || step === 'failed-save') {
          expect(snapshot(), `seed ${seed}: ${step} changed storage`).toBe(
            beforeCancel
          );
        }
        const inStorage = new Set(stored());
        const wroteBadly = failedWrites > failedBefore;
        for (const value of inForm()) {
          if (!typed.has(value) || inStorage.has(value)) continue;
          if (stringsIn(file).includes(value)) continue;
          // A held copy owns the live slot, so edits wait in memory by design.
          const held = store.getState().held[post] === true;
          // A step may leave a value in memory only when it could not store it. A
          // value that was stored before the step and is not now was destroyed.
          const excused =
            !storedBefore.has(value) &&
            (wroteBadly || held || memoryOnly.has(value));
          if (excused) memoryOnly.add(value);
          else {
            expect.fail(
              `seed ${seed}: "${value}" is in the form but not stored and nothing excuses it, after ${log.join(', ')}`
            );
          }
        }
        for (const value of [...memoryOnly]) {
          if (inStorage.has(value)) memoryOnly.delete(value);
        }
        const where = new Set([...inForm(), ...inStorage, ...stringsIn(file)]);
        for (const value of typed) {
          if (gone.has(value)) continue;
          expect(
            where.has(value),
            `seed ${seed}: "${value}" lost after ${log.join(', ')}`
          ).toBe(true);
        }
        for (const value of stringsIn(file)) typed.delete(value);
      }
      unsync();
      failing = 'none';
      void draftKey;
    }
  });
});
