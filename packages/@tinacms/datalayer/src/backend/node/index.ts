import type { IncomingMessage, ServerResponse } from 'http'

type DatabaseClient = any

export interface BackendAuthProvider {
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
      handler: NodeRouteHandler
    }
  }
}
export const LocalBackendAuthProvider = () =>
  ({
    isAuthorized: async () => ({ isAuthorized: true }),
  } as BackendAuthProvider)

export interface TinaBackendOptions {
  /**
   * The database client to use. Imported from tina/__generated__/databaseClient
   */
  databaseClient: DatabaseClient
  /**
   * The auth provider to use
   */
  authProvider: BackendAuthProvider
  /**
   * Options to configure the backend
   */
  options?: {
    /**
     *  The base path for the api routes (defaults to /api/tina)
     *
     * @default /api/tina
     */
    basePath?: string
  }
}
export type NodeApiHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<void>

type NodeRouteHandlerOptions = Required<TinaBackendOptions['options']>

type NodeRouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  opts: NodeRouteHandlerOptions
) => Promise<void>

export function TinaNodeBackend({
  authProvider,
  databaseClient,
  options,
}: TinaBackendOptions) {
  const { initialize, isAuthorized, extraRoutes } = authProvider
  initialize?.().catch((e) => {
    console.error(e)
  })
  const basePath = options?.basePath
    ? `/${options.basePath.replace(/^\/?/, '').replace(/\/?$/, '')}/`
    : '/api/tina/'

  const opts: NodeRouteHandlerOptions = {
    basePath,
  }
  const handler = MakeNodeApiHandler({
    isAuthorized,
    extraRoutes,
    databaseClient,
    opts,
  })
  return handler
}

function MakeNodeApiHandler({
  isAuthorized,
  extraRoutes,
  databaseClient,
  opts,
}: BackendAuthProvider & {
  databaseClient: DatabaseClient
  opts: NodeRouteHandlerOptions
}) {
  const tinaBackendHandler: NodeApiHandler = async (req, res) => {
    // remove leading slash
    const path = req.url?.startsWith('/') ? req.url.slice(1) : req.url

    // The domain is not important here, we just need to parse the pathName
    const url = new URL(path, `http://${req.headers?.host || 'localhost'}`)

    // Remove the basePath from the url
    const routes = url.pathname?.replace(opts.basePath, '')?.split('/')

    if (typeof routes === 'string') {
      throw new Error('Please name your next api route [...routes] not [route]')
    }
    if (!routes?.length) {
      console.error(
        `A request was made to ${opts.basePath} but no route was found`
      )
      res.statusCode = 404
      res.write(JSON.stringify({ error: 'not found' }))
      res.end()
      return
    }

    const allRoutes: BackendAuthProvider['extraRoutes'] = {
      gql: {
        handler: async (req, res, _opts) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.write(
              JSON.stringify({
                error:
                  'Method not allowed. Only POST requests are supported by /gql',
              })
            )
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
        secure: true,
      },
      ...(extraRoutes || {}),
    }

    const [action] = routes

    const currentRoute = allRoutes[action]

    if (!currentRoute) {
      res.statusCode = 404
      const errorMessage = `Error: ${action} not found in routes`
      console.error(errorMessage)
      res.write(JSON.stringify({ error: errorMessage }))
      res.end()
      return
    }
    const { handler, secure } = currentRoute
    if (secure) {
      const isAuth = await isAuthorized(req, res)
      if (isAuth.isAuthorized === false) {
        res.statusCode = isAuth.errorCode
        res.write(JSON.stringify({ error: isAuth.errorMessage || 'not found' }))
        res.end()
        return
      }
    }
    return handler(req, res, opts)
  }

  return tinaBackendHandler
}
