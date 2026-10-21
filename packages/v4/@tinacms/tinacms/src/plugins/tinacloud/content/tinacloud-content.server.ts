import type { ContentSaveInput } from '../../../core/content/contract';
import { invariant } from '../../../core/invariant';
import type { ServerSegment } from '../../../core/plugin';
import { requestContext } from '../../../server/request-context';
import { bearerTokenOf } from '../auth/tinacloud-auth.server';
import { type TinaCloudOptions, createTinaCloudClient } from '../client';
import { TINACLOUD_PLUGIN_NAME } from '../name';
import { updateDocument } from './request';

// The write behind core's `content/update` op, which runs the server hooks
// first. It writes with the token of the editor who saved. A browser bundle can
// reach this module through the lazy `server` segment, so it imports no node
// module.
export const createTinaCloudContentServer = (options: TinaCloudOptions) =>
  ({
    update: async ({ collection, path, value, branch }: ContentSaveInput) => {
      const context = requestContext();
      invariant(
        context.authProvider === TINACLOUD_PLUGIN_NAME,
        'tinacloud-update-foreign-auth',
        `The tinaCloud() content write needs tinaCloud() as the auth provider, but "${context.authProvider ?? 'no plugin'}" provides auth. Remove the auth override, or use a content provider that matches it.`
      );
      const { request } = context;
      const client = createTinaCloudClient({
        ...options,
        getToken: () => bearerTokenOf(request),
      });
      const target = branch || (await client.getProject()).defaultBranch;
      if (!target) {
        throw new Error('The TinaCloud project has no default branch.');
      }
      const document = await updateDocument(
        client,
        target,
        collection,
        path,
        value
      );
      return { path: document._sys.path, document: document._values };
    },
  }) satisfies ServerSegment;
