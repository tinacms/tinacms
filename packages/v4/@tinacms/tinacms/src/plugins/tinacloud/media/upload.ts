import { MediaError } from '../../../core/media/contract';
import { sanitizeFilename } from '../../media-manager/media-types';
import { TINACLOUD_ASSETS_URL, type TinaCloudClient } from '../client';
import { encodePath } from '../../../utils/encode-path';
import { uploadUrlResponseSchema } from './tinacloud-media-types';
import { type MediaBranch, branchQuery, toMediaError } from './shared';

const s3Error = async (response: Response): Promise<MediaError> => {
  const xml = await response.text();
  const code = /<Code>([^<]+)<\/Code>/.exec(xml)?.[1];
  const message = /<Message>([^<]+)<\/Message>/.exec(xml)?.[1];
  const detail = message ?? `The upload responded with ${response.status}.`;
  return new MediaError(
    code === 'EntityTooLarge' ? 'too-large' : 'backend-failure',
    detail
  );
};

const putFile = async (signedUrl: string, file: File): Promise<void> => {
  let response: Response;
  try {
    response = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    });
  } catch (cause) {
    throw toMediaError(cause);
  }
  if (!response.ok) throw await s3Error(response);
};

/** Resolves to the media path of the uploaded file. */
export const uploadMedia = async (
  client: TinaCloudClient,
  branch: MediaBranch,
  file: File,
  folder = ''
): Promise<string> => {
  const name = sanitizeFilename(file.name);
  const path = folder ? `${folder}/${name}` : name;
  try {
    const body = await client.authedFetch(
      `${TINACLOUD_ASSETS_URL}/v1/${client.clientId}/upload_url/${encodePath(path)}${branchQuery(branch)}`
    );
    const parsed = uploadUrlResponseSchema.safeParse(body);
    if (!parsed.success) {
      throw new MediaError(
        'backend-failure',
        'TinaCloud returned no upload URL.'
      );
    }
    await putFile(parsed.data.signedUrl, file);
    if (parsed.data.requestId) {
      await client.waitForRequest(parsed.data.requestId);
    }
    return path;
  } catch (cause) {
    throw toMediaError(cause);
  }
};
