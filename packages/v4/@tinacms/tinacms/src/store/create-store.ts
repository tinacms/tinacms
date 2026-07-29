import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { invariant } from '../core/invariant';
import type { ResolvedSegment, SliceSet, TinaStoreState } from '../core/plugin';
import { composePluginSlices } from './compose-slices';

// The built-in namespaces of the store. They are empty for now. This increment delivers
// the registration mechanism and the middleware stack. It does not deliver the shapes of
// ui, branch, and documents. Those arrive later as core slices, composed at boot by
// createUiSlice, createBranchSlice, and createDocumentsSlice. Refer to
// store-architecture.md. These namespaces are core, and not plugins. isCoreNamespace
// reserves these keys, and the store rejects a plugin that mounts on one of them.
const CORE_NAMESPACES = ['ui', 'branch', 'documents'] as const;
type CoreNamespace = (typeof CORE_NAMESPACES)[number];

// The core namespaces that survive a reload. They hold the theme, the sidebar, and the
// branch selection. The type is a subset of CORE_NAMESPACES, so the two cannot drift.
// All other state is volatile, and the store computes it again at each boot. That state
// includes the document selection and every plugin namespace, such as the form values
// and the media lists. This is the one place that decides what persists. Refer to
// store-architecture.md and persistence.md.
//
// Note: the persist middleware does a shallow merge, which replaces a whole namespace
// at rehydration. That is correct while these namespaces hold plain data. A core slice
// that carries action functions needs a custom `merge`, so that rehydration keeps the
// composed slice.
//
// Note: persistence.md keeps the branch list and the dirty state volatile. Only the
// selection survives. Persistence of the whole namespace is correct while `branch` is
// empty. The real branch slice needs a partialize function for each key.
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

// The whole-store `set` that the middleware stack gives to the initializer. This code
// always calls it with replace set to false, so a patch to one namespace cannot remove
// its peers.
type RootSet = (
  updater: (store: TinaStoreState) => Partial<TinaStoreState>,
  replace: false,
  action?: string
) => void;

// Build the `set` for one slice, scoped to the namespace of that slice. The slice reads
// and updates its own state only. This function then writes the result under the
// namespace key, and merges it into the whole store. The peer namespaces do not change.
//
// The `replace` flag belongs to the slice. It replaces the state of the slice instead of
// a merge into it. This function does not pass the flag to the root set. The root set
// always merges the patch for one namespace, or it would drop every peer.
const createNamespacedSet =
  (namespace: string, setStore: RootSet): SliceSet =>
  (partial, replace = false, action) =>
    setStore(
      (store) => {
        const currentSliceState = store[namespace] ?? {};
        // SliceSet has the two forms of the Zustand set(): set(partial) and
        // set(current => partial). The second form reads the current slice state.
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

// The fixed names of the store. There is one store for each app boot (ADR-003), so one
// storage key and one devtools title are correct. They cannot collide.
const PERSIST_STORAGE_KEY = 'tina-store';
const DEVTOOLS_STORE_NAME = 'TinaStore';

// Compose the client store once at boot from the resolved plugin segments. It holds the
// core slices, and each plugin slice at its own namespace. The fixed middleware stack
// wraps them: devtools, and then persist. The plugin list is static, so the store has no
// extend function at runtime.
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
            // The `set as RootSet` cast narrows the wide middleware type of Zustand to
            // the merge-only root set. The slice itself receives the SliceSet type.
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
