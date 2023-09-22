import { Collection, LoginStrategy } from '@tinacms/schema-tools'
import { getCsrfToken, getSession, signIn, signOut } from 'next-auth/react'
import { AbstractAuthProvider } from 'tinacms'

export class DefaultAuthJSProvider extends AbstractAuthProvider {
  readonly callbackUrl: string
  readonly name: string
  constructor(props?: { name?: string; callbackUrl?: string }) {
    super()
    this.name = props?.name || 'Credentials'
    this.callbackUrl = props?.callbackUrl || '/admin/index.html'
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

export class UsernamePasswordAuthJSProvider extends DefaultAuthJSProvider {
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

export const TinaUserCollection: Collection = {
  ui: {
    global: true,
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  isAuthCollection: true,
  isDetached: true,
  label: 'Users',
  name: 'user',
  path: 'content/users',
  format: 'json',
  fields: [
    {
      type: 'object',
      name: 'users',
      list: true,
      ui: {
        defaultItem: {
          username: 'new-user',
          name: 'New User',
          password: '',
        },
        itemProps: (item) => ({ label: item?.username }),
      },
      fields: [
        {
          type: 'string',
          label: 'Username',
          name: 'username',
          uid: true,
          required: true,
        },
        {
          type: 'string',
          label: 'Name',
          name: 'name',
        },
        {
          type: 'string',
          label: 'Email',
          name: 'email',
        },
        {
          type: 'password',
          label: 'Password',
          name: 'password',
          required: true,
        },
      ],
    },
  ],
}
