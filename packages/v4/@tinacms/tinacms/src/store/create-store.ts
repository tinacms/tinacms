import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SITE_TOKEN_FLAG } from '../core/auth/slice';
import { invariant } from '../core/invariant';
import { capabilityProvider } from '../core/mount';
import {
  AUTH_CAPABILITY,
  type ResolvedSegment,
  type SliceState,
  type SliceSet,
  type TinaStoreState,
} from '../core/plugin';
import { composePluginSlices } from './compose-slices';

const CORE_NAMESPACES = ['ui', 'branch', 'documents'] as const;
type CoreNamespace = (typeof CORE_NAMESPACES)[number];

const PERSISTED_NAMESPACES: readonly CoreNamespace[] = ['ui', 'branch'];

// Only `current` survives a reload. `switchTo` is a function and `list` goes
// stale, so the content provider rebuilds both.
const durableBranch = (branch: SliceState): SliceState =>
  typeof branch.current === 'string' ? { current: branch.current } : {};

export const pickPersistableNamespaces = (
  state: TinaStoreState
): Partial<TinaStoreState> => {
  const durable: Partial<TinaStoreState> = {};
  for (const namespace of PERSISTED_NAMESPACES) {
    if (namespace in state) durable[namespace] = state[namespace];
  }
  if (state.branch) durable.branch = durableBranch(state.branch);
  return durable;
};

const createCoreSlices = (): TinaStoreState =>
  Object.fromEntries(CORE_NAMESPACES.map((namespace) => [namespace, {}]));

type RootSet = (
  updater: (store: TinaStoreState) => Partial<TinaStoreState>,
  replace: false,
  action?: string
) => void;

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

const PERSIST_STORAGE_KEY = 'tina-store';
const DEVTOOLS_STORE_NAME = 'TinaStore';

export const createTinaStore = (resolved: ResolvedSegment[]) => {
  const pluginSlices = composePluginSlices(resolved);
  const sendsTokenToSite = Boolean(
    capabilityProvider(
      resolved.map(({ manifest }) => manifest),
      AUTH_CAPABILITY
    )?.server
  );
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
            const scopedSet = createNamespacedSet(namespace, set as RootSet);
            state[namespace] = slice(scopedSet, get);
          }
          state.branch = {
            list: [],
            protected: [],
            switchTo: (name) =>
              (set as RootSet)(
                (store) => ({ branch: { ...store.branch, current: name } }),
                false,
                'branch/switchTo'
              ),
          };
          if (state.auth) {
            state.auth = { ...state.auth, [SITE_TOKEN_FLAG]: sendsTokenToSite };
          }
          return state;
        },
        {
          name: PERSIST_STORAGE_KEY,
          partialize: pickPersistableNamespaces,
          merge: (persisted, current) => {
            const stored = (persisted ?? {}) as Partial<TinaStoreState>;
            return {
              ...current,
              ...stored,
              branch: { ...current.branch, ...stored.branch },
            };
          },
        }
      ),
      { name: DEVTOOLS_STORE_NAME }
    )
  );
};
