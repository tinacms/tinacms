import { getSession, signIn, signOut } from 'next-auth/react'
import { AbstractAuthProvider } from 'tinacms'

export class NextAuthProvider extends AbstractAuthProvider {
  callbackUrl: string
  name: string
  constructor({
    name = 'Credentials',
    callbackUrl = '/admin/index.html',
  }: {
    name?: string
    callbackUrl?: string
  }) {
    super()
    this.name = name
    this.callbackUrl = callbackUrl
  }
  public authenticate() {
    return signIn(this.name, { callbackUrl: this.callbackUrl })
  }
  getToken() {
    return { id_token: '' }
  }
  async getUser() {
    const session = await getSession()
    return !!session
  }
  logout() {
    return signOut({ callbackUrl: this.callbackUrl })
  }
}
