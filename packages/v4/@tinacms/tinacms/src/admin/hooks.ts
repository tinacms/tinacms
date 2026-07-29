import { use } from 'react';
import type { TinaSchema } from '../config';
import { invariant } from '../core/invariant';
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
