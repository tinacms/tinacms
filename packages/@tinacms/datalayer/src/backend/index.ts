import type { IncomingMessage, ServerResponse } from 'http'

type NodeApiHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<void>

type DatabaseClient = any

export interface BackendAuthentication {
  initialize?: () => Promise<void>
  isAuthorized: (
    req: IncomingMessage,
    res: ServerResponse
  ) => Promise<
    | {
        isAuthorized: true
      }
    | {
        isAuthorized: false
        errorMessage: string
        errorCode: number
      }
  >
  extraRoutes?: {
    [key: string]: {
      secure?: boolean
      handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>
    }
  }
}
export const LocalBackendAuthentication = () =>
  ({
    isAuthorized: async () => ({ isAuthorized: true }),
  } as BackendAuthentication)

export interface TinaBackendOptions {
  databaseClient: DatabaseClient
  authentication: BackendAuthentication
}

export function TinaNodeBackend({
  authentication,
  databaseClient,
}: TinaBackendOptions) {
  const { initialize, isAuthorized, extraRoutes } = authentication
  initialize?.().catch((e) => {
    console.error(e)
  })
  const handler = MakeNodeApiHandler({
    isAuthorized,
    extraRoutes,
    databaseClient,
  })
  return handler
}

function MakeNodeApiHandler({
  isAuthorized,
  extraRoutes,
  databaseClient,
}: BackendAuthentication & { databaseClient: DatabaseClient }) {
  const handler: NodeApiHandler = async (...params) => {
    const [req, res] = params
    // remove leading slash
    const url = req?.url?.startsWith('/') ? req.url.slice(1) : req.url
    const paths = url?.split('/')
    const routes = paths?.filter((p) => p !== 'api' && p !== 'tina')
    if (typeof routes === 'string') {
      throw new Error('Please name your next api route [...routes] not [route]')
    }
    if (!routes?.length) {
      res.statusCode = 404
      res.write(JSON.stringify({ error: 'not found' }))
      res.end()
      return
    }
    const allRoutes: BackendAuthentication['extraRoutes'] = {
      gql: {
        handler: async (...params) => {
          const [req, res] = params
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.write(JSON.stringify({ error: 'method not allowed' }))
            res.end()
            return
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // @ts-ignore
          if (!req.body) {
            console.error(
              'Please make sure that you have a body parser set up for your server and req.body is defined'
            )
            res.statusCode = 400
            res.write(JSON.stringify({ error: 'no body' }))
            res.end()
            return
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // @ts-ignore
          if (!req.body.query) {
            res.statusCode = 400
            res.write(JSON.stringify({ error: 'no query' }))
            res.end()
            return
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // @ts-ignore
          if (!req.body.variables) {
            res.statusCode = 400
            res.write(JSON.stringify({ error: 'no variables' }))
            res.end()
            return
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // @ts-ignore
          const { query, variables } = req.body

          const result = await databaseClient.request({
            query,
            variables,
            // @ts-ignore
            user: req?.session?.user,
          })
          res.statusCode = 200
          res.write(JSON.stringify(result))
          res.end()
          return
        },
      },
      ...(extraRoutes || {}),
    }
    const [action] = routes

    const currentRoute = allRoutes[action]

    if (!currentRoute) {
      res.statusCode = 404
      res.write(JSON.stringify({ error: 'not found' }))
      res.end()
      return
    }
    const { handler, secure } = currentRoute
    if (secure) {
      const isAuth = await isAuthorized(...params)
      if (isAuth.isAuthorized === false) {
        res.statusCode = isAuth.errorCode
        res.write(JSON.stringify({ error: isAuth.errorMessage || 'not found' }))
        res.end()
        return
      }
    }
    return handler(...params)
  }

  return handler
}
