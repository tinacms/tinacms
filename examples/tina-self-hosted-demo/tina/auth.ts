import { createAuthJSApiRoute, TinaAuthJSOptions } from 'tinacms-authjs'
import databaseClient from './__generated__/databaseClient'

export const AuthJsOptions = TinaAuthJSOptions({
  databaseClient: databaseClient,
  secret: process.env.NEXTAUTH_SECRET,
})

export default createAuthJSApiRoute({
  opts: {
    authOptions: AuthJsOptions,
    disabled: process.env.TINA_PUBLIC_IS_LOCAL === 'true',
  },
})
