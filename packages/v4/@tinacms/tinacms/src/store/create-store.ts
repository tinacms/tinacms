import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { invariant } from '../core/invariant';
import type { ResolvedSegment } from '../core/plugin';
import { composePluginSlices } from './compose-slices';
import type { SliceSet, TinaStoreState } from './slice';

// The store's built-in namespaces. Intentionally empty stubs for now — this increment
// delivers the registration mechanism + middleware stack, not the ui/branch/documents
// shapes (those land with their own slices later).
const CORE_NAMESPACES = ['ui', 'branch', 'documents'] as const;
type CoreNamespace = (typeof CORE_NAMESPACES)[number];

// Which core namespaces survive a reload (theme, sidebar, branch selection) — a typed subset
// of CORE_NAMESPACES, so the two can't drift. Everything else (document selection, and every
// plugin namespace: form values, media listings) is volatile and recomputed on boot. This is
// the one place persistence is decided (store-architecture.md, persistence.md).
//
// NB: persist's default shallow merge replaces a whole namespace on rehydrate — fine while
// these are plain data, but once a core slice carries action functions it needs a custom
// `merge` so rehydration doesn't clobber the freshly-composed slice.
const PERSISTED_NAMESPACES: readonly CoreNamespace[] = ['ui', 'branch'];

export const pickPersistableNamespaces = (
  state: TinaStoreState
): Partial<TinaStoreState> => {
  const durable: Partial<TinaStoreState> = {};
  for (const namespace of PERSISTED_NAMESPACES) {
    if (namespace in state) durable[namespace] = state[namespace];
  }
  return durable;
};

const createCoreSlices = (): TinaStoreState =>
  Object.fromEntries(CORE_NAMESPACES.map((namespace) => [namespace, {}]));

// The whole-store `set` the middleware stack hands the initializer. We only ever drive it
// with a merge (replace=false) so a one-namespace patch can't clobber peer namespaces.
type RootSet = (
  updater: (store: TinaStoreState) => Partial<TinaStoreState>,
  replace: false,
  action?: string
) => void;

// Build the `set` a slice gets, scoped to its `namespace`. The slice reads and updates only
// its own state; that result is then written back under the namespace key and merged into
// the whole store, so peer namespaces are untouched.
//
// `replace` is the slice-level flag (swap the slice's own state instead of merging into
// it). It is deliberately NOT forwarded to the root set — the root set always merges this
// single-namespace patch, or it would drop every peer.
const createNamespacedSet =
  (namespace: string, setStore: RootSet): SliceSet =>
  (partial, replace = false, action) =>
    setStore(
      (store) => {
        const currentSliceState = store[namespace] ?? {};
        const nextSliceState =
          typeof partial === 'function' ? partial(currentSliceState) : partial;
        return {
          [namespace]: replace
            ? nextSliceState
            : { ...currentSliceState, ...nextSliceState },
        };
      },
      false,
      action
    );

const isCoreNamespace = (namespace: string): namespace is CoreNamespace =>
  (CORE_NAMESPACES as readonly string[]).includes(namespace);

// The store's fixed identities: one store per app boot (ADR-003), so a single persist
// storage key and devtools title are intentional, not a collision risk.
const PERSIST_STORAGE_KEY = 'tina-store';
const DEVTOOLS_STORE_NAME = 'TinaStore';

// Compose the client store once at boot from the resolved plugin segments: core slices
// plus each plugin slice mounted at its namespace, wrapped in the fixed middleware stack
// (devtools → persist). The plugin list is static, so there is no runtime extend.
export const createTinaStore = (resolved: ResolvedSegment[]) => {
  const pluginSlices = composePluginSlices(resolved);
  return create<TinaStoreState>()(
    devtools(
      persist(
        (set, get) => {
          const state: TinaStoreState = createCoreSlices();
          for (const [namespace, slice] of pluginSlices) {
            invariant(
              !isCoreNamespace(namespace),
              'store-namespace-reserved',
              `A plugin slice mounts at "${namespace}", which is a reserved core ` +
                `store namespace (${CORE_NAMESPACES.join('/')}). Rename the plugin ` +
                'or the capability it provides.'
            );
            // `set as RootSet` bridges Zustand's broad middleware set type to the merge-only
            // root set createNamespacedSet drives; the slice itself gets the clean SliceSet.
            const scopedSet = createNamespacedSet(namespace, set as RootSet);
            state[namespace] = slice(scopedSet, get);
          }
          return state;
        },
        { name: PERSIST_STORAGE_KEY, partialize: pickPersistableNamespaces }
      ),
      { name: DEVTOOLS_STORE_NAME }
    )
  );
};
