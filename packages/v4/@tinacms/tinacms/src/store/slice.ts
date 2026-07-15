import type {
  ClientSlice,
  SliceSet,
  SliceState,
  TinaStoreState,
} from '../core/plugin';

// The slice/store types live in core/plugin.ts (the plugin contract owns them); they are
// re-exported here so the store module imports them from one place. The mount rule itself
// is shared with the server-ops composer and lives in core/mount.ts.
export type { ClientSlice, SliceSet, SliceState, TinaStoreState };
export {
  type CapabilityMount as SliceMount,
  capabilityMountFor as sliceMountFor,
  overridesCapabilityMount as overridesSliceMount,
} from '../core/mount';
