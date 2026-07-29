import { describe, expect, it } from 'vitest';
import { composeOverridableRegistry } from './overridable-registry';

// A conflict factory that writes the kind and the key, so a test can assert which
// conflict happened.
const conflict = (kind: string, key: string) => new Error(`${kind}:${key}`);

const base = (key: string, value: string) => ({
  key,
  value,
  isOverride: false,
});
const override = (key: string, value: string) => ({
  key,
  value,
  isOverride: true,
});

describe('composeOverridableRegistry', () => {
  it('registers each key once', () => {
    const registry = composeOverridableRegistry(
      [base('a', 'A'), base('b', 'B')],
      conflict
    );
    expect([...registry]).toEqual([
      ['a', 'A'],
      ['b', 'B'],
    ]);
  });

  it('an override wins its key regardless of order', () => {
    expect(
      composeOverridableRegistry(
        [base('a', 'base'), override('a', 'over')],
        conflict
      ).get('a')
    ).toBe('over');
    expect(
      composeOverridableRegistry(
        [override('a', 'over'), base('a', 'base')],
        conflict
      ).get('a')
    ).toBe('over');
  });

  it('throws duplicate-base when two bases collide', () => {
    expect(() =>
      composeOverridableRegistry([base('a', '1'), base('a', '2')], conflict)
    ).toThrow('duplicate-base:a');
  });

  it('an override does not mask a base-vs-base collision', () => {
    // Two plugins both provide a base at "a", and a third one overrides it. The
    // override wins its key, and it must not hide the collision between the two bases.
    expect(() =>
      composeOverridableRegistry(
        [base('a', '1'), override('a', 'over'), base('a', '2')],
        conflict
      )
    ).toThrow('duplicate-base:a');
    expect(() =>
      composeOverridableRegistry(
        [override('a', 'over'), base('a', '1'), base('a', '2')],
        conflict
      )
    ).toThrow('duplicate-base:a');
  });

  it('throws duplicate-override when two overrides collide', () => {
    expect(() =>
      composeOverridableRegistry(
        [override('a', '1'), override('a', '2')],
        conflict
      )
    ).toThrow('duplicate-override:a');
  });
});
