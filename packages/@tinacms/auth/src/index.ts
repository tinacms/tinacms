/**

*/
import type { IncomingMessage, ServerResponse } from 'http';
import type { NextApiRequest } from 'next';

export interface TinaCloudUser {
  id: string;
  email: string;
  verified: boolean;
  role: 'admin' | 'user';
  enabled: boolean;
  fullName: string;
}

export const isUserAuthorized = async (args: {
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

/**
 *
 * @description Takes in the `req` and returns `undefined` if there is no user and returns a `TinaCloudUser` if the user is logged in.
 *
 * @example
 * import { NextApiHandler } from 'next'
 * import { isAuthorized } from '@tinacms/auth'
 * const apiHandler: NextApiHandler = async (req, res) => {
 *   const user = await isAuthorized(req)
 *   if (user && user.verified) {
 *       res.json({
 *         validUser: true,
 *        })
 *       return
 *   } else {
 *     console.log('this user NOT is logged in')
 *     res.json({
 *      validUser: false,
 *      })
 *   }
 *}
 * export default apiHandler
 *
 * @param {NextApiRequest} req - the request. It must contain a req.headers.authorization
 * @param {string} [expectedClientID] - this site's own TinaCloud app id. The token is validated
 *   against this clientID. Falls back to `process.env.NEXT_PUBLIC_TINA_CLIENT_ID`. If neither is
 *   available, authorization is refused.
 *
 */
export const isAuthorized = async (
  req: NextApiRequest,
  expectedClientID?: string
): Promise<TinaCloudUser | undefined> => {
  const token = req.headers.authorization;
  // Validate against the site's configured app id, never a request value.
  const clientID = expectedClientID ?? process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
  if (typeof clientID !== 'string' || clientID.length === 0) {
    console.error(
      "isAuthorized could not resolve this site's clientID. Pass it explicitly (e.g. TinaCloudBackendAuthProvider(process.env.NEXT_PUBLIC_TINA_CLIENT_ID)) or set the NEXT_PUBLIC_TINA_CLIENT_ID env var. Refusing to authorize."
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

/**
 *
 * @description Takes in the `req` and returns `undefined` if there is no user and returns a `TinaCloudUser` if the user is logged in.
 *
 * @example
 * import { NextApiHandler } from 'next'
 * import { isAuthorized } from '@tinacms/auth'
 * const apiHandler: NextApiHandler = async (req, res) => {
 *   const user = await isAuthorized(req)
 *   if (user && user.verified) {
 *       res.json({
 *         validUser: true,
 *        })
 *       return
 *   } else {
 *     console.log('this user NOT is logged in')
 *     res.json({
 *      validUser: false,
 *      })
 *   }
 *}
 * export default apiHandler
 *
 * @param {NextApiRequest} req - the request. It must contain a req.query.org, req.query.clientID and req.headers.authorization
 *
 */
export const isAuthorizedNext = isAuthorized;

export const TinaCloudBackendAuthProvider = (
  clientID: string | undefined = process.env.NEXT_PUBLIC_TINA_CLIENT_ID
) => {
  const backendAuthProvider = {
    isAuthorized: async (req: IncomingMessage, _res: ServerResponse) => {
      const user = await isAuthorized(req as NextApiRequest, clientID);
      if (user && user.verified) {
        return {
          isAuthorized: true as const,
        };
      }
      return {
        isAuthorized: false as const,
        errorCode: 401,
        errorMessage: 'Unauthorized',
      };
    },
  };
  return backendAuthProvider;
};
