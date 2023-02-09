/**

*/

import type { NextApiRequest } from 'next'

import fetchPonyfill from 'fetch-ponyfill'

const { fetch, Headers } = fetchPonyfill()

export interface TinaCloudUser {
  id: string
  email: string
  verified: boolean
  role: 'admin' | 'user'
  enabled: boolean
  fullName: string
}

export const isUserAuthorized = async (args: {
  clientID: string
  token: string
}): Promise<TinaCloudUser | undefined> => {
  const clientID = args.clientID
  const token = args.token
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
    )
    if (tinaCloudRes.ok) {
      const user: TinaCloudUser = await tinaCloudRes.json()
      return user
    }
    return
  } catch (e) {
    console.error(e)
    throw e
  }
}

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
export const isAuthorized = async (
  req: NextApiRequest
): Promise<TinaCloudUser | undefined> => {
  const clientID = req.query.clientID
  const token = req.headers.authorization
  if (typeof clientID === 'string' && typeof token === 'string') {
    return await isUserAuthorized({ clientID, token })
  }
  const errorMessage = (queryParam: string) => {
    return `An ${queryParam} query param is required for isAuthorized function but not found please use cms.api.tina.fetchWithToken('/api/something?clientID=YourClientID')`
  }
  !clientID && console.error(errorMessage('clientID'))
  !token &&
    console.error(
      'A authorization header was not found. Please use the cms.api.tina.fetchWithToken function on the frontend'
    )
  return undefined
}

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
export const isAuthorizedNext = isAuthorized
