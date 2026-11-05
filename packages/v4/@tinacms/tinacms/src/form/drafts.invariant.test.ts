import { afterEach, describe, expect, it, vi } from 'vitest';
import { toFieldAddress } from '../core/field/address';
import { simulateReload } from '../test/simulate-reload';
import { readDraft, readWaitingDrafts } from './drafts';
import { syncDrafts, toFormId, useFormStore } from './form-store';

const title = toFieldAddress('title');
const summary = toFieldAddress('summary');
const post = toFormId('posts/a.mdx');
const store = useFormStore;

const generator = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 2 ** 32;
  return seed / 2 ** 32;
};

type Step =
  | 'type'
  | 'resume'
  | 'discard'
  | 'cancel'
  | 'discard-edits'
  | 'save'
  | 'failed-save'
  | 'reload'
  | 'file-change'
  | 'storage-fails'
  | 'storage-works';
const STEPS: Step[] = [
  'type',
  'type',
  'type',
  'resume',
  'discard',
  'cancel',
  'discard-edits',
  'save',
  'failed-save',
  'reload',
  'file-change',
  'storage-fails',
  'storage-works',
];

const stringsIn = (record: Record<string, unknown> | undefined) =>
  Object.values(record ?? {}).filter(
    (value): value is string => typeof value === 'string'
  );

afterEach(() => vi.restoreAllMocks());

describe('draft recovery invariant', () => {
  it('keeps every typed value in the form, a stored copy or the file until a confirmed Discard or a good Save', () => {
    for (let seed = 1; seed <= 60; seed++) {
      localStorage.clear();
      simulateReload();
      const unsync = syncDrafts();
      const random = generator(seed);
      const real = localStorage.setItem.bind(localStorage);
      let failing = false;
      vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
        if (failing) throw new DOMException('full', 'QuotaExceededError');
        real(key, value);
      });
      let file: Record<string, string> = { title: 'file 0', summary: 'file 0' };
      let counter = 0;
      const typed = new Set<string>();
      const gone = new Set<string>();
      const open = () =>
        store.getState().registerForm(post, { ...file } as never);
      open();
      const log: Step[] = [];

      const stored = () => [
        ...stringsIn(readDraft(post)?.values),
        ...readWaitingDrafts(post).flatMap((copy) => stringsIn(copy.values)),
      ];
      const inForm = () => stringsIn(store.getState().forms[post]?.values);

      for (let at = 0; at < 25; at++) {
        const step = STEPS[Math.floor(random() * STEPS.length)];
        log.push(step);
        switch (step) {
          case 'type': {
            const value = `typed ${++counter}`;
            typed.add(value);
            const field = random() < 0.5 ? title : summary;
            // Typing over a value replaces it, unless a waiting copy holds it.
            const replaced = store.getState().forms[post]?.values[field];
            const waitingValues = readWaitingDrafts(post).flatMap((copy) =>
              stringsIn(copy.values)
            );
            if (
              typeof replaced === 'string' &&
              !waitingValues.includes(replaced)
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
            for (const copy of store.getState().waiting[post] ?? []) {
              for (const value of stringsIn(copy.values)) gone.add(value);
            }
            store.getState().discardWaiting(post);
            break;
          case 'discard-edits':
            for (const value of inForm()) gone.add(value);
            for (const value of stringsIn(readDraft(post)?.values)) {
              gone.add(value);
            }
            store.getState().discardEdits(post);
            break;
          case 'save': {
            const values = store.getState().forms[post]?.values ?? {};
            file = { ...file, ...(values as Record<string, string>) };
            store.getState().markSaved(post);
            break;
          }
          case 'file-change':
          case 'reload': {
            if (step === 'file-change') {
              file = { ...file, title: `file ${++counter}` };
            }
            const safe = new Set(stored());
            for (const value of inForm()) if (!safe.has(value)) gone.add(value);
            simulateReload();
            break;
          }
          case 'storage-fails':
            failing = true;
            break;
          case 'storage-works':
            failing = false;
            break;
          default:
            break;
        }
        if (step === 'reload' || step === 'file-change') open();
        const where = new Set([...inForm(), ...stored(), ...stringsIn(file)]);
        for (const value of typed) {
          if (gone.has(value)) continue;
          const saved = Object.values(file).includes(value);
          expect(
            where.has(value) || saved,
            `seed ${seed}: "${value}" lost after ${log.join(', ')}`
          ).toBe(true);
        }
        for (const value of stringsIn(file)) typed.delete(value);
      }
      unsync();
    }
  });
});
