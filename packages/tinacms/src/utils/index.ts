/**

*/

import { Client, LocalClient } from '../internalClient';
import type { TinaIOConfig } from '../internalClient';
import * as yup from 'yup';
import { Schema } from '@tinacms/schema-tools';

export interface CreateClientProps {
  clientId?: string;
  isLocalClient?: boolean;
  isSelfHosted?: boolean;
  tinaioConfig?: TinaIOConfig;
  owner?: string;
  repo?: string;
  branch?: string;
  schema?: Schema;
  apiUrl?: string;
  tinaGraphQLVersion: string;
}
/**
 * Decides whether the editor should run as a local client. A local client
 * surfaces the "local mode" banner and short-circuits remote-only behaviour
 * (e.g. branch listing always resolves, content-events are empty).
 *
 * A configured `contentApiUrlOverride` always points the editor at a self-hosted
 * content API, so it is never local mode — regardless of whether the override is
 * a relative (`/api/tina/gql`) or absolute (`https://…/api/tina/gql`) URL. The
 * URL-shape heuristic in `parseURL` only returns `false` for relative overrides
 * and misclassifies any non-TinaCloud absolute host as local, so an explicit
 * override takes precedence here. Without an override we fall back to whatever
 * the URL-shape heuristic determined.
 */
export const resolveIsLocalClient = ({
  isLocalClient,
  contentApiUrlOverride,
}: {
  isLocalClient: boolean | undefined;
  contentApiUrlOverride?: string;
}): boolean | undefined => {
  if (contentApiUrlOverride) {
    return false;
  }
  return isLocalClient;
};

export const createClient = ({
  clientId,
  isLocalClient = true,
  branch,
  tinaioConfig,
  schema,
  apiUrl,
  tinaGraphQLVersion,
}: CreateClientProps) => {
  return isLocalClient
    ? new LocalClient({ customContentApiUrl: apiUrl, schema })
    : new Client({
        clientId: clientId || '',
        branch: branch || 'main',
        tokenStorage: 'LOCAL_STORAGE',
        tinaioConfig,
        schema,
        tinaGraphQLVersion,
      });
};

export function assertShape<T>(
  value: unknown,
  yupSchema: (args: typeof yup) => yup.AnySchema,
  errorMessage?: string
): asserts value is T {
  const shape = yupSchema(yup);
  try {
    shape.validateSync(value);
  } catch (e) {
    const message = errorMessage || `Failed to assertShape - ${e.message}`;
    throw new Error(message);
  }
}

export function safeAssertShape<T>(
  value: unknown,
  yupSchema: (args: typeof yup) => yup.AnySchema
): boolean {
  try {
    assertShape<T>(value, yupSchema);
    return true;
  } catch (e) {
    return false;
  }
}

//? Note: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
//! Replaces lodash.get
export const get = (obj, path, defaultValue = undefined) => {
  const travel = (regexp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res, key) => (res !== null && res !== undefined ? res[key] : res),
        obj
      );
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};
