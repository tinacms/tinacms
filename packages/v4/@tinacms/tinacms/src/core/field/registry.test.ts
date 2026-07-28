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
const fieldOf = (tag: string): FieldDescriptor => ({
  Component: Noop,
  defaultValue: tag,
});

// `type` on the manifest, descriptor on the segment — the shape a real field plugin
// splits across its .plugin.ts and .client.tsx.
const resolved = (
  spec: { name: string; type?: string; overrides?: CapabilityOverride[] },
  field?: FieldDescriptor
): ResolvedSegment => ({
  manifest: definePlugin({
    name: spec.name,
    provides: ['field'],
    field: spec.type ? { type: spec.type, contractVersion: 1 } : undefined,
    overrides: spec.overrides,
  }),
  segment: { field },
});

const winnerTag = (registry: ReturnType<typeof createFieldRegistry>) =>
  registry.get('string')?.defaultValue;

describe('createFieldRegistry', () => {
  it('registers a field descriptor at the type its manifest declares', () => {
    const registry = createFieldRegistry([
      resolved({ name: 'tina:field:string', type: 'string' }, fieldOf('base')),
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

  // Either half alone is an authoring slip; caught at boot rather than as an
  // unresolvable field type at render.
  it('throws when a manifest declares a field type with no descriptor', () => {
    expect(() =>
      createFieldRegistry([resolved({ name: 'custom:string', type: 'string' })])
    ).toThrow(/exports no field descriptor/);
  });

  it('throws when a descriptor arrives with no declared field type', () => {
    expect(() =>
      createFieldRegistry([resolved({ name: 'custom:string' }, fieldOf('a'))])
    ).toThrow(/declares no `field:/);
  });

  it('throws when two plugins provide the same field type', () => {
    expect(() =>
      createFieldRegistry([
        resolved({ name: 'tina:field:string', type: 'string' }, fieldOf('a')),
        resolved({ name: 'other:string', type: 'string' }, fieldOf('b')),
      ])
    ).toThrow(/capability at type "string"/);
  });

  it('an override wins regardless of resolution order', () => {
    const base = resolved(
      { name: 'tina:field:string', type: 'string' },
      fieldOf('base')
    );
    const override = resolved(
      {
        name: 'custom:string',
        type: 'string',
        overrides: [{ capability: 'field', key: 'string' }],
      },
      fieldOf('custom')
    );

    // base-first and override-first both resolve to the override.
    expect(winnerTag(createFieldRegistry([base, override]))).toBe('custom');
    expect(winnerTag(createFieldRegistry([override, base]))).toBe('custom');
  });

  it('throws when two plugins both declare an override for the same field type', () => {
    const overrideFor = (name: string, tag: string) =>
      resolved(
        {
          name,
          type: 'string',
          overrides: [{ capability: 'field', key: 'string' }],
        },
        fieldOf(tag)
      );
    expect(() =>
      createFieldRegistry([overrideFor('a', 'a'), overrideFor('b', 'b')])
    ).toThrow(/both declare an/);
  });
});
