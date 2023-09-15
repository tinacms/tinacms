import NextAuth from 'next-auth'
import { TinaNextAuthOptions } from 'tinacms-next-auth'
import databaseClient from '../../../tina/__generated__/databaseClient'

export default async function handler(...params: any[]) {
  await NextAuth(
    TinaNextAuthOptions({ databaseClient, secret: process.env.NEXTAUTH_SECRET })
  )(...params)
}
