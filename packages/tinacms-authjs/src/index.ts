import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth/next'
import type { BackendAuthentication } from '@tinacms/datalayer/dist/node'

const authenticate = async (
  databaseClient: any,
  username: string,
  password: string
) => {
  try {
    const result = await databaseClient.authenticate({ username, password })
    return result.data?.authenticate || null
  } catch (e) {
    console.error(e)
  }
  return null
}

const TinaAuthJSOptions = ({
  databaseClient,
  uidProp = 'sub',
  debug = false,
  overrides,
  secret,
  providers,
}: {
  databaseClient: any // TODO can we type this?
  uidProp?: string
  debug?: boolean
  overrides?: AuthOptions
  providers?: AuthOptions['providers']
  secret: string
}): AuthOptions => ({
  callbacks: {
    jwt: async ({ token: jwt, account }) => {
      if (account) {
        if (debug) {
          console.table(jwt)
        }
        // only set for newly created jwts
        try {
          if (jwt?.[uidProp]) {
            const sub = jwt[uidProp]
            const result = await databaseClient.authorize({ sub })
            jwt.role = !!result.data?.authorize ? 'user' : 'guest'
          } else if (debug) {
            console.log(`jwt missing specified uidProp: ${uidProp}`)
          }
        } catch (error) {
          console.log(error)
        }
        if (jwt.role === undefined) {
          jwt.role = 'guest'
        }
      }
      return jwt
    },
    session: async ({ session, token: jwt }) => {
      // forward the role to the session
      ;(session.user as any).role = jwt.role
      ;(session.user as any)[uidProp] = jwt[uidProp]
      return session
    },
  },
  session: { strategy: 'jwt' },
  secret,
  providers: providers || [TinaCredentialsProvider({ databaseClient })],
  ...overrides,
})

const createAuthJSApiRoute = (args?: {
  authOptions: AuthOptions
  disabled: boolean
}) => {
  return (handler: (req, res) => unknown | Promise<unknown>) => {
    return withAuthJSApiRoute(handler, args)
  }
}

const withAuthJSApiRoute = (
  handler: (req, res) => unknown | Promise<unknown>,
  opts?: { authOptions: AuthOptions; disabled: boolean }
) => {
  return async (req, res) => {
    if (opts?.disabled) {
      if (!req.session?.user?.name) {
        Object.defineProperty(req, 'session', {
          value: {
            user: {
              name: 'local',
              role: 'user',
            },
          },
          writable: false,
        })
      }
    } else {
      const session = await getServerSession(req, res, opts?.authOptions)
      if (!req.session) {
        Object.defineProperty(req, 'session', {
          value: session,
          writable: false,
        })
      }

      if (!session?.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      if ((session?.user as any).role !== 'user') {
        return res.status(403).json({ error: 'Forbidden' })
      }
    }

    return handler(req, res)
  }
}

const TinaCredentialsProvider = ({
  databaseClient,
  name = 'Credentials',
}: {
  databaseClient: any // TODO can we type this?
  name?: string
}) =>
  CredentialsProvider({
    name,
    credentials: {
      username: { label: 'Username', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    authorize: async (credentials) =>
      authenticate(databaseClient, credentials.username, credentials.password),
  })

const NextAuthAuthentication = ({
  nextAuthOptions,
}: {
  nextAuthOptions: AuthOptions
}) => {
  const nextBackendAuthentication: BackendAuthentication = {
    isAuthorized: async (req, res) => {
      // @ts-ignore
      const session = await getServerSession(req, res, nextAuthOptions)

      // @ts-ignore
      if (!req.session) {
        Object.defineProperty(req, 'session', {
          value: session,
          writable: false,
        })
      }

      if (!session?.user) {
        return {
          errorCode: 401,
          errorMessage: 'Unauthorized',
          isAuthorized: false,
        }
      }
      if ((session?.user as any).role !== 'user') {
        return {
          errorCode: 403,
          errorMessage: 'Forbidden',
          isAuthorized: false,
        }
      }
      return { isAuthorized: true }
    },
    extraRoutes: {
      auth: {
        isAuthRequired: false,
        handler: async (req, res) => {
          // @ts-ignore
          const { routes } = req.query
          const [, ...rest] = routes
          // @ts-ignore
          req.query.nextauth = rest
          NextAuth(nextAuthOptions)(req, res)
        },
      },
    },
  }
  return nextBackendAuthentication
}
export {
  TinaCredentialsProvider,
  TinaAuthJSOptions,
  withAuthJSApiRoute,
  NextAuthAuthentication,
  // TODO: This probably needs a better name?
  createAuthJSApiRoute,
}
