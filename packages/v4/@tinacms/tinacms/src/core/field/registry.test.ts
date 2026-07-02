import { describe, expect, it } from 'vitest';
import {
  type CapabilityOverride,
  type ResolvedSegment,
  definePlugin,
} from '../plugin';
import type { FieldDescriptor } from './contract';
import { createFieldRegistry } from './registry';

const Noop = () => null;

// A minimal field descriptor tagged via defaultValue so a test can tell which one won.
const fieldOf = (type: string, tag: string): FieldDescriptor => ({
  type,
  Component: Noop,
  defaultValue: tag,
});

const resolved = (
  spec: { name: string; overrides?: CapabilityOverride[] },
  field?: FieldDescriptor
): ResolvedSegment => ({
  manifest: definePlugin({
    name: spec.name,
    provides: ['field'],
    overrides: spec.overrides,
  }),
  segment: { field },
});

const winnerTag = (registry: ReturnType<typeof createFieldRegistry>) =>
  registry.get('string')?.defaultValue;

describe('createFieldRegistry', () => {
  it('registers a field descriptor at its type', () => {
    const registry = createFieldRegistry([
      resolved({ name: 'tina:field:string' }, fieldOf('string', 'base')),
    ]);
    expect([...registry.keys()]).toEqual(['string']);
    expect(winnerTag(registry)).toBe('base');
  });

  it('skips segments that contribute no field', () => {
    const registry = createFieldRegistry([
      resolved({ name: 'editorial-workflow' }),
    ]);
    expect(registry.size).toBe(0);
  });

  it('throws when two plugins provide the same field type', () => {
    expect(() =>
      createFieldRegistry([
        resolved({ name: 'tina:field:string' }, fieldOf('string', 'a')),
        resolved({ name: 'other:string' }, fieldOf('string', 'b')),
      ])
    ).toThrow(/capability at type "string"/);
  });

  it('an override wins regardless of resolution order', () => {
    const base = resolved(
      { name: 'tina:field:string' },
      fieldOf('string', 'base')
    );
    const override = resolved(
      {
        name: 'custom:string',
        overrides: [{ capability: 'field', key: 'string' }],
      },
      fieldOf('string', 'custom')
    );

    // base-first and override-first both resolve to the override.
    expect(winnerTag(createFieldRegistry([base, override]))).toBe('custom');
    expect(winnerTag(createFieldRegistry([override, base]))).toBe('custom');
  });

  it('throws when two plugins both declare an override for the same field type', () => {
    const overrideFor = (name: string, tag: string) =>
      resolved(
        { name, overrides: [{ capability: 'field', key: 'string' }] },
        fieldOf('string', tag)
      );
    expect(() =>
      createFieldRegistry([overrideFor('a', 'a'), overrideFor('b', 'b')])
    ).toThrow(/both declare an/);
  });
});
