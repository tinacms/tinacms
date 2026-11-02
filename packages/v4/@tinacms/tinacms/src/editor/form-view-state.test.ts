import { describe, expect, it } from 'vitest';
import type { FieldSchema } from '../core/schema/types';
import {
  countRevealedErrors,
  fieldsAlong,
  itemOpensNextLevel,
  levelDrillsIn,
  levelsFor,
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
