import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth/next'

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
  overrides,
  secret,
  providers,
}: {
  databaseClient: any // TODO can we type this?
  overrides?: AuthOptions
  providers?: AuthOptions['providers']
  secret: string
}): AuthOptions => ({
  callbacks: {
    jwt: async ({ token: jwt, account }) => {
      if (account) {
        // first time logging in
        try {
          jwt.role =
            jwt.sub && (await databaseClient.authorize({ sub: jwt.sub }))
              ? 'user'
              : 'guest'
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
      ;(session.user as any).sub = jwt.sub
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

export {
  TinaCredentialsProvider,
  TinaAuthJSOptions,
  withAuthJSApiRoute,
  // TODO: This probably needs a better name?
  createAuthJSApiRoute,
}
