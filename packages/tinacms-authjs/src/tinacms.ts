import { Collection, LoginStrategy } from '@tinacms/schema-tools'
import {
  getCsrfToken,
  getSession,
  signIn,
  signOut,
  SessionProvider,
} from 'next-auth/react'
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
    const user: any = (await getSession(context))?.user || {}
    return user.role === 'user'
  }

  getSessionProvider() {
    return SessionProvider
  }
}

const errorRegex = /\?error=([^&]*)/
// https://github.com/nextauthjs/next-auth/blob/ce7a49910e2ea8fb98f6f9cfb1b1f307aa3dc46f/packages/next-auth/src/core/pages/signin.tsx#L8
export type SignInErrorTypes =
  | 'Signin'
  | 'OAuthSignin'
  | 'OAuthCallback'
  | 'OAuthCreateAccount'
  | 'EmailCreateAccount'
  | 'Callback'
  | 'OAuthAccountNotLinked'
  | 'EmailSignin'
  | 'CredentialsSignin'
  | 'SessionRequired'
  | 'default'

const errorMap: Record<SignInErrorTypes, string> = {
  Signin: 'Try signing in with a different account.',
  OAuthSignin: 'Try signing in with a different account.',
  OAuthCallback: 'Try signing in with a different account.',
  OAuthCreateAccount: 'Try signing in with a different account.',
  EmailCreateAccount: 'Try signing in with a different account.',
  Callback: 'Try signing in with a different account.',
  OAuthAccountNotLinked:
    'To confirm your identity, sign in with the same account you used originally.',
  EmailSignin: 'The e-mail could not be sent.',
  CredentialsSignin:
    'Sign in failed. Check the details you provided are correct.',
  SessionRequired: 'Please sign in to access this page.',
  default: 'Unable to sign in.',
}

export class UsernamePasswordAuthJSProvider extends DefaultAuthJSProvider {
  async authenticate(props: { username: string; password: string }) {
    const csrfToken = await getCsrfToken()
    const baseUrl = process.env.NEXTAUTH_URL || ''
    const url = baseUrl
      ? `${baseUrl}/auth/callback/credentials`
      : '/api/tina/auth/callback/credentials'
    return fetch(url, {
      redirect: 'error', //redirect should throw an error
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        csrfToken,
        redirect: 'false',
        json: 'true',
        ...props,
      }).toString(),
    })
      .then(async (res) => {
        const { url } = await res.json()
        if (!url) {
          throw new Error('Unexpected error on login')
        }
        // extract error message from url
        const error = url.match(errorRegex)?.[1]
        if (error) {
          if (error in errorMap) {
            throw errorMap[error as SignInErrorTypes]
          } else {
            throw errorMap['default']
          }
        }
      })
      .catch((err) => {
        throw err
      })
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
