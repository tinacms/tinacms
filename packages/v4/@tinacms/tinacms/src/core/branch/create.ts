import type { StoreApi } from 'zustand';
import type { TinaStoreState } from '../plugin';
import {
  type BranchSource,
  type BranchSlice,
  branchSliceOf,
  currentBranchOf,
} from './contract';

type Creatable = BranchSource & Required<Pick<BranchSource, 'create'>>;

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
    const finish = (made: string, outcome: 'ready' | 'unready' | 'failed') =>
      fill({
        creating: undefined,
        createResult: { name: made, from, startedOn, outcome },
      });

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
        if (typeof made !== 'string') {
          console.warn(`[tinacms] could not create branch ${name}:`, result);
          finish(name, 'failed');
          return;
        }
        try {
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
        finish(name, 'failed');
      }
    );
  };
