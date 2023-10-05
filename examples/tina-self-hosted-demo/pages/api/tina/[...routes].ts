import {
  TinaNodeBackend,
  LocalAuthentication,
} from '@tinacms/datalayer/dist/node'
import { TinaAuthJSOptions, NextAuthAuthentication } from 'tinacms-authjs'

import databaseClient from '../../../tina/__generated__/databaseClient'

export const nextAuthOptions = TinaAuthJSOptions({
  databaseClient: databaseClient,
  secret: process.env.NEXTAUTH_SECRET,
})
const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

const tinaNodeBackend = TinaNodeBackend({
  authentication: isLocal
    ? LocalAuthentication()
    : NextAuthAuthentication({ nextAuthOptions }),
  databaseClient,
})

export default tinaNodeBackend
