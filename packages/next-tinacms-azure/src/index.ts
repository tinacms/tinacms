import { TinaCloudUser } from '@tinacms/auth'
import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

export * from './azure-media-store'
export * from './azure-tina-cloud-media-store'

const isUserAuthorized = async (args: {
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

export const isAuthorized = async (
  req: NextRequest
): Promise<TinaCloudUser | undefined> => {
  const clientID = req.nextUrl.searchParams.get('clientID')
  const token = (await headers()).get('authorization')
  if (typeof clientID === 'string' && typeof token === 'string') {
    return await isUserAuthorized({ clientID, token })
  }
  const errorMessage = (queryParam: string) => {
    return `An ${queryParam} query param is required for isAuthorized function but not found please use cms.api.tina.fetchWithToken('/api/something?clientID=YourClientID')`
  }
  if (!clientID) console.error(errorMessage('clientID'))
  if (!token)
    console.error(
      'A authorization header was not found. Please use the cms.api.tina.fetchWithToken function on the frontend'
    )
  return undefined
}
