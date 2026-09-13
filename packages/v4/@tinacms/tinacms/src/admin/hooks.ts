import { use, useMemo } from 'react';
import type { TinaSchema } from '../config';
import { invariant } from '../core/invariant';
import type { AdminScreen } from '../core/screen/contract';
import { screenList } from '../core/screen/registry';
import { TinaRuntimeContext } from '../editor/context';

export function useTinaSchema(): TinaSchema {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'tina-schema-outside-provider',
    'useTinaSchema must be used within a TinaProvider'
  );
  return runtime.schema;
}

export function useAdminScreens(): AdminScreen[] {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'admin-screens-outside-provider',
    'useAdminScreens must be used within a TinaProvider'
  );
  return useMemo(() => screenList(runtime.screens), [runtime.screens]);
}
