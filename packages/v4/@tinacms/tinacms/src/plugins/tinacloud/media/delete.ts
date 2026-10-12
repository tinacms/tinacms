import { TINACLOUD_ASSETS_URL, type TinaCloudClient } from '../client';
import { encodePath } from '../../../utils/encode-path';
import { type MediaBranch, branchQuery, toMediaError } from './shared';
import { requestIdResponseSchema } from './tinacloud-media-types';

export const deleteMedia = async (
  client: TinaCloudClient,
  branch: MediaBranch,
  path: string
): Promise<void> => {
  try {
    const body = await client.authedFetch(
      `${TINACLOUD_ASSETS_URL}/v1/${client.clientId}/${encodePath(path)}${branchQuery(branch)}`,
      { method: 'DELETE' }
    );
    const parsed = requestIdResponseSchema.safeParse(body);
    if (parsed.success && parsed.data.requestId) {
      await client.waitForRequest(parsed.data.requestId);
    }
  } catch (cause) {
    throw toMediaError(cause);
  }
};
