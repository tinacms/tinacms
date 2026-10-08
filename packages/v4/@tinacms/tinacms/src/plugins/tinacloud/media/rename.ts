import { MediaError, type MediaErrorCode } from '../../../core/media/contract';
import {
  TINACLOUD_ASSETS_URL,
  type TinaCloudClient,
  TinaCloudError,
} from '../client';
import {
  renameErrorBodySchema,
  renameResponseSchema,
} from './tinacloud-media-types';
import { type MediaBranch, toMediaError } from './read';

const RENAME_ERROR_CODES: Record<string, MediaErrorCode> = {
  NOT_FOUND: 'not-found',
  NAME_COLLISION: 'name-taken',
  INVALID_FILENAME: 'invalid-name',
  INVALID_PATH: 'invalid-path',
  UNAUTHORIZED: 'unauthorized',
  UNSUPPORTED: 'unsupported',
  BACKEND_FAILURE: 'backend-failure',
};

const toRenameError = (cause: unknown): MediaError => {
  if (!(cause instanceof TinaCloudError)) return toMediaError(cause);
  const message = cause.serverMessage;
  const errorBody = renameErrorBodySchema.safeParse(cause.body);
  const reported = errorBody.success
    ? RENAME_ERROR_CODES[errorBody.data.code]
    : undefined;
  if (reported) return new MediaError(reported, message);
  if (cause.status === 409 || /exists/i.test(message ?? '')) {
    return new MediaError('name-taken', message);
  }
  if (cause.status === 400) return new MediaError('invalid-name', message);
  return toMediaError(cause);
};

/** Resolves to the new media path. */
export const renameMedia = async (
  client: TinaCloudClient,
  branch: MediaBranch,
  from: string,
  to: string
): Promise<string> => {
  let body: unknown;
  try {
    body = await client.authedFetch(
      `${TINACLOUD_ASSETS_URL}/v1/${client.clientId}/rename`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, branch }),
      }
    );
  } catch (cause) {
    throw toRenameError(cause);
  }
  const parsed = renameResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new MediaError(
      'backend-failure',
      'TinaCloud did not confirm the rename.'
    );
  }
  const { requestId, path } = parsed.data;
  if (requestId) {
    try {
      await client.waitForRequest(requestId);
    } catch (cause) {
      // The media index already shows the new name, so the rename may be done.
      throw new MediaError(
        'backend-failure',
        `${toMediaError(cause).detail} The file may still have been renamed. Refresh the media library to check.`
      );
    }
  }
  return path ?? to;
};
