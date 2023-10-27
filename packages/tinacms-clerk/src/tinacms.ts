import { AbstractAuthProvider } from 'tinacms'

import type Clerk from '@clerk/clerk-js'

export class ClerkAuthProvider extends AbstractAuthProvider {
  clerk: Clerk
  allowedList?: string[]
  constructor({
    clerk,
    allowedList,
  }: {
    clerk: Clerk
    /**
     * For premium Clerk users, you can use restrictions
     * https://clerk.com/docs/authentication/allowlist
     */
    allowedList?: string[]
  }) {
    super()
    this.clerk = clerk

    this.allowedList = allowedList
  }
  /**
   * Generates a short-lived token when Tina makes a request
   */
  async getToken() {
    await this.clerk.load()
    if (this.clerk.session) {
      return { id_token: await this.clerk.session.getToken() }
    }
  }

  async logout() {
    await this.clerk.load()
    await this.clerk.session.remove()
  }
  async authenticate() {
    this.clerk.openSignIn({
      redirectUrl: '/admin/index.html', // This should be the Tina admin path
      appearance: {
        elements: {
          // Tina's sign in modal is in the way without this
          modalBackdrop: { zIndex: 20000 },
          // Some styles clash with Tina's styling
          socialButtonsBlockButton: 'px-4 py-2 border border-gray-100',
          formFieldInput: `px-4 py-2`,
          formButtonPrimary: 'bg-blue-600 text-white p-4',
          formFieldInputShowPasswordButton: 'm-2',
          dividerText: 'px-2',
        },
      },
    })
  }
  async authorize(context?: any): Promise<any> {
    await this.clerk.load()
    if (this.clerk.user) {
      if (
        await this.isUserAllowed?.(
          this.clerk.user.primaryEmailAddress.emailAddress
        )
      ) {
        return true
      }
      // Handle when a user is logged in outside of the org
      await this.clerk.session.end()
    }
    return false
  }

  async getUser(): Promise<any> {
    await this.clerk.load()
    return this.clerk.user
  }

  async isUserAllowed(emailAddress: string) {
    if (this.allowedList.includes(emailAddress)) {
      return true
    }
    return false
  }
}
