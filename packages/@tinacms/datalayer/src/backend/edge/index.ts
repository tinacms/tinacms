type DatabaseClient = any

export interface BackendAuthProvider {
  initialize?: () => Promise<void>
  isAuthorized: (req: Request) => Promise<
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
      handler: EdgeRouteHandler
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
export type EdgeApiHandler = (req: Request) => Promise<Response>

type EdgeRouteHandlerOptions = Required<TinaBackendOptions['options']>

type EdgeRouteHandler = (
  req: Request,
  opts: EdgeRouteHandlerOptions
) => Promise<Response>

export function TinaEdgeBackend({
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

  const opts: EdgeRouteHandlerOptions = {
    basePath,
  }
  const handler = MakeEdgeApiHandler({
    isAuthorized,
    extraRoutes,
    databaseClient,
    opts,
  })
  return handler
}

function MakeEdgeApiHandler({
  isAuthorized,
  extraRoutes,
  databaseClient,
  opts,
}: BackendAuthProvider & {
  databaseClient: DatabaseClient
  opts: EdgeRouteHandlerOptions
}) {
  const tinaBackendHandler: EdgeApiHandler = async (req) => {
    // remove leading slash
    const path = req.url?.startsWith('/') ? req.url.slice(1) : req.url

    // The domain is not important here, we just need to parse the pathName
    const url = new URL(
      path,
      `http://${req.headers.get('host') || 'localhost'}`
    )

    // Remove the basePath from the url
    const routes = url.pathname?.replace(opts.basePath, '')?.split('/')

    if (typeof routes === 'string') {
      throw new Error('Please name your next api route [...routes] not [route]')
    }
    if (!routes?.length) {
      console.error(
        `A request was made to ${opts.basePath} but no route was found`
      )

      return new Response(JSON.stringify({ error: 'not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    const allRoutes: BackendAuthProvider['extraRoutes'] = {
      gql: {
        handler: async (req, _opts) => {
          if (req.method !== 'POST') {
            return new Response(
              JSON.stringify({
                error:
                  'Method not allowed. Only POST requests are supported by /gql',
              }),
              {
                status: 405,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            )
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // @ts-ignore
          if (!req.body) {
            return new Response(JSON.stringify({ error: 'no body' }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            })
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // @ts-ignore
          if (!req.body.query) {
            return new Response(JSON.stringify({ error: 'no query' }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            })
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // @ts-ignore
          if (!req.body.variables) {
            return new Response(JSON.stringify({ error: 'no variables' }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            })
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
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          })
        },
        secure: true,
      },
      ...(extraRoutes || {}),
    }

    const [action] = routes

    const currentRoute = allRoutes[action]

    if (!currentRoute) {
      return new Response(
        JSON.stringify({ error: `Error: ${action} not found in routes` }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
    const { handler, secure } = currentRoute
    if (secure) {
      const isAuth = await isAuthorized(req)
      if (isAuth.isAuthorized === false) {
        return new Response(
          JSON.stringify({ error: isAuth.errorMessage || 'not found' }),
          {
            status: isAuth.errorCode,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
    }
    return handler(req, opts)
  }

  return tinaBackendHandler
}
