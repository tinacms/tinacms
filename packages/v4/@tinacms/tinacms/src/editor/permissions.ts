import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { AuthPluginSlice, AuthSlice } from '../core/auth/contract';
import { defaultRolesGrant } from '../core/auth/default-roles';
import { invariant } from '../core/invariant';
import type { RpcProxy } from '../rpc/proxy';
import { isMissingRouteError } from './rpc-errors';

export interface PermissionSegments {
  session: { permissions: () => Promise<string[]> };
}

const isSignedIn = (
  slice: AuthPluginSlice | null
): slice is Extract<AuthPluginSlice, { status: 'signed-in' }> =>
  slice?.status === 'signed-in';

const PERMISSIONS_STALE_TIME = 30_000;

export interface PermissionsState {
  status: 'pending' | 'ready' | 'failed';
  retry: () => void;
}

const permissionStates = new WeakMap<AuthSlice, PermissionsState>();

/** How the question for the signed-in user's permissions stands. `null` for a slice without `can`. */
export const permissionsStateOf = (
  auth: AuthSlice | null
): PermissionsState | null =>
  auth ? (permissionStates.get(auth) ?? null) : null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

/**
 * Adds `can` to the signed-in slice. It answers from the Backend's `session/permissions`,
 * keyed by user, roles and branch so another user never reads the previous answer. `null`
 * from the query means the Backend has no such route, so the default role map applies. While the
 * answer is pending or after it failed, `can` is false for every permission (ADR-008 §3).
 */
export const useAuthSliceWithCan = (
  slice: AuthPluginSlice | null,
  server: RpcProxy<PermissionSegments>,
  branch: string | undefined
): AuthSlice | null => {
  const signedIn = isSignedIn(slice) ? slice : null;
  const { data, isError, refetch } = useQuery<string[] | null>({
    queryKey: [
      'tina',
      'permissions',
      signedIn?.user.id ?? '',
      signedIn?.roles.join(',') ?? '',
      branch ?? '',
    ],
    enabled: signedIn !== null,
    staleTime: PERMISSIONS_STALE_TIME,
    queryFn: async () => {
      try {
        const granted = await server.session.permissions();
        invariant(
          isStringArray(granted),
          'session-permissions-malformed',
          'session/permissions must answer a list of permission strings.'
        );
        return granted;
      } catch (cause) {
        if (isMissingRouteError(cause)) return null;
        throw cause;
      }
    },
  });
  return useMemo(() => {
    if (!isSignedIn(slice)) return slice;
    const can = (permission: string): boolean => {
      if (data === undefined) return false;
      if (data === null) return defaultRolesGrant(slice.roles, permission);
      return data.includes('*') || data.includes(permission);
    };
    const withCan: AuthSlice = { ...slice, can };
    let status: PermissionsState['status'] = 'pending';
    if (data !== undefined) status = 'ready';
    else if (isError) status = 'failed';
    permissionStates.set(withCan, {
      status,
      retry: () => void refetch(),
    });
    return withCan;
  }, [slice, data, isError, refetch]);
};
