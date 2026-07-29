import { use, useMemo } from 'react';
import type { TinaSchema } from '../config';
import { invariant } from '../core/invariant';
import type { AdminScreen } from '../core/screen/contract';
import { screenList } from '../core/screen/registry';
import { TinaRuntimeContext } from '../editor/context';

// The content model that the admin navigates, as defineConfig declared it. It is config
// from the build, and not state (ADR-016), so this reads it from the runtime and not
// from the store.
export function useTinaSchema(): TinaSchema {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'tina-schema-outside-provider',
    'useTinaSchema must be used within a TinaProvider'
  );
  return runtime.schema;
}

// The screens the plugins registered, in navigation order. Like the schema, this is
// config composed at boot and not state, so it comes off the runtime rather than the
// store (core/screen/registry.ts).
export function useAdminScreens(): AdminScreen[] {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'admin-screens-outside-provider',
    'useAdminScreens must be used within a TinaProvider'
  );
  // The registry never changes after boot, so this array is sorted once per runtime and
  // callers can use it as a dependency. The memo stays by hand: the React Compiler
  // leaves a hook that returns a call result straight out unmemoised, so without it
  // every render sorts a new array and every caller depending on it invalidates.
  return useMemo(() => screenList(runtime.screens), [runtime.screens]);
}
