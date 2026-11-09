import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FieldSchema } from '../core/schema/types';
import { toFormId } from '../form/form-store';
import { t } from '../index';
import {
  ALL_FIXED,
  countRevealedErrors,
  createFormViewStore,
  REMOVED,
  fieldsAlong,
  itemOpensNextLevel,
  levelDrillsIn,
  levelsFor,
  lockAbove,
  useFormViewStore,
} from './form-view-state';

const touched = (...addresses: string[]) => ({
  touched: new Set(addresses),
  saveAttempted: false,
});
const attempted = { touched: new Set<string>(), saveAttempted: true };

describe('countRevealedErrors', () => {
  const nested = ['seo.title', 'seo.og.image', 'seo.tags', 'seo.tags.0.name'];

  it('counts nothing before a field is touched or a save is tried', () => {
    expect(countRevealedErrors(touched(), nested, 'seo')).toBe(0);
  });

  it('counts each revealed leaf once, in a nested object and an array item', () => {
    expect(
      countRevealedErrors(
        touched('seo.title', 'seo.og.image', 'seo.tags.0.name'),
        nested,
        'seo'
      )
    ).toBe(3);
  });

  it('counts every failing field after a save is tried', () => {
    expect(countRevealedErrors(attempted, nested, 'seo')).toBe(3);
  });

  it('counts the array itself when only it is touched and its item error is not revealed yet', () => {
    expect(countRevealedErrors(touched('seo.tags'), nested, 'seo')).toBe(1);
  });

  it('counts an own error that has no child error', () => {
    expect(countRevealedErrors(touched('seo'), ['seo'], 'seo')).toBe(1);
  });

  it('ignores errors outside the address', () => {
    expect(countRevealedErrors(attempted, ['seos.title', 'other'], 'seo')).toBe(
      0
    );
  });
});

describe('items as levels', () => {
  it('keeps items of a list at depth 1 and 2 in place and opens deeper ones as a level', () => {
    expect(itemOpensNextLevel('tags.0')).toBe(false);
    expect(itemOpensNextLevel('seo.tags.0')).toBe(true);
    expect(itemOpensNextLevel('a.b.tags.2')).toBe(true);
  });

  const rows: FieldSchema = {
    type: 'array',
    name: 'rows',
    fields: [{ type: 'string', name: 'note' }],
  } as FieldSchema;
  const wrap = {
    type: 'object',
    name: 'wrap',
    fields: [rows],
  } as FieldSchema;
  const valueAt = (address: string) =>
    address === 'wrap.rows.0' ? { note: 'n' } : undefined;

  it('puts an item step between its list and its field', () => {
    const along = fieldsAlong('wrap.rows.0.note', [wrap], valueAt);
    expect(along.map((step) => step.address)).toEqual([
      'wrap',
      'wrap.rows',
      'wrap.rows.0',
      'wrap.rows.0.note',
    ]);
    expect(along[2]).toMatchObject({ label: 'Item 1', item: true });
  });

  it('opens only the item level for a field in an item at depth 2', () => {
    const levels = levelsFor('wrap.rows.0.note', [wrap], valueAt, (step) =>
      levelDrillsIn(undefined, step)
    );
    expect(levels.map((level) => level.address)).toEqual(['wrap.rows.0']);
  });

  it('adds no step for a block whose template is unknown', () => {
    const blocks = {
      type: 'array',
      name: 'blocks',
      templates: [{ name: 'hero', fields: [{ type: 'string', name: 'note' }] }],
    } as FieldSchema;
    const along = fieldsAlong('blocks.0.note', [blocks], () => ({
      _template: 'gone',
    }));
    expect(along.map((step) => step.address)).toEqual(['blocks']);
  });
});

const fields = [
  t.object({
    name: 'one',
    label: 'One',
    fields: [
      t.object({
        name: 'two',
        fields: [t.string({ name: 'handle', label: 'Handle' })],
      }),
    ],
  }),
  t.array({
    name: 'blocks',
    label: 'Blocks',
    fields: [t.object({ name: 'meta', fields: [t.string({ name: 'x' })] })],
  }),
  t.array({ name: 'tags', label: 'Tags', of: t.string({ name: 'tag' }) }),
];

describe('lockAbove', () => {
  const drillable = [
    t.array({
      name: 'items',
      label: 'Items',
      readOnly: true,
      of: t.string({ name: 'item' }),
    }),
  ];

  it('keeps the lock of a list whose item has no fieldset', () => {
    expect(lockAbove('items.0', drillable, () => undefined)).toEqual({
      disabled: false,
      readOnly: true,
    });
  });
});

describe('fieldsAlong and levelsFor', () => {
  const none = () => undefined;

  it('lists each named field on the way, labelled by label or else name', () => {
    expect(
      fieldsAlong('one.two.handle', fields, none).map(({ address, label }) => [
        address,
        label,
      ])
    ).toEqual([
      ['one', 'One'],
      ['one.two', 'two'],
      ['one.two.handle', 'Handle'],
    ]);
  });

  it('steps through an array position as an item step', () => {
    const along = fieldsAlong('blocks.0.meta.x', fields, () => ({ meta: {} }));
    expect(along.map((step) => step.address)).toEqual([
      'blocks',
      'blocks.0',
      'blocks.0.meta',
      'blocks.0.meta.x',
    ]);
  });

  it('stops at an unknown name and at a position under a scalar array', () => {
    expect(fieldsAlong('one.nope.handle', fields, none)).toHaveLength(1);
    expect(fieldsAlong('tags.0', fields, none)).toHaveLength(1);
  });

  it('keeps only the levels the predicate drills into, never the field itself', () => {
    const drillsIn = (step: { address: string }) => step.address !== 'one';
    expect(
      levelsFor('one.two.handle', fields, none, drillsIn).map(
        (step) => step.address
      )
    ).toEqual(['one.two']);
  });
});

