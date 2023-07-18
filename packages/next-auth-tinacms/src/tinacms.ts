import { getSession, signIn, signOut } from 'next-auth/react'

export const createTinaNextAuthHandler = (opts: {
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
