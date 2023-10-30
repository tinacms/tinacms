import { AbstractAuthProvider } from 'tinacms'

import type Clerk from '@clerk/clerk-js'

export class ClerkAuthProvider extends AbstractAuthProvider {
  clerk: Clerk
  allowedList?: string[]
  orgId?: string
  constructor({
    orgId,
    clerk,
    allowedList,
  }: {
    clerk: Clerk
    /**
     * For premium Clerk users, you can use restrictions
     * https://clerk.com/docs/authentication/allowlist
     */
    allowedList?: string[]
    // Ensure the user is a member of an the provided orgId
    orgId?: string
  }) {
    super()
    this.clerk = clerk

    this.allowedList = allowedList
    this.orgId = orgId
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
    await this.clerk?.load()
    await this.clerk?.session?.remove()
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
        this.allowedList &&
        !this.allowedList.includes(
          this.clerk.user.primaryEmailAddress.emailAddress
        )
      ) {
        // if there is an allowList, and the user is not in it, return false
        return false
      }

      if (
        this.orgId &&
        !this.clerk.user.organizationMemberships.find(
          (x) => x.id === this.orgId
        )
      ) {
        // if there is an orgId, and the user is not in it, return false
        return false
      }

      return true
    }
    // Handle when a user is logged in outside of the org
    await this.clerk.session.end()
    return false
  }

  async getUser(): Promise<any> {
    await this.clerk.load()
    return this.clerk.user
  }
}
