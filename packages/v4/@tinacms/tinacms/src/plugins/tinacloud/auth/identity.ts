import type { z } from 'zod';
import { AuthError, type AuthUser } from '../../../core/auth/contract';
import {
  currentUserSchema,
  currentUserUrl,
  projectRolesSchema,
  projectUrl,
} from './tinacloud-auth-types';

export const send = async (
  url: string,
  init: RequestInit
): Promise<{ response: Response; body: unknown }> => {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (cause) {
    if (cause instanceof Error) {
      throw new AuthError('network', cause.message);
    }
    throw new AuthError('network', String(cause));
  }
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
};

const fetchIdentity = async <Output>(
  url: string,
  bearer: string,
  schema: z.ZodType<Output, z.ZodTypeDef, unknown>,
  signal: AbortSignal | undefined
): Promise<Output> => {
  const { response, body } = await send(url, {
    headers: { Authorization: `Bearer ${bearer}` },
    signal,
  });
  if (response.status === 401) {
    throw new AuthError('unauthenticated', 'TinaCloud refused the session.');
  }
  if (response.status === 403) {
    throw new AuthError(
      'no-access',
      'TinaCloud refused access to the project.'
    );
  }
  if (!response.ok) {
    throw new AuthError(
      'network',
      `TinaCloud responded with ${response.status}.`
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AuthError(
      'invalid-response',
      `TinaCloud returned ${url} in an unknown format.`
    );
  }
  return parsed.data;
};

type ProjectIdentity =
  | { active: true; user: AuthUser; roles: string[] }
  | { active: false; user: AuthUser };

export const fetchProjectIdentity = async (
  clientId: string,
  bearer: string,
  signal?: AbortSignal
): Promise<ProjectIdentity> => {
  const { user, active } = await fetchIdentity(
    currentUserUrl(clientId),
    bearer,
    currentUserSchema,
    signal
  );
  if (!active) return { active: false, user };
  const roles = await fetchIdentity(
    projectUrl(clientId),
    bearer,
    projectRolesSchema,
    signal
  );
  return { active: true, user, roles };
};
