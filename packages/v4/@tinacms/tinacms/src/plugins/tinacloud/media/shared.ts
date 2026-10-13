import { AuthError } from '../../../core/auth/contract';
import { MediaError } from '../../../core/media/contract';
import { TinaCloudError } from '../client';

/** An undefined branch is the media branch of the TinaCloud project. */
export type MediaBranch = string | undefined;

export const toMediaError = (cause: unknown): MediaError => {
  if (cause instanceof MediaError) return cause;
  if (cause instanceof AuthError) {
    const detail = cause.detail ?? cause.message;
    if (cause.code === 'unauthenticated' || cause.code === 'expired') {
      return new MediaError('unauthorized', detail);
    }
    return new MediaError('backend-failure', detail);
  }
  if (!(cause instanceof TinaCloudError)) {
    if (cause instanceof Error) {
      return new MediaError('backend-failure', cause.message);
    }
    return new MediaError('backend-failure', String(cause));
  }
  const { serverMessage } = cause;
  const detail =
    serverMessage && serverMessage !== cause.message
      ? `${cause.message} ${serverMessage}`
      : cause.message;
  switch (cause.status) {
    case 401:
    case 403:
      return new MediaError('unauthorized', detail);
    case 404:
      return new MediaError('not-found', detail);
    case 413:
      return new MediaError('too-large', detail);
    default:
      return new MediaError('backend-failure', detail);
  }
};

export const branchQuery = (branch: MediaBranch): string =>
  branch ? `?${new URLSearchParams({ branch })}` : '';
