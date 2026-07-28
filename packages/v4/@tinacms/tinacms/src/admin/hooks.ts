import { use } from 'react';
import type { TinaSchema } from '../config';
import { invariant } from '../core/invariant';
import { TinaRuntimeContext } from '../editor/context';

// The content model the admin navigates, as defineConfig declared it. Build-time
// config rather than state (ADR-016), so it is read from the runtime, not the store.
export function useTinaSchema(): TinaSchema {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'tina-schema-outside-provider',
    'useTinaSchema must be used within a TinaProvider'
  );
  return runtime.schema;
}
