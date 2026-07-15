import { describe, expect, it, vi } from 'vitest';
import { type Capability, definePlugin } from './plugin';
import { initializePlugins, validateCapabilityGraph } from './resolve';

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

  it('rejects mutual dependencies — no initialization order exists', () => {
    expect(() =>
      validateCapabilityGraph([
        plugin('a', { provides: ['media'], dependsOn: ['search'] }),
        plugin('b', { provides: ['search'], dependsOn: ['media'] }),
      ])
    ).toThrow(/capability-cycle.*"a", "b"/s);
  });

  it('accepts a self-satisfied dependency', () => {
    expect(() =>
      validateCapabilityGraph([
        plugin('solo', { provides: ['auth'], dependsOn: ['auth'] }),
      ])
    ).not.toThrow();
  });
});

describe('initializePlugins', () => {
  const lifecyclePlugin = (
    name: string,
    calls: string[],
    spec: { provides?: Capability[]; dependsOn?: Capability[] } = {}
  ) =>
    definePlugin({
      name,
      ...spec,
      onInit: async () => {
        calls.push(`init:${name}`);
      },
      onDestroy: async () => {
        calls.push(`destroy:${name}`);
      },
    });

  it('runs onInit in dependency order and tears down in reverse', async () => {
    const calls: string[] = [];
    const destroy = await initializePlugins([
      lifecyclePlugin('content', calls, {
        provides: ['content'],
        dependsOn: ['auth'],
      }),
      lifecyclePlugin('auth', calls, { provides: ['auth'] }),
    ]);
    expect(calls).toEqual(['init:auth', 'init:content']);
    await destroy();
    expect(calls).toEqual([
      'init:auth',
      'init:content',
      'destroy:content',
      'destroy:auth',
    ]);
  });

  it('keeps config order among independent plugins', async () => {
    const calls: string[] = [];
    await initializePlugins([
      lifecyclePlugin('b', calls),
      lifecyclePlugin('a', calls),
      lifecyclePlugin('c', calls),
    ]);
    expect(calls).toEqual(['init:b', 'init:a', 'init:c']);
  });

  it('tolerates plugins with no lifecycle hooks', async () => {
    const destroy = await initializePlugins([plugin('bare')]);
    await expect(destroy()).resolves.toBeUndefined();
  });

  it('a throwing onDestroy does not skip remaining teardowns, then rethrows', async () => {
    const calls: string[] = [];
    const destroy = await initializePlugins([
      lifecyclePlugin('auth', calls, { provides: ['auth'] }),
      definePlugin({
        name: 'volatile',
        dependsOn: ['auth'],
        onDestroy: () => {
          throw new Error('teardown failure');
        },
      }),
    ]);
    await expect(destroy()).rejects.toThrow('teardown failure');
    expect(calls).toContain('destroy:auth');
  });

  it('teardown is idempotent — a second call destroys nothing', async () => {
    const calls: string[] = [];
    const destroy = await initializePlugins([lifecyclePlugin('auth', calls)]);
    await destroy();
    await destroy();
    expect(calls.filter((call) => call === 'destroy:auth')).toHaveLength(1);
  });

  it('a failed onInit destroys the already-initialized plugins, then rethrows', async () => {
    const calls: string[] = [];
    const broken = definePlugin({
      name: 'broken',
      dependsOn: ['auth'],
      onInit: () => {
        throw new Error('boot failure');
      },
      onDestroy: vi.fn(async () => {
        calls.push('destroy:broken');
      }),
    });
    await expect(
      initializePlugins([
        lifecyclePlugin('auth', calls, { provides: ['auth'] }),
        broken,
      ])
    ).rejects.toThrow('boot failure');
    expect(calls).toEqual(['init:auth', 'destroy:auth']);
    expect(broken.onDestroy).not.toHaveBeenCalled();
  });
});
