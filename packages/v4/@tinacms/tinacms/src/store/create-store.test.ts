import { beforeEach, describe, expect, it } from 'vitest';
import {
  type Capability,
  type CapabilityOverride,
  type ClientSlice,
  type ResolvedSegment,
  definePlugin,
} from '../core/plugin';
import { composePluginSlices } from './compose-slices';
import { createTinaStore, pickPersistableNamespaces } from './create-store';

// The field registry resolves these from manifests at boot; the store composes the same
// { manifest, segment } shape, so tests build it inline.
const resolved = (
  spec: {
    name: string;
    provides?: Capability[];
    overrides?: CapabilityOverride[];
  },
  slice?: ClientSlice
): ResolvedSegment => ({
  manifest: definePlugin(spec),
  segment: { slice },
});

const get = (store: ReturnType<typeof createTinaStore>) =>
  store.getState() as Record<string, any>;

beforeEach(() => {
  // Each store persists under the same key — clear so one test's durable state never
  // rehydrates into the next.
  localStorage.clear();
});

describe('composePluginSlices namespacing', () => {
  it('mounts a singleton-capability slice at its capability key', () => {
    const registry = composePluginSlices([
      resolved({ name: 'tina:media:local', provides: ['media'] }, () => ({})),
    ]);
    expect([...registry.keys()]).toEqual(['media']);
  });

  it('mounts a content-capability slice at "content"', () => {
    const registry = composePluginSlices([
      resolved({ name: 'tina:content:git', provides: ['content'] }, () => ({})),
    ]);
    expect([...registry.keys()]).toEqual(['content']);
  });

  it('mounts a slice with no singleton capability under the plugin name', () => {
    const registry = composePluginSlices([
      resolved({ name: 'editorial-workflow' }, () => ({})),
    ]);
    expect([...registry.keys()]).toEqual(['editorial-workflow']);
  });

  it('skips segments with no slice (field plugins contribute none)', () => {
    const registry = composePluginSlices([
      resolved({ name: 'tina:field:string', provides: ['field'] }),
    ]);
    expect(registry.size).toBe(0);
  });
});

describe('composePluginSlices conflicts', () => {
  it('throws when two plugins claim the same singleton namespace', () => {
    expect(() =>
      composePluginSlices([
        resolved({ name: 'tina:media:local', provides: ['media'] }, () => ({})),
        resolved({ name: 'tina:media:s3', provides: ['media'] }, () => ({})),
      ])
    ).toThrow(/store slice at "media"/);
  });

  it('lets a later plugin replace a singleton when it declares an override', () => {
    const registry = composePluginSlices([
      resolved({ name: 'tina:media:local', provides: ['media'] }, () => ({
        from: 'local',
      })),
      resolved(
        {
          name: 'tina:media:s3',
          provides: ['media'],
          overrides: [{ capability: 'media' }],
        },
        () => ({ from: 's3' })
      ),
    ]);
    expect(registry.size).toBe(1);
    expect(
      registry.get('media')?.(
        () => {},
        () => ({})
      )
    ).toEqual({
      from: 's3',
    });
  });

  it('an override wins regardless of resolution order', () => {
    const base = resolved(
      { name: 'tina:media:local', provides: ['media'] },
      () => ({
        from: 'local',
      })
    );
    const override = resolved(
      {
        name: 'tina:media:s3',
        provides: ['media'],
        overrides: [{ capability: 'media' }],
      },
      () => ({ from: 's3' })
    );
    const winner = (registry: ReturnType<typeof composePluginSlices>) =>
      (
        registry.get('media')?.(
          () => {},
          () => ({})
        ) as any
      )?.from;

    // base-first and override-first both resolve to the override.
    expect(winner(composePluginSlices([base, override]))).toBe('s3');
    expect(winner(composePluginSlices([override, base]))).toBe('s3');
  });

  it('throws when two plugins both declare an override for the same capability', () => {
    const overrideFor = (name: string, from: string) =>
      resolved(
        {
          name,
          provides: ['media'],
          overrides: [{ capability: 'media' }],
        },
        () => ({ from })
      );
    expect(() =>
      composePluginSlices([overrideFor('a', 'a'), overrideFor('b', 'b')])
    ).toThrow(/both declare an/);
  });
});

