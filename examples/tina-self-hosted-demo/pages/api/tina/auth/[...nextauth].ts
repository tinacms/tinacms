import NextAuth from 'next-auth'
import { AuthJsOptions } from '../../../../tina/auth'

export default async function handler(...params: any[]) {
  await NextAuth(AuthJsOptions)(...params)
}
