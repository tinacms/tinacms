import { z } from 'zod';
import { type AuthUser, toUserId } from '../../../core/auth/contract';
import { TINACLOUD_IDENTITY_URL } from '../client';

export const TINACLOUD_LOGIN_EVENT = 'tinaCloudLogin';

export const loginMessageSchema = z.object({
  source: z.literal(TINACLOUD_LOGIN_EVENT),
  access_token: z.string().min(1),
  id_token: z.string().min(1).optional(),
  refresh_token: z.string().min(1),
});

export type TinaCloudLoginMessage = z.infer<typeof loginMessageSchema>;

export const refreshResponseSchema = z.object({
  access_token: z.string().min(1),
  id_token: z.string().min(1).optional(),
  refresh_token: z.string().min(1).optional(),
});

export const codeResponseSchema = refreshResponseSchema.required({
  refresh_token: true,
});

export const authConfigSchema = z.object({ workosEnabled: z.boolean() });

export const jwtPayloadSchema = z.object({ exp: z.number() });

// TinaCloud sends a missing name or email as "".
const optionalText = z
  .string()
  .optional()
  .transform((text) => text || undefined);

export const currentUserSchema = z
  .object({
    id: optionalText,
    email: optionalText,
    fullName: optionalText,
    verified: z.boolean().optional(),
  })
  .transform(({ id, email, fullName, verified }, context) => {
    const userId = id ?? email;
    if (!userId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The user has no id and no email.',
      });
      return z.NEVER;
    }
    const user: AuthUser = { id: toUserId(userId), name: fullName, email };
    return { user, active: verified === true };
  });

// As TinaCloud's CanAdminApp: a project owner or admin, or an org admin or
// superuser, whose role TinaCloud sends as "" because they have no project row.
export const projectRolesSchema = z
  .object({ role: z.string().optional() })
  .transform(({ role = '' }) => [
    ['', 'admin', 'owner'].includes(role.toLowerCase()) ? 'admin' : 'editor',
  ]);

export const projectUrl = (clientId: string) =>
  `${TINACLOUD_IDENTITY_URL}/v2/apps/${encodeURIComponent(clientId)}`;

export const currentUserUrl = (clientId: string) =>
  `${projectUrl(clientId)}/currentUser`;
