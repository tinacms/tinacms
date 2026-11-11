import { use, useMemo } from 'react';
import type { TinaSchema } from '../config';
import { invariant } from '../core/invariant';
import type { AdminScreen } from '../core/screen/contract';
import { screenList } from '../core/screen/registry';
import type { GlobalNavSection, HomePanels } from '../core/slot/contract';
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

export function useGlobalNav(): GlobalNavSection[] {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'global-nav-outside-provider',
    'useGlobalNav must be used within a TinaProvider'
  );
  return runtime.globalNav;
}

export function useHomePanels(): HomePanels {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'home-panels-outside-provider',
    'useHomePanels must be used within a TinaProvider'
  );
  return runtime.homePanels;
}
