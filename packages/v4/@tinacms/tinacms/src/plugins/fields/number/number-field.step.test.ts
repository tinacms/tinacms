import { describe, expect, it } from 'vitest';
import { max, min } from '../../../plugins/fields';
import { limitOf, stepValue } from './number-field.step';

describe('limitOf', () => {
  it('reads the limit from the real min and max validators', () => {
    const node = { validators: [min(1), max(5)] };
    expect(limitOf(node, 'min')).toBe(1);
    expect(limitOf(node, 'max')).toBe(5);
    expect(limitOf({}, 'max')).toBeUndefined();
  });
});

describe('stepValue', () => {
  const none = {};
  it.each([
    ['3', 'up', 1, none, '4'],
    ['3', 'down', 1, none, '2'],
    ['3', 'up', 0.5, none, '3.5'],
    ['2.5', 'up', undefined, none, '3.5'],
    ['0.1', 'up', 0.2, none, '0.3'],
    ['1.25', 'up', 0.5, none, '1.75'],
    ['1e-7', 'up', 1, none, '1.0000001'],
    ['4.5', 'up', 1, { max: 5 }, '5'],
    ['1.5', 'down', 1, { min: 1 }, '1'],
    ['0', 'down', 1, none, '-1'],
    ['1', 'down', 1, none, '0'],
    ['-0.5', 'up', 0.5, none, '0'],
    ['', 'up', 1, { min: 2 }, '2'],
    [null, 'up', 3, none, '3'],
    [null, 'down', 3, { max: 9 }, '9'],
    [null, 'down', 3, none, '-3'],
    ['', 'up', 3, { max: 1 }, '1'],
    [null, 'down', 3, { min: 0 }, '0'],
    ['abc', 'up', 1, none, '1'],
    ['1e999', 'up', 1, none, '1'],
    ['7', 'down', 1, { max: 5 }, '5'],
    ['7', 'up', 1, { max: 5 }, null],
    ['1', 'down', 1, { min: 1 }, null],
    ['3', 'up', -2, none, '4'],
    ['3', 'up', Number.NaN, none, '4'],
  ] as const)(
    '%s %s by %s with %j gives %s',
    (raw, direction, step, limits, expected) => {
      expect(stepValue(raw, direction, step, limits)).toBe(expected);
    }
  );
});
