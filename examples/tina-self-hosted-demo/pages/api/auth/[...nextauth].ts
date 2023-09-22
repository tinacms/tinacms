import NextAuth from 'next-auth'
import { TinaAuthJSOptions } from 'tinacms-authjs'
import databaseClient from '../../../tina/__generated__/databaseClient'

export default async function handler(...params: any[]) {
  await NextAuth(
    TinaAuthJSOptions({ databaseClient, secret: process.env.NEXTAUTH_SECRET })
  )(...params)
}
