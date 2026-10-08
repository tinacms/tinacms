import { isRecord } from '../../utils/is-record';
import { invariant } from '../invariant';
import type { SliceState, TinaStoreState } from '../plugin';
import type { AuthSlice } from './contract';

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const hasAuthState = ({ status, user, roles }: SliceState): boolean => {
  if (status === 'signed-in') return isRecord(user) && isStringArray(roles);
  if (status === 'forbidden') return isRecord(user);
  return (status === 'loading' || status === 'signed-out') && user === null;
};

const isComponent = (value: unknown): boolean =>
  typeof value === 'function' ||
  (isRecord(value) && typeof value.$$typeof === 'symbol');

const isAuthSlice = (slice: SliceState): slice is SliceState & AuthSlice =>
  hasAuthState(slice) &&
  typeof slice.getToken === 'function' &&
  typeof slice.login === 'function' &&
  typeof slice.logout === 'function' &&
  (slice.LoginScreen === undefined || isComponent(slice.LoginScreen));

export const authSliceOf = (state: TinaStoreState): AuthSlice | null => {
  const slice = state.auth;
  if (!slice) return null;
  invariant(
    isAuthSlice(slice),
    'auth-capability-malformed',
    'The auth capability is mounted, but its slice lacks a valid status, user, roles, getToken, login, logout or LoginScreen. Fix the auth plugin so its slice is an AuthSlice.'
  );
  return slice;
};

// ADR-023 §4: every request to the CMS backend carries the token, read at request time.
export const authTokenOf = async (
  state: TinaStoreState
): Promise<string | undefined> => authSliceOf(state)?.getToken();

export const authHeadersOf = async (
  state: TinaStoreState
): Promise<Record<string, string>> => {
  const token = await authTokenOf(state);
  return token ? { authorization: `Bearer ${token}` } : {};
};
