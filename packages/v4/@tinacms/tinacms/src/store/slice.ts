import type {
  ClientSlice,
  SliceSet,
  SliceState,
  TinaStoreState,
} from '../core/plugin';

// The slice/store types live in core/plugin.ts (the plugin contract owns them); they
// are re-exported here so the store module imports them from one place. The mount rule
// (which namespace a plugin lands on) lives in core/mount.ts, shared with the server
// ops composer.
export type { ClientSlice, SliceSet, SliceState, TinaStoreState };
