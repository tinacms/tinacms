import { NextApiHandler } from 'next'
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth/next'

const authenticate = async (
  databaseClient: any,
  username: string,
  password: string
) => {
  try {
    const result = await databaseClient.request({
      query: `query auth($username:String!, $password:String!) {
              authenticate(sub:$username, password:$password) {
                name
                email
                _sys {
                  filename
                }
              }
            }`,
      variables: { username, password },
    })
    if (result.data) {
      return {
        id: result.data?.authenticate?._sys?.filename,
        name: result.data?.authenticate?.name,
        email: result.data?.authenticate?.email,
      }
    }
  } catch (e) {
    console.error(e)
  }
  return null
}

const isAuthorized = async (databaseClient: any, username: string) => {
  try {
    const result = await databaseClient.request({
      query: `query authz($username:String!) { authorize(sub:$username) { name } }`,
      variables: { username },
    })
    return !!result?.data?.authorize
  } catch (e) {
    console.error(e)
  }
  return false
}

const TinaNextAuthOptions = ({
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
            jwt.sub && (await isAuthorized(databaseClient, jwt.sub))
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
  providers: providers || [
    TinaCredentialsProvider({ name: 'Credentials', databaseClient }),
  ],
  ...overrides,
})

const withNextAuthApiRoute = (
  handler: NextApiHandler,
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
  name: string
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

export { TinaCredentialsProvider, TinaNextAuthOptions, withNextAuthApiRoute }
