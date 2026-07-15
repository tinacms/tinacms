import { describe, expect, it } from 'vitest';
import { type Capability, definePlugin } from './plugin';
import { validateCapabilityGraph } from './resolve';

const plugin = (
  name: string,
  spec: {
    provides?: Capability[];
    dependsOn?: Capability[];
    overrides?: { capability: Exclude<Capability, 'field'> }[];
  } = {}
) => definePlugin({ name, ...spec });

describe('validateCapabilityGraph', () => {
  it('accepts a config whose dependencies are all provided', () => {
    expect(() =>
      validateCapabilityGraph([
        plugin('local-auth', { provides: ['auth'] }),
        plugin('local-content', { provides: ['content'], dependsOn: ['auth'] }),
        plugin('local-search', {
          provides: ['search'],
          dependsOn: ['content', 'auth'],
        }),
      ])
    ).not.toThrow();
  });

  it('allows many field providers — field is the keyed capability', () => {
    expect(() =>
      validateCapabilityGraph([
        plugin('tina:field:string', { provides: ['field'] }),
        plugin('tina:field:boolean', { provides: ['field'] }),
      ])
    ).not.toThrow();
  });

  it('rejects two providers of a singleton capability', () => {
    expect(() =>
      validateCapabilityGraph([
        plugin('s3-media', { provides: ['media'] }),
        plugin('cloudinary-media', { provides: ['media'] }),
      ])
    ).toThrow(/provide the "media" capability/);
  });

  it('lets an explicit override replace a provider, in either order', () => {
    const base = plugin('tina-cloud-media', { provides: ['media'] });
    const override = plugin('s3-media', {
      provides: ['media'],
      overrides: [{ capability: 'media' }],
    });
    expect(() => validateCapabilityGraph([base, override])).not.toThrow();
    expect(() => validateCapabilityGraph([override, base])).not.toThrow();
  });

  it('rejects two overrides of one capability', () => {
    expect(() =>
      validateCapabilityGraph([
        plugin('a', {
          provides: ['media'],
          overrides: [{ capability: 'media' }],
        }),
        plugin('b', {
          provides: ['media'],
          overrides: [{ capability: 'media' }],
        }),
      ])
    ).toThrow(/both declare an `overrides`/);
  });

  it('rejects a dependency no plugin provides', () => {
    expect(() =>
      validateCapabilityGraph([plugin('needs-auth', { dependsOn: ['auth'] })])
    ).toThrow(/capability-no-provider/);
  });

  it('rejects duplicate plugin names', () => {
    expect(() =>
      validateCapabilityGraph([plugin('twin'), plugin('twin')])
    ).toThrow(/plugin-duplicate-name/);
  });

  it('accepts mutual dependencies — ordering is not computed until onInit lands', () => {
    expect(() =>
      validateCapabilityGraph([
        plugin('a', { provides: ['media'], dependsOn: ['search'] }),
        plugin('b', { provides: ['search'], dependsOn: ['media'] }),
      ])
    ).not.toThrow();
  });

  it('accepts a self-satisfied dependency', () => {
    expect(() =>
      validateCapabilityGraph([
        plugin('solo', { provides: ['auth'], dependsOn: ['auth'] }),
      ])
    ).not.toThrow();
  });
});
