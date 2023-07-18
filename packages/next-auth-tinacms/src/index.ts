import { NextApiHandler } from 'next'
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth/next'
import { RedisUserStore } from './redis-user-store'
import { checkPassword } from './utils'
import { UserStore } from './types'
import { getSession, signIn, signOut } from 'next-auth/react'

const withNextAuthApiRoute = (
  handler: NextApiHandler,
  opts?: { authOptions: AuthOptions; isLocalDevelopment: boolean }
) => {
  return async (req, res) => {
    if (opts?.isLocalDevelopment) {
      Object.defineProperty(req, 'session', {
        value: {
          user: {
            name: 'local',
          },
        },
        writable: false,
      })
    }
    const session = await getServerSession(req, res, opts?.authOptions)
    Object.defineProperty(req, 'session', {
      value: session,
      writable: false,
    })

    if (!session?.user?.name) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    return handler(req, res)
  }
}

const TinaCredentialsProvider = (opts: {
  name?: string
  credentials?: {
    username: { label: string; type: string; placeholder: string }
    password: { label: string; type: string }
  }
  userStore: UserStore
}) =>
  CredentialsProvider({
    name: opts.name || 'Credentials',
    credentials: opts.credentials || {
      username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      try {
        const user = await opts.userStore.getUser(credentials.username)
        if (user) {
          if (await checkPassword(credentials.password, user.password)) {
            return user
          }
        }
      } catch (e) {
        console.error(e)
      }
      return null
    },
  })

const createTinaNextAuthHandler = (opts: {
  isLocalDevelopment: boolean
  name?: string
  callbackUrl?: string
}) => {
  const name = opts.name || 'Credentials'
  const callbackUrl = opts.callbackUrl || '/admin/index.html'
  return {
    authenticate: async () => {
      if (opts.isLocalDevelopment) {
        return true
      }
      return signIn(name, { callbackUrl })
    },
    getToken: async () => {
      return { id_token: '' }
    },
    getUser: async () => {
      if (opts.isLocalDevelopment) {
        return true
      }
      const session = await getSession()
      return !!session
    },
    logout: async () => {
      if (opts.isLocalDevelopment) {
        return
      }
      return signOut({ callbackUrl })
    },
  }
}

export {
  createTinaNextAuthHandler,
  RedisUserStore,
  TinaCredentialsProvider,
  withNextAuthApiRoute,
}

export type { UserStore }
