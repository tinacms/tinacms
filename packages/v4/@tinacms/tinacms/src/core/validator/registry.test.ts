import { describe, expect, it } from 'vitest';
import type { ValidatorFactory } from '../field/contract';
import {
  type CapabilityOverride,
  type ResolvedSegment,
  definePlugin,
} from '../plugin';
import { isEmptyValue, measureValue } from '../validation';
import { createValidatorRegistry } from './registry';

const factoryOf =
  (tag: string): ValidatorFactory =>
  () =>
  () =>
    tag;

const resolved = (
  spec: {
    name: string;
    validators?: string[];
    overrides?: CapabilityOverride[];
  },
  factories?: Record<string, ValidatorFactory>
): ResolvedSegment => ({
  manifest: definePlugin({
    name: spec.name,
    provides: ['validator'],
    validators: spec.validators,
    overrides: spec.overrides,
  }),
  segment: { validators: factories },
});

const tagOf = (
  registry: ReturnType<typeof createValidatorRegistry>,
  name: string
) =>
  registry.get(name)?.()(null, {
    node: { name: 'x', type: 'string' },
    address: 'x',
    siblings: {},
    values: {},
    isEmpty: isEmptyValue,
    measure: measureValue,
  });

describe('createValidatorRegistry', () => {
  it('registers each factory under the name its manifest declares', () => {
    const registry = createValidatorRegistry([
      resolved(
        { name: 'acme:validators', validators: ['after', 'matches'] },
        {
          after: factoryOf('after'),
          matches: factoryOf('matches'),
        }
      ),
    ]);
    expect([...registry.keys()]).toEqual(['after', 'matches']);
    expect(tagOf(registry, 'after')).toBe('after');
  });

  it('skips segments that contribute no validators', () => {
    const registry = createValidatorRegistry([
      resolved({ name: 'editorial-workflow' }),
    ]);
    expect(registry.size).toBe(0);
  });

  it('throws when a manifest declares a name its segment has no factory for', () => {
    expect(() =>
      createValidatorRegistry([
        resolved({ name: 'acme:validators', validators: ['after'] }, {}),
      ])
    ).toThrow(/no factory for "after"/);
  });

  it('throws when a segment exports a factory its manifest does not declare', () => {
    expect(() =>
      createValidatorRegistry([
        resolved(
          { name: 'acme:validators', validators: [] },
          {
            after: factoryOf('after'),
          }
        ),
      ])
    ).toThrow(/does not declare "after"/);
  });

  it('throws when two plugins register the same name', () => {
    expect(() =>
      createValidatorRegistry([
        resolved(
          { name: 'a', validators: ['after'] },
          { after: factoryOf('a') }
        ),
        resolved(
          { name: 'b', validators: ['after'] },
          { after: factoryOf('b') }
        ),
      ])
    ).toThrow(/Two plugins both register the validator "after"/);
  });

  it('lets an explicit override replace a validator', () => {
    const registry = createValidatorRegistry([
      resolved({ name: 'a', validators: ['after'] }, { after: factoryOf('a') }),
      resolved(
        {
          name: 'b',
          validators: ['after'],
          overrides: [{ capability: 'validator', key: 'after' }],
        },
        { after: factoryOf('b') }
      ),
    ]);
    expect(tagOf(registry, 'after')).toBe('b');
  });
});
