import { z } from 'zod';
import type { AuthUser } from '../../../core/auth/contract';
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

export const jwtPayloadSchema = z.object({ exp: z.number() });

export const currentUserSchema = z
  .object({
    id: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
    fullName: z.string().min(1).optional(),
    role: z.string().optional(),
    verified: z.boolean().optional(),
    enabled: z.boolean().optional(),
  })
  .transform(({ id, email, fullName, ...account }, context) => {
    const userId = id ?? email;
    if (!userId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The user has no id and no email.',
      });
      return z.NEVER;
    }
    const user: AuthUser = { id: userId, name: fullName, email };
    return { user, ...account };
  });

export const currentUserUrl = (clientId: string) =>
  `${TINACLOUD_IDENTITY_URL}/v2/apps/${clientId}/currentUser`;
