import { TinaNodeBackend } from '@tinacms/datalayer/dist/node'
import { TinaAuthJSOptions, NextAuthAuthentication } from 'tinacms-authjs'

import databaseClient from '../../../tina/__generated__/databaseClient'

export const nextAuthOptions = TinaAuthJSOptions({
  databaseClient: databaseClient,
  secret: process.env.NEXTAUTH_SECRET,
})

const tinaNodeBackend = TinaNodeBackend({
  authentication: NextAuthAuthentication({ nextAuthOptions }),
  databaseClient,
})

export default tinaNodeBackend
