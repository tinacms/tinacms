import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'

type DatabaseClient = any

export interface BackendAuthentication {
  isAuthenticated: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<boolean>
  extraRoutes?: {
    [key: string]: {
      isAuthRequired?: boolean
      handler: NextApiHandler
    }
  }
}

export interface TinaBackendOptions {
  databaseClient: DatabaseClient
  authentication: BackendAuthentication
}

export function TinaNextBackend({
  authentication,
  databaseClient,
}: TinaBackendOptions) {
  const { isAuthenticated, extraRoutes } = authentication
  const handler = MakeNextJsApiHandler({
    isAuthenticated,
    extraRoutes,
    databaseClient,
  })
  return handler
}

function MakeNextJsApiHandler({
  isAuthenticated,
  extraRoutes,
  databaseClient,
}: BackendAuthentication & { databaseClient: DatabaseClient }) {
  const handler: NextApiHandler = async (...params) => {
    const [req, res] = params
    const { routes } = req.query
    if (typeof routes === 'string') {
      throw new Error('Please name your next api route [...routes] not [route]')
    }
    if (!routes.length) {
      res.status(404)
      return res.json({ error: 'not found' })
    }
    const allRoutes = {
      gql: {
        handler: async (...params) => {
          if (req.method !== 'POST') {
            res.status(405)
            return res.json({ error: 'method not allowed' })
          }
          const { query, variables } = req.body

          // TODO authorize this request
          const result = await databaseClient.request({
            query,
            variables,
            // @ts-ignore
            user: req?.session?.user,
          })
          return res.json(result)
        },
      },
      ...(extraRoutes || {}),
    }
    const [action, ...rest] = routes

    const currentRoute = allRoutes[action]

    if (!currentRoute) {
      res.status(404)
      return res.json({ error: 'not found' })
    }
    const { handler, isAuthRequired } = currentRoute
    if (isAuthRequired) {
      const isAuth = await isAuthenticated(...params)
      if (!isAuth) {
        res.status(401)
        return res.json({ error: 'unauthorized' })
      }
    }
    return handler(...params)
  }

  return handler
}
