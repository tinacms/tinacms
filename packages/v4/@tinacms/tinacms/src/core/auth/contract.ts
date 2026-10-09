import type { ComponentType } from 'react';
import type { Brand } from '../brand';
import { invariant } from '../invariant';

export type UserId = Brand<string, 'UserId'>;

export const toUserId = (id: string): UserId => {
  invariant(
    id.length > 0,
    'user-id-empty',
    'A user id must be a non-empty string.'
  );
  return id as UserId;
};

export interface AuthUser {
  id: UserId;
  name?: string;
  email?: string;
}

// ADR-023 §1: the single primitive every verifier needs. Roles ride in the session;
// core reads them per request and stores nothing (ADR-008).
export interface Session {
  identity: AuthUser;
  roles: string[];
}

// The transport hooks the RPC handler needs from whatever provides `auth`. They live on
// the auth plugin's server segment under these names; compose claims them off the
// routable ops (rpc/handler.ts), so the handler invokes them directly (getSession
// receives the raw Request) and dispatch can never route them as RPC ops.
export interface AuthTransportHooks {
  getSession: (request: Request) => Promise<Session | null>;
  // Role → permission bundles are the auth provider's domain (ADR-008 §3). Absent, the
  // built-in editor/admin defaults apply.
  rolePermissions?: (role: string) => Promise<string[]>;
}

const AUTH_ERROR_MESSAGES = {
  unauthenticated: 'You are signed out. Sign in to continue.',
  expired: 'Your session has expired. Sign in again.',
  network: "Can't reach the sign-in service. Check your connection.",
  'invalid-response':
    'The sign-in service sent a response that Tina cannot read.',
} satisfies Record<string, string>;

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;

/** `message` is the sentence to show the user; `detail` is the technical reason. */
export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly detail?: string;

  constructor(code: AuthErrorCode, detail?: string) {
    super(AUTH_ERROR_MESSAGES[code]);
    this.name = 'AuthError';
    this.code = code;
    this.detail = detail;
  }
}

// ADR-023 §4/§5: the provider drives login and owns the token. The token stays in
// memory, never in slice state or localStorage, and getToken refreshes it.
// getToken is the token the site's own server receives; undefined sends none.
// ADR-008: `roles` gate the UI only. The server check is the security boundary.
export type AuthSlice = (
  | { status: 'signed-in'; user: AuthUser; roles: string[] }
  | { status: 'forbidden'; user: AuthUser }
  | { status: 'loading' | 'signed-out'; user: null }
) & {
  getToken(): Promise<string | undefined>;
  login(): Promise<void>;
  logout(): Promise<void>;
  LoginScreen?: ComponentType;
};
