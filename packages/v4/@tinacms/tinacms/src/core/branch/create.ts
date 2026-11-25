import type { StoreApi } from 'zustand';
import { AuthError } from '../auth/contract';
import type { TinaStoreState } from '../plugin';
import {
  BranchCreateError,
  type BranchCreateFailure,
  type BranchSource,
  type BranchSlice,
  branchSliceOf,
  currentBranchOf,
} from './contract';

type Creatable = BranchSource & Required<Pick<BranchSource, 'create'>>;

const failureOf = (cause: unknown): BranchCreateFailure => {
  if (cause instanceof BranchCreateError) return cause.reason;
  if (cause instanceof AuthError) {
    return cause.code === 'network' ? 'network' : 'auth';
  }
  return 'other';
};

/** How long a branch may stay not ready before the create ends unready. Longer than TinaCloud's index timeout. */
export const READY_DEADLINE_MS = 20 * 60 * 1000;

/** How long a provider's `create` may take before the create ends as a timeout. */
export const CREATE_DEADLINE_MS = 90_000;

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
    let deadline: ReturnType<typeof setTimeout> | undefined;
    const finish = (
      made: string,
      outcome: 'ready' | 'unready' | 'failed',
      failure?: BranchCreateFailure
    ) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
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
          ...(failure ? { failure } : {}),
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
    // A provider whose create never answers must not lock creating for the session.
    deadline = setTimeout(
      () => finish(name, 'failed', 'timeout'),
      CREATE_DEADLINE_MS
    );
    new Promise<Awaited<ReturnType<Creatable['create']>>>((resolve) =>
      resolve(source.create({ name, from }))
    ).then(
      (result) => {
        if (settled) return;
        clearTimeout(deadline);
        let made: unknown;
        try {
          made = result?.name;
        } catch {
          made = undefined;
        }
        if (typeof made !== 'string' || made.trim() === '') {
          console.warn(`[tinacms] could not create branch ${name}:`, result);
          finish(name, 'failed', 'other');
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
          // A `ready` that never settles must not lock creating either.
          deadline = setTimeout(
            () => finish(made, 'unready'),
            READY_DEADLINE_MS
          );
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
        finish(name, 'failed', failureOf(cause));
      }
    );
  };
