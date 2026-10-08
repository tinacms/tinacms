import { z } from 'zod';

export const listResponseSchema = z.object({
  files: z.array(z.object({ filename: z.string() })),
  directories: z.array(z.string()),
  cursor: z.union([z.string(), z.number()]).optional(),
});

export const requestIdResponseSchema = z.object({
  requestId: z.string().optional(),
});

export const uploadUrlResponseSchema = z.object({
  signedUrl: z.string(),
  requestId: z.string().optional(),
});

export const renameResponseSchema = z.object({
  success: z.literal(true),
  requestId: z.string().optional(),
  path: z.string().optional(),
});

export const renameErrorBodySchema = z.object({ code: z.string() });