describe('createTinaStore composition', () => {
  it('exposes the core namespaces plus each plugin namespace', () => {
    const store = createTinaStore([
      resolved({ name: 'tina:auth', provides: ['auth'] }, () => ({
        user: null,
      })),
    ]);
    expect(Object.keys(get(store)).sort()).toEqual([
      'auth',
      'branch',
      'documents',
      'ui',
    ]);
  });

  it('scopes a slice write to its namespace and reads peers through the whole-store get', () => {
    const authSlice: ClientSlice = () => ({ user: { id: 'u1' } });
    const mediaSlice: ClientSlice = (set, get) => ({
      items: [] as string[],
      uploaderId: () => (get() as any).auth.user.id,
      add: (item: string) =>
        set((slice: any) => ({ items: [...slice.items, item] })),
    });

    const store = createTinaStore([
      resolved({ name: 'tina:auth', provides: ['auth'] }, authSlice),
      resolved({ name: 'tina:media', provides: ['media'] }, mediaSlice),
    ]);

    get(store).media.add('hero.png');

    expect(get(store).media.items).toEqual(['hero.png']);
    // a scoped write never leaks to the top level …
    expect(get(store).items).toBeUndefined();
    // … and a peer read resolves through the namespace.
    expect(get(store).media.uploaderId()).toBe('u1');
  });

  it('a slice replace swaps only its own namespace, never the whole store', () => {
    const authSlice: ClientSlice = () => ({ user: { id: 'u1' } });
    const mediaSlice: ClientSlice = (set) => ({
      items: ['a', 'b'],
      // replace=true → replace this slice's own state, not merge.
      reset: () => set({ items: [] }, true),
    });

    const store = createTinaStore([
      resolved({ name: 'tina:auth', provides: ['auth'] }, authSlice),
      resolved({ name: 'tina:media', provides: ['media'] }, mediaSlice),
    ]);

    get(store).media.reset();

    // the slice was replaced (reset method dropped) …
    expect(get(store).media).toEqual({ items: [] });
    // … but peers and core namespaces survive — no whole-store wipe.
    expect(get(store).auth.user.id).toBe('u1');
    expect(get(store).ui).toEqual({});
  });

  it('rejects a plugin slice that collides with a core namespace', () => {
    expect(() =>
      createTinaStore([resolved({ name: 'ui' }, () => ({ theme: 'x' }))])
    ).toThrow(/reserved core store namespace/);
  });
});

describe('pickPersistableNamespaces', () => {
  it('keeps the durable namespaces and drops volatile ones', () => {
    expect(
      pickPersistableNamespaces({
        ui: { theme: 'dark' },
        branch: { current: 'main' },
        media: { items: [1, 2] },
        documents: { selected: 'posts/a.mdx' },
      })
    ).toEqual({ ui: { theme: 'dark' }, branch: { current: 'main' } });
  });
});

describe('createTinaStore persistence round-trip', () => {
  const boot = () =>
    createTinaStore([
      resolved({ name: 'tina:media', provides: ['media'] }, () => ({
        items: [],
      })),
    ]);

  it('rehydrates durable namespaces and recomputes volatile ones on reboot', () => {
    boot().setState({
      ui: { theme: 'dark' },
      branch: { current: 'feat' },
      documents: { selected: 'posts/a.mdx' },
      media: { items: ['stale'] },
    } as any);

    // A fresh boot reads the persisted storage written above.
    const rebooted = get(boot());
    expect(rebooted.ui).toEqual({ theme: 'dark' });
    expect(rebooted.branch).toEqual({ current: 'feat' });
    // documents + every plugin namespace are volatile: recomputed at boot, not rehydrated.
    expect(rebooted.documents).toEqual({});
    expect(rebooted.media).toEqual({ items: [] });
  });
});
