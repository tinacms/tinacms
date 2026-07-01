import type { TinaCloudUser } from '@tinacms/auth';
import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';

const isUserAuthorized = async (args: {
  clientID: string;
  token: string;
}): Promise<TinaCloudUser | undefined> => {
  const clientID = args.clientID;
  const token = args.token;
  try {
    // fetch identity from content server
    const tinaCloudRes = await fetch(
      `https://identity.tinajs.io/v2/apps/${clientID}/currentUser`,
      {
        headers: new Headers({
          'Content-Type': 'application/json',
          authorization: token,
        }),
        method: 'GET',
      }
    );
    if (tinaCloudRes.ok) {
      const user: TinaCloudUser = await tinaCloudRes.json();
      return user;
    }
    return;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const isAuthorized = async (
  req: NextRequest,
  expectedClientID?: string
): Promise<TinaCloudUser | undefined> => {
  const token = (await headers()).get('authorization');
  // Validate against the site's configured app id, never a request value.
  const clientID = expectedClientID ?? process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
  if (typeof clientID !== 'string' || clientID.trim().length === 0) {
    console.error(
      "isAuthorized could not resolve this site's clientID. Pass it explicitly or set the NEXT_PUBLIC_TINA_CLIENT_ID env var. Refusing to authorize."
    );
    return undefined;
  }
  if (typeof token !== 'string') {
    console.error(
      'A authorization header was not found. Please use the cms.api.tina.fetchWithToken function on the frontend'
    );
    return undefined;
  }
  return await isUserAuthorized({ clientID, token });
};
