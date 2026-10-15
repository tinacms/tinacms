import { TinaCloudBackendAuthProvider } from '@tinacms/auth';
import { LocalBackendAuthProvider, TinaNodeBackend } from '@tinacms/datalayer';

import databaseClient from '../../../tina/__generated__/databaseClient';

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

const handler = TinaNodeBackend({
  authProvider: isLocal
    ? LocalBackendAuthProvider()
    : TinaCloudBackendAuthProvider(process.env.NEXT_PUBLIC_TINA_CLIENT_ID),
  databaseClient,
});

export default (req, res) => {
  // Modify the request here if you need to
  return handler(req, res);
};
