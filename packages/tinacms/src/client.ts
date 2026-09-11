export * from './unifiedClient';

import { NodeCache } from './cache/node-cache';
import { TinaClient as BaseTinaClient } from './unifiedClient';
import type { TinaClientArgs } from './unifiedClient';

export class TinaClient<GenQueries> extends BaseTinaClient<GenQueries> {
  protected createCache(dir: string) {
    return NodeCache(dir);
  }
}

export function createClient<GenQueries>(args: TinaClientArgs<GenQueries>) {
  return new TinaClient<ReturnType<typeof args.queries>>(args);
}