describe('useFormViewStore', () => {
  it('keeps its store for one form and starts a new one for another', () => {
    const { result, rerender } = renderHook(
      ({ id }) => useFormViewStore(toFormId(id)),
      { initialProps: { id: 'a' } }
    );
    const first = result.current;
    rerender({ id: 'a' });
    expect(result.current).toBe(first);
    rerender({ id: 'b' });
    expect(result.current).not.toBe(first);
  });
});

describe('error summary', () => {
  const labelOf = (address: string) => address.toUpperCase();
  const blocked = (...addresses: string[]) => {
    const store = createFormViewStore();
    store.getState().block(addresses);
    return store;
  };
  const addresses = (store: ReturnType<typeof createFormViewStore>) =>
    store.getState().errorSummary.blocked.map((entry) => entry.address);

  it('starts idle and blocks with the pane open', () => {
    const store = createFormViewStore();
    expect(store.getState().errorSummary.blocked).toEqual([]);
    store.getState().block(['a', 'b']);
    expect(addresses(store)).toEqual(['a', 'b']);
    expect(store.getState().errorSummary.paneOpen).toBe(true);
  });

  it('removes a fixed field and says how many are left', () => {
    const store = blocked('a', 'b', 'c');
    store.getState().fix(new Set(['b', 'c']), labelOf, null);
    expect(addresses(store)).toEqual(['b', 'c']);
    expect(store.getState().errorSummary.announcement).toBe(
      'A fixed. 2 errors left.'
    );
  });

  it('never adds a field that breaks later', () => {
    const store = blocked('a');
    store.getState().fix(new Set(['a', 'z']), labelOf, null);
    expect(addresses(store)).toEqual(['a']);
  });

  it('announces once for several fixes at the same time', () => {
    const store = blocked('a', 'b', 'c');
    store.getState().fix(new Set(['c']), labelOf, null);
    expect(store.getState().errorSummary.announcement).toBe('1 error left.');
  });

  it('plays All fixed in the pane when it is open, on the button when it is tucked', () => {
    const open = blocked('a');
    open.getState().fix(new Set(), labelOf, null);
    expect(open.getState().errorSummary).toMatchObject({
      done: 'pane',
      announcement: ALL_FIXED,
    });
    const tucked = blocked('a');
    tucked.getState().tuckPane();
    tucked.getState().fix(new Set(), labelOf, null);
    expect(tucked.getState().errorSummary.done).toBe('button');
  });

  it('clears the inline reveal when the last error goes', () => {
    const store = blocked('a');
    store.getState().attemptSave();
    store.getState().fix(new Set(), labelOf, null);
    expect(store.getState().saveAttempted).toBe(false);
  });

  it('goes idle when the All fixed ending ends', () => {
    const store = blocked('a');
    store.getState().fix(new Set(), labelOf, null);
    store.getState().endDone();
    expect(store.getState().errorSummary).toMatchObject({
      done: null,
      paneOpen: false,
      announcement: '',
    });
  });

  it('marks the row gone to and returns its address', () => {
    const store = blocked('a', 'b');
    const key = store.getState().errorSummary.blocked[1]?.key ?? '';
    expect(store.getState().goTo(key)).toBe('b');
    expect(store.getState().errorSummary.current).toBe(key);
    expect(store.getState().goTo('nope')).toBeUndefined();
  });

  it('remembers where the viewed row stood when its field is fixed', () => {
    const store = blocked('a', 'b', 'c');
    const key = store.getState().errorSummary.blocked[1]?.key ?? '';
    store.getState().goTo(key);
    store.getState().fix(new Set(['a', 'c']), labelOf, 1);
    expect(store.getState().errorSummary).toMatchObject({
      current: null,
      resumeAt: 1,
    });
  });

  it('keeps the key and the viewed row when a list item moves', () => {
    const store = blocked('items.2.a', 'items.0.a');
    const [moved] = store.getState().errorSummary.blocked;
    store.getState().goTo(moved?.key ?? '');
    store.getState().rekey('items', { move: [2, 1] });
    expect(store.getState().errorSummary.blocked[0]).toEqual({
      key: moved?.key,
      address: 'items.1.a',
    });
    expect(store.getState().errorSummary.current).toBe(moved?.key);
  });

  it('counts a field in a removed item as fixed on the next fix', () => {
    const store = blocked('items.1.a', 'items.2.a');
    store.getState().rekey('items', { remove: 1 });
    expect(addresses(store)).toEqual([`items.1.a${REMOVED}`, 'items.1.a']);
    store.getState().fix(new Set(['items.1.a']), labelOf, null);
    expect(addresses(store)).toEqual(['items.1.a']);
  });

  it('names no field when a removed item is the one that went', () => {
    const store = blocked('items.1.heading', 'x');
    store.getState().rekey('items', { remove: 1 });
    store.getState().fix(new Set(['x']), labelOf, null);
    expect(store.getState().errorSummary.announcement).toBe('1 error left.');
  });

  it('starts over when a Save blocks again during All fixed', () => {
    const store = blocked('a');
    store.getState().fix(new Set(), labelOf, null);
    store.getState().block(['b']);
    expect(store.getState().errorSummary).toMatchObject({
      done: null,
      current: null,
      paneOpen: true,
    });
    expect(store.getState().blockedSaves).toBe(2);
  });

  it('resets silently', () => {
    const store = blocked('a');
    store.getState().fix(new Set(), labelOf, null);
    store.getState().reset();
    expect(store.getState().errorSummary).toMatchObject({
      blocked: [],
      done: null,
      announcement: '',
    });
  });
});
