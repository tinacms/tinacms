import { describe, expect, it } from 'vitest';
import { type Capability, definePlugin } from './plugin';
import { resolveCapabilityGraph } from './resolve';

const plugin = (
  name: string,
  spec: {
    provides?: Capability[];
    dependsOn?: Capability[];
    overrides?: { capability: Exclude<Capability, 'field'> }[];
  } = {}
) => definePlugin({ name, ...spec });

const orderOf = (plugins: ReturnType<typeof plugin>[]) =>
  resolveCapabilityGraph(plugins).map((manifest) => manifest.name);

describe('resolveCapabilityGraph', () => {
  it('orders providers before their dependents', () => {
    const search = plugin('local-search', {
      provides: ['search'],
      dependsOn: ['content', 'auth'],
    });
    const auth = plugin('local-auth', { provides: ['auth'] });
    const content = plugin('local-content', {
      provides: ['content'],
      dependsOn: ['auth'],
    });
    const ordered = orderOf([search, content, auth]);
    expect(ordered.indexOf('local-auth')).toBeLessThan(
      ordered.indexOf('local-content')
    );
    expect(ordered.indexOf('local-content')).toBeLessThan(
      ordered.indexOf('local-search')
    );
  });

  it('keeps input order among independent plugins', () => {
    expect(orderOf([plugin('a'), plugin('b'), plugin('c')])).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('allows many field providers — field is the keyed capability', () => {
    expect(() =>
      resolveCapabilityGraph([
        plugin('tina:field:string', { provides: ['field'] }),
        plugin('tina:field:boolean', { provides: ['field'] }),
      ])
    ).not.toThrow();
  });

  it('rejects two providers of a singleton capability', () => {
    expect(() =>
      resolveCapabilityGraph([
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
    expect(() => resolveCapabilityGraph([base, override])).not.toThrow();
    expect(() => resolveCapabilityGraph([override, base])).not.toThrow();
  });

  it('rejects two overrides of one capability', () => {
    expect(() =>
      resolveCapabilityGraph([
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
      resolveCapabilityGraph([plugin('needs-auth', { dependsOn: ['auth'] })])
    ).toThrow(/capability-no-provider/);
  });

  it('rejects duplicate plugin names', () => {
    expect(() =>
      resolveCapabilityGraph([plugin('twin'), plugin('twin')])
    ).toThrow(/plugin-duplicate-name/);
  });

  it('rejects capability cycles and names the participants', () => {
    expect(() =>
      resolveCapabilityGraph([
        plugin('a', { provides: ['media'], dependsOn: ['search'] }),
        plugin('b', { provides: ['search'], dependsOn: ['media'] }),
      ])
    ).toThrow(/capability-cycle/);
  });

  it('ignores a self-satisfied dependency', () => {
    expect(() =>
      resolveCapabilityGraph([
        plugin('solo', { provides: ['auth'], dependsOn: ['auth'] }),
      ])
    ).not.toThrow();
  });
});
