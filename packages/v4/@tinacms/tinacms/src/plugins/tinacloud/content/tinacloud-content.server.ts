import {
  type ContentSaveInput,
  ProviderRefusalError,
  isProviderRefusalCode,
} from '../../../core/content/contract';
import { invariant } from '../../../core/invariant';
import type { ServerSegment } from '../../../core/plugin';
import { requestContext } from '../../../server/request-context';
import { bearerTokenOf } from '../auth/tinacloud-auth.server';
import { type TinaCloudOptions, createTinaCloudClient } from '../client';
import { TINACLOUD_PLUGIN_NAME } from '../name';
import { toContentError } from './errors';
import { updateDocument } from './request';

const asProviderRefusal = (cause: unknown): unknown => {
  const error = toContentError(cause);
  if (isProviderRefusalCode(error.code)) {
    return new ProviderRefusalError(error.code, error.message);
  }
  return cause;
};

const refusingKnownFailures = async <T>(run: () => Promise<T>): Promise<T> => {
  try {
    return await run();
  } catch (cause) {
    throw asProviderRefusal(cause);
  }
};

// A browser bundle can reach this module through the lazy `server` segment, so
// it imports no node module.
export const createTinaCloudContentServer = (options: TinaCloudOptions) => {
  const editorClient = () => {
    const context = requestContext();
    invariant(
      context.authProvider === TINACLOUD_PLUGIN_NAME,
      'tinacloud-update-foreign-auth',
      `The tinaCloud() content write needs tinaCloud() as the auth provider, but "${context.authProvider ?? 'no plugin'}" provides auth. Remove the auth override, or use a content provider that matches it.`
    );
    return createTinaCloudClient({
      ...options,
      getToken: () => bearerTokenOf(context.request),
    });
  };
  const resolveBranch = (branch: string | undefined): Promise<string> =>
    refusingKnownFailures(async () => {
      if (branch) return branch;
      const { defaultBranch } = await editorClient().getProject();
      if (!defaultBranch) {
        throw new Error('The TinaCloud project has no default branch.');
      }
      return defaultBranch;
    });
  return {
    resolveBranch,
    update: async ({ collection, path, value, branch }: ContentSaveInput) => {
      const target = await resolveBranch(branch);
      const document = await refusingKnownFailures(() =>
        updateDocument(editorClient(), target, collection, path, value)
      );
      return { path: document._sys.path, document: document._values };
    },
  } satisfies ServerSegment;
};
