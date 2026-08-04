import { describe, expect, it } from 'vitest';
import { toFieldAddress } from '../field/address';
import type { FieldDescriptor } from '../field/contract';
import type { FieldRegistry } from '../field/registry';
import type { FieldSchema } from '../schema/types';
import { fieldEqualityFor } from './compare';

const title = toFieldAddress('title');
const body = toFieldAddress('body');

const fields: FieldSchema[] = [
  { name: 'title', type: 'string' },
  { name: 'body', type: 'rich-text' },
];

const sourceOnly: FieldDescriptor = {
  Component: () => null,
  isEqual: (a, b) =>
    (a as { source: string }).source === (b as { source: string }).source,
};

const registryWith = (descriptors: Record<string, FieldDescriptor>) =>
  new Map(Object.entries(descriptors)) as FieldRegistry;

describe('fieldEqualityFor', () => {
  it('asks the descriptor of the field that declares one', () => {
    const equal = fieldEqualityFor(
      fields,
      registryWith({ 'rich-text': sourceOnly })
    );
    expect(
      equal(body, { source: 'Prose.', editorOnly: 1 }, { source: 'Prose.' })
    ).toBe(true);
    expect(equal(body, { source: 'Prose.' }, { source: 'Edited.' })).toBe(
      false
    );
  });

  it('compares every other field as structure', () => {
    const equal = fieldEqualityFor(
      fields,
      registryWith({ 'rich-text': sourceOnly })
    );
    expect(equal(title, 'Hello', 'Hello')).toBe(true);
    expect(equal(title, 'Hello', 'Goodbye')).toBe(false);
    expect(equal(title, { source: 'x', editorOnly: 1 }, { source: 'x' })).toBe(
      false
    );
  });

  it('compares as structure when no field declares an equality', () => {
    const equal = fieldEqualityFor(fields, registryWith({}));
    expect(equal(body, { source: 'Prose.' }, { source: 'Prose.' })).toBe(true);
    expect(
      equal(body, { source: 'Prose.', editorOnly: 1 }, { source: 'Prose.' })
    ).toBe(false);
  });

  it('answers an address that belongs to no field', () => {
    const unknown = toFieldAddress('unknown');
    const equal = fieldEqualityFor(
      fields,
      registryWith({ 'rich-text': sourceOnly })
    );
    expect(equal(unknown, 'same', 'same')).toBe(true);
    expect(equal(unknown, 'same', 'other')).toBe(false);
  });
});
