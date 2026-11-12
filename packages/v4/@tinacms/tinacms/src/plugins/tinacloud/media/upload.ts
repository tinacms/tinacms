import { AuthError } from '../../../core/auth/contract';
import {
  MediaError,
  type MediaUploadOptions,
} from '../../../core/media/contract';
import {
  type UploadResponse,
  sendUpload,
  uploadAbortError,
} from '../../../core/media/upload-request';
import { sanitizeFilename } from '../../media-manager/media-types';
import {
  TINACLOUD_ASSETS_URL,
  type TinaCloudClient,
  TinaCloudError,
  TinaCloudRequestFailedError,
} from '../client';
import { encodePath } from '../../../utils/encode-path';
import { uploadUrlResponseSchema } from './tinacloud-media-types';
import { type MediaBranch, branchQuery, toMediaError } from './shared';

const s3Error = ({ status, text }: UploadResponse): MediaError => {
  const code = /<Code>([^<]+)<\/Code>/.exec(text)?.[1];
  const message = /<Message>([^<]+)<\/Message>/.exec(text)?.[1];
  const detail = message ?? `The upload responded with ${status}.`;
  return new MediaError(
    code === 'EntityTooLarge' ? 'too-large' : 'backend-failure',
    detail
  );
};

const putFile = async (
  signedUrl: string,
  file: File,
  options: MediaUploadOptions
): Promise<void> => {
  const response = await sendUpload(
    {
      url: signedUrl,
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    },
    options
  );
  if (response.status < 200 || response.status >= 300) {
    throw s3Error(response);
  }
};

// `upload_url` answers 412 when the path is an asset that exists.
const requestUploadUrl = async (
  client: TinaCloudClient,
  branch: MediaBranch,
  path: string
): Promise<unknown> => {
  try {
    return await client.authedFetch(
      `${TINACLOUD_ASSETS_URL}/v1/${client.clientId}/upload_url/${encodePath(path)}${branchQuery(branch)}`
    );
  } catch (cause) {
    if (cause instanceof TinaCloudError && cause.status === 412) {
      throw new MediaError('name-taken', cause.serverMessage ?? cause.message);
    }
    throw cause;
  }
};

// Only an answer from TinaCloud or the storage becomes a `MediaError`.
export const answeredFailureOf = (cause: unknown): unknown => {
  if (cause instanceof TinaCloudError && cause.status !== undefined) {
    return toMediaError(cause);
  }
  if (cause instanceof AuthError && cause.code !== 'network') {
    return toMediaError(cause);
  }
  return cause;
};

// After the bytes are sent, a wait with no answer must not read as a failed upload.
const waitFailureOf = (cause: unknown): unknown => {
  if (cause instanceof TinaCloudRequestFailedError) return toMediaError(cause);
  const failure = toMediaError(cause);
  if (failure.code === 'unauthorized') return failure;
  return cause;
};

const sendFile = async (
  client: TinaCloudClient,
  branch: MediaBranch,
  path: string,
  file: File,
  options: MediaUploadOptions
): Promise<string | undefined> => {
  try {
    if (options.signal?.aborted) throw uploadAbortError();
    const body = await requestUploadUrl(client, branch, path);
    const parsed = uploadUrlResponseSchema.safeParse(body);
    if (!parsed.success) {
      throw new MediaError(
        'backend-failure',
        'TinaCloud returned no upload URL.'
      );
    }
    await putFile(parsed.data.signedUrl, file, options);
    return parsed.data.requestId;
  } catch (cause) {
    throw answeredFailureOf(cause);
  }
};

/**
 * Resolves to the media path of the uploaded file. An aborted upload rejects
 * with an `AbortError`, not a `MediaError`.
 */
export const uploadMedia = async (
  client: TinaCloudClient,
  branch: MediaBranch,
  file: File,
  folder = '',
  options: MediaUploadOptions = {}
): Promise<string> => {
  const name = sanitizeFilename(file.name);
  const path = folder ? `${folder}/${name}` : name;
  const requestId = await sendFile(client, branch, path, file, options);
  if (requestId) {
    try {
      await client.waitForRequest(requestId);
    } catch (cause) {
      throw waitFailureOf(cause);
    }
  }
  return path;
};
