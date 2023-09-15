import { LoginStrategy } from '@tinacms/schema-tools'
import { getCsrfToken, getSession, signIn, signOut } from 'next-auth/react'
import { AbstractAuthProvider } from 'tinacms'

export class DefaultNextAuthProvider extends AbstractAuthProvider {
  readonly callbackUrl: string
  readonly name: string
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
  async authenticate(props?: {}): Promise<any> {
    return signIn(this.name, { callbackUrl: this.callbackUrl })
  }
  getToken() {
    return Promise.resolve({ id_token: '' })
  }
  async getUser() {
    return !!(await getSession())
  }
  logout() {
    return signOut({ callbackUrl: this.callbackUrl })
  }
  async authorize(context?: any): Promise<any> {
    return ((await getSession(context))?.user as any).role === 'user'
  }
}

export class UsernamePasswordNextAuthProvider extends DefaultNextAuthProvider {
  async authenticate(props: { username: string; password: string }) {
    const csrfToken = await getCsrfToken()
    // TODO make api baseUrl configurable
    return fetch('/api/auth/callback/credentials', {
      redirect: 'error', //redirect should throw an error
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        csrfToken,
        ...props,
      }).toString(),
    })
      .then((_) => {
        throw new Error('Failed to login')
      })
      .catch((_) => null)
  }

  getLoginStrategy(): LoginStrategy {
    return 'UsernamePassword'
  }
}
