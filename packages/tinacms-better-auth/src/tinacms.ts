import { AbstractAuthProvider } from 'tinacms';

/**
 * Minimal type for the Better Auth client used by BetterAuthProvider.
 * Matches the public API from createAuthClient() (better-auth/react or better-auth/client).
 */
export interface BetterAuthClient {
  getSession: () => Promise<{ data: { user: unknown; session: unknown } | null }>;
  signOut: (options?: { callbackURL?: string }) => Promise<unknown>;
  signIn: {
    email?: (options: {
      email: string;
      password: string;
      callbackURL?: string;
    }) => Promise<unknown>;
    social?: (options: { provider: string; callbackURL?: string }) => Promise<unknown>;
  };
}

export interface BetterAuthProviderOptions {
  /** Better Auth client instance from createAuthClient() (e.g. from lib/auth-client.ts) */
  authClient: BetterAuthClient;
  /** URL to redirect to after login (default: /admin/index.html) */
  callbackUrl?: string;
  /**
   * Optional custom authorization. Called when user is authenticated; return truthy to allow access.
   * Default: any authenticated user is authorized.
   */
  authorize?: (user: unknown) => Promise<boolean> | boolean;
}

export class BetterAuthProvider extends AbstractAuthProvider {
  private readonly authClient: BetterAuthClient;
  private readonly callbackUrl: string;
  private readonly authorizeFn?: (user: unknown) => Promise<boolean> | boolean;

  constructor(options: BetterAuthProviderOptions) {
    super();
    this.authClient = options.authClient;
    this.callbackUrl = options.callbackUrl ?? '/admin/index.html';
    this.authorizeFn = options.authorize;
  }

  authenticate = async (): Promise<void> => {
    // Redirect to callback URL; the app should serve a login page there that uses authClient.signIn.*
    if (typeof window !== 'undefined') {
      window.location.href = this.callbackUrl;
    }
  };

  getToken = async (): Promise<{ id_token: string }> => {
    // Better Auth uses cookies for same-origin requests; backend validates via auth.api.getSession(headers)
    return { id_token: '' };
  };

  getUser = async (): Promise<unknown> => {
    const { data } = await this.authClient.getSession();
    return data?.user ?? null;
  };

  logout = async (): Promise<void> => {
    await this.authClient.signOut({ callbackURL: this.callbackUrl });
  };

  authorize = async (): Promise<unknown> => {
    const user = await this.getUser();
    if (!user) return null;
    if (this.authorizeFn) {
      const allowed = await this.authorizeFn(user);
      return allowed ? user : null;
    }
    return user;
  };
}
