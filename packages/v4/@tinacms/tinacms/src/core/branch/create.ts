import type { StoreApi } from 'zustand';
import type { TinaStoreState } from '../plugin';
import {
  type BranchSource,
  type BranchSlice,
  branchSliceOf,
  currentBranchOf,
} from './contract';

type Creatable = BranchSource & Required<Pick<BranchSource, 'create'>>;

/** True when a provider error carries `key: value`, like `status` or the `maybeMade` hint. */
const carries = (cause: unknown, key: string, value: unknown): boolean =>
  typeof cause === 'object' &&
  cause !== null &&
  key in cause &&
  Object.getOwnPropertyDescriptor(cause, key)?.value === value;

let clock = 0;

/** Orders list reads against creates: a later value happened later. */
export const tickClock = (): number => {
  clock += 1;
  return clock;
};

/** Branch name to when its create settled, or null while it is still being made. */
const madeByStore = new WeakMap<
  StoreApi<TinaStoreState>,
  Map<string, number | null>
>();

/**
 * Branches this page session made. A list read that started before the provider knew of them
 * can resolve without them, so the list sync puts them back. A read that started after the
 * create settled is the provider's answer: `forgetMadeBranches` drops the ones it omits.
 */
export const madeBranchesOf = (
  store: StoreApi<TinaStoreState>
): { name: string; settledAt: number | null }[] =>
  [...(madeByStore.get(store) ?? [])].map(([name, settledAt]) => ({
    name,
    settledAt,
  }));

export const forgetMadeBranches = (
  store: StoreApi<TinaStoreState>,
  names: string[]
): void => {
  const made = madeByStore.get(store);
  for (const name of names) made?.delete(name);
};

/**
 * The `branch.create` slice action: makes the branch through the provider and records
 * `creating` and `createResult`. It knows nothing about the pop-up; the shell reads the result.
 * One create at a time.
 */
export const createBranchAction =
  (store: StoreApi<TinaStoreState>, source: Creatable) =>
  (name: string, from: string): void => {
    if (branchSliceOf(store.getState())?.creating) return;
    const fill = (patch: Partial<BranchSlice>) =>
      store.setState((state) => ({ branch: { ...state.branch, ...patch } }));
    const startedOn = currentBranchOf(store.getState());
    let settled = false;
    const finish = (
      made: string,
      outcome: 'ready' | 'unready' | 'failed',
      flags: { maybeMade?: boolean; exists?: boolean } = {}
    ) => {
      if (settled) return;
      settled = true;
      const madeNames = madeByStore.get(store);
      if (madeNames?.has(made)) madeNames.set(made, tickClock());
      const unready = branchSliceOf(store.getState())?.unready ?? [];
      fill({
        unready:
          outcome === 'unready' && !unready.includes(made)
            ? [...unready, made]
            : unready,
        creating: undefined,
        createResult: {
          name: made,
          from,
          startedOn,
          outcome,
          ...flags,
        },
      });
    };

    fill({
      creating: {
        name,
        from,
        startedOn,
        phase: 'making',
      },
      createResult: undefined,
    });
    new Promise<Awaited<ReturnType<Creatable['create']>>>((resolve) =>
      resolve(source.create({ name, from }))
    ).then(
      (result) => {
        let made: unknown;
        try {
          made = result?.name;
        } catch {
          made = undefined;
        }
        if (typeof made !== 'string' || made.trim() === '') {
          console.warn(`[tinacms] could not create branch ${name}:`, result);
          finish(name, 'failed');
          return;
        }
        try {
          madeByStore.set(
            store,
            new Map([...(madeByStore.get(store) ?? []), [made, null]])
          );
          const slice = branchSliceOf(store.getState());
          fill({
            list: slice?.list.includes(made)
              ? slice.list
              : [...(slice?.list ?? []), made],
            creating: {
              name: made,
              from,
              startedOn: slice?.creating?.startedOn,
              phase: 'preparing',
            },
          });
          const { ready } = result;
          if (!ready) {
            finish(made, 'ready');
            return;
          }
          ready.then(
            () => finish(made, 'ready'),
            (cause: unknown) => {
              console.warn(
                `[tinacms] ${made} was made but is not ready:`,
                cause
              );
              finish(made, 'unready');
            }
          );
        } catch (cause) {
          console.warn(`[tinacms] ${made} was made but is not ready:`, cause);
          finish(made, 'unready');
        }
      },
      (cause: unknown) => {
        console.warn(`[tinacms] could not create branch ${name}:`, cause);
        finish(name, 'failed', {
          ...(carries(cause, 'maybeMade', true) ? { maybeMade: true } : {}),
          ...(carries(cause, 'status', 409) || carries(cause, 'status', 422)
            ? { exists: true }
            : {}),
        });
      }
    );
  };
