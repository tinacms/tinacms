import { AbstractAuthProvider } from "tinacms";
class ClerkAuthProvider extends AbstractAuthProvider {
  constructor({
    orgId,
    clerk,
    allowedList
  }) {
    super();
    this.clerk = clerk;
    this.allowedList = allowedList;
    this.orgId = orgId;
  }
  /**
   * Generates a short-lived token when Tina makes a request
   */
  async getToken() {
    await this.clerk.load();
    if (this.clerk.session) {
      return { id_token: await this.clerk.session.getToken() };
    }
  }
  async logout() {
    var _a, _b, _c;
    await ((_a = this.clerk) == null ? void 0 : _a.load());
    await ((_c = (_b = this.clerk) == null ? void 0 : _b.session) == null ? void 0 : _c.remove());
  }
  async authenticate() {
    this.clerk.openSignIn({
      redirectUrl: "/admin/index.html",
      // This should be the Tina admin path
      appearance: {
        elements: {
          // Tina's sign in modal is in the way without this
          modalBackdrop: { zIndex: 2e4 },
          // Some styles clash with Tina's styling
          socialButtonsBlockButton: "px-4 py-2 border border-gray-100",
          formFieldInput: `px-4 py-2`,
          formButtonPrimary: "bg-blue-600 text-white p-4",
          formFieldInputShowPasswordButton: "m-2",
          dividerText: "px-2"
        }
      }
    });
  }
  async authorize(context) {
    await this.clerk.load();
    if (this.clerk.user) {
      if (this.allowedList && !this.allowedList.includes(
        this.clerk.user.primaryEmailAddress.emailAddress
      )) {
        return false;
      }
      if (this.orgId && !this.clerk.user.organizationMemberships.find(
        (x) => x.id === this.orgId
      )) {
        return false;
      }
      return true;
    }
    await this.clerk.session.end();
    return false;
  }
  async getUser() {
    await this.clerk.load();
    return this.clerk.user;
  }
}
export {
  ClerkAuthProvider
};
