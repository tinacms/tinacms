import { describe, expect, it } from 'vitest';
import { TagsFieldPlugin } from './tags-field-plugin';

const validate = (value: any, required: boolean) => {
  const field = { name: 'tags', component: 'tags', required };
  return TagsFieldPlugin.validate(value, {}, {}, field);
};

describe('TagsFieldPlugin.validate', () => {
  it('flags a required field with no value', () => {
    expect(validate(undefined, true)).toBe('Required');
  });

  it('flags a required field with no tags', () => {
    expect(validate([], true)).toBe('Required');
  });

  it('accepts a required field with at least one tag', () => {
    expect(validate(['news'], true)).toBeUndefined();
  });

  it('accepts an optional field with no tags', () => {
    expect(validate([], false)).toBeUndefined();
  });
});
