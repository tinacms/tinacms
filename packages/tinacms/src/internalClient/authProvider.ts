import { AuthProvider, LoginStrategy } from "@tinacms/schema-tools";
import {
  AUTH_TOKEN_KEY,
  TokenObject,
  authenticate,
} from "../auth/authenticate";
import DefaultSessionProvider from "../auth/defaultSessionProvider";

type Input = Parameters<AuthProvider["fetchWithToken"]>[0];
type Init = Parameters<AuthProvider["fetchWithToken"]>[1];
type FetchReturn = ReturnType<AuthProvider["fetchWithToken"]>;

export abstract class AbstractAuthProvider implements AuthProvider {
  /**
   * Wraps the normal fetch function with same API but adds the authorization header token.
   *
   * @example
   * const test = await tinaCloudClient.fetchWithToken(`/mycustomAPI/thing/one`) // the token will be passed in the authorization header
   *
   * @param input fetch function input
   * @param init fetch function init
   */
  async fetchWithToken(input: Input, init: Init): FetchReturn {
    const headers = init?.headers || {};
    const token = await this.getToken();
    if (token?.id_token) {
      headers["Authorization"] = "Bearer " + token?.id_token;
    }
    return await fetch(input, {
      ...(init || {}),
      headers: new Headers(headers),
    });
  }

  async authorize(context?: any): Promise<any> {
    // by default, the existence of a token is enough to be authorized
    return this.getToken();
  }
  async isAuthorized(context?: any): Promise<boolean> {
    return !!(await this.authorize(context));
  }

  async isAuthenticated(): Promise<boolean> {
    return !!(await this.getUser());
  }

  getLoginStrategy(): LoginStrategy {
    return "Redirect";
  }

  /**
   * A React component that renders the custom UI for the login screen.
   * Set the LoginStrategy to LoginScreen when providing this function.
   */
  getLoginScreen() {
    return null;
  }

  getSessionProvider() {
    return DefaultSessionProvider;
  }

  abstract getToken();
  abstract getUser();
  abstract logout();
  abstract authenticate(props?: Record<string, string>);
}

export class TinaCloudAuthProvider extends AbstractAuthProvider {
  clientId: string;
  identityApiUrl: string;
  frontendUrl: string;
  oauth2: boolean;
  token: string; // used with memory storage
  setToken: (_token: TokenObject) => void;
  getToken: () => Promise<TokenObject>;

  constructor({
    clientId,
    identityApiUrl,
    tokenStorage = "MEMORY",
    frontendUrl,
    ...options
  }: {
    clientId: string;
    identityApiUrl: string;
    tokenStorage?: "MEMORY" | "LOCAL_STORAGE" | "CUSTOM";
    getTokenFn?: () => Promise<TokenObject>;
    frontendUrl: string;
    oauth2?: boolean;
  }) {
    super();
    this.frontendUrl = frontendUrl;
    this.clientId = clientId;
    this.identityApiUrl = identityApiUrl;
    this.oauth2 = options.oauth2 || false;
    switch (tokenStorage) {
      case "LOCAL_STORAGE":
        this.getToken = async function () {
          const tokens = localStorage.getItem(AUTH_TOKEN_KEY) || null;
          if (tokens) {
            return await this.getRefreshedToken(tokens);
          } else {
            return {
              access_token: null,
              id_token: null,
              refresh_token: null,
            };
          }
        };
        this.setToken = function (token) {
          localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token, null, 2));
        };
        break;
      case "MEMORY":
        this.getToken = async () => {
          if (this.token) {
            return await this.getRefreshedToken(this.token);
          } else {
            return {
              access_token: null,
              id_token: null,
              refresh_token: null,
            };
          }
        };
        this.setToken = (token) => {
          this.token = JSON.stringify(token, null, 2);
        };
        break;
      case "CUSTOM":
        if (!options.getTokenFn) {
          throw new Error(
            "When CUSTOM token storage is selected, a getTokenFn must be provided"
          );
        }
        this.getToken = options.getTokenFn;
        break;
    }
  }
  async authenticate() {
    // get query parameters
    const params = new URLSearchParams(window.location.search);
    console.log({ params });
    const code = params.get("code");
    const state = params.get("state");
    // const error = params.get("error");
    // const scope = params.get("scope");
    const codeVerifier = localStorage.getItem("code_verifier");
    // implement state check
    console.log({
      code,
      state,
      codeVerifier,
    });

    if (code && state && codeVerifier) {
      const origin = `${window.location.protocol}//${window.location.host}`;
      const redirectUri = encodeURIComponent(`${origin}/admin`);
      const tokenUrl = `${this.identityApiUrl}/oauth2/${this.clientId}/token`;
      console.log("Token URL:", tokenUrl);
      await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
          client_id: this.clientId,
          code_verifier: localStorage.getItem("code_verifier"),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Token exchange response:", data);
          this.setToken(data);
        })
        .catch((error) => {
          console.error("Error during token exchange:", error);
        });
    } else {
      const token = await authenticate(
        this.clientId,
        this.frontendUrl,
        this.oauth2
      );
      this.setToken(token);
    }

    return this.getToken();
  }

  async getUser() {
    if (!this.clientId) {
      return null;
    }

    const url = `${this.identityApiUrl}/v2/apps/${this.clientId}/currentUser`;

    try {
      const res = await this.fetchWithToken(url, {
        method: "GET",
      });
      const val = await res.json();
      if (!res.status.toString().startsWith("2")) {
        console.error(val.error);
        return null;
      }
      return val;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  async logout() {
    this.setToken(null);
  }

  async getRefreshedToken(tokens: string): Promise<TokenObject> {
    const { access_token, id_token, refresh_token } = JSON.parse(tokens);
    const { exp, iss, client_id } = this.parseJwt(access_token);

    // if the token is going to expire within the next two minutes, refresh it now
    if (Date.now() / 1000 >= exp - 120) {
      const refreshResponse = await fetch(iss, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "x-amz-target": "AWSCognitoIdentityProviderService.InitiateAuth",
        },
        body: JSON.stringify({
          ClientId: client_id,
          AuthFlow: "REFRESH_TOKEN_AUTH",
          AuthParameters: {
            REFRESH_TOKEN: refresh_token,
            DEVICE_KEY: null,
          },
        }),
      });

      if (refreshResponse.status !== 200) {
        throw new Error("Unable to refresh auth tokens");
      }

      const responseJson = await refreshResponse.json();
      const newToken = {
        access_token: responseJson.AuthenticationResult.AccessToken,
        id_token: responseJson.AuthenticationResult.IdToken,
        refresh_token,
      };
      this.setToken(newToken);

      return Promise.resolve(newToken);
    }

    return Promise.resolve({ access_token, id_token, refresh_token });
  }
  parseJwt(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  }
}

const LOCAL_CLIENT_KEY = "tina.local.isLogedIn";

export class LocalAuthProvider extends AbstractAuthProvider {
  constructor() {
    super();
  }

  async authenticate() {
    localStorage.setItem(LOCAL_CLIENT_KEY, "true");
    return { access_token: "LOCAL", id_token: "LOCAL", refresh_token: "LOCAL" };
  }

  async getUser(): Promise<boolean> {
    return localStorage.getItem(LOCAL_CLIENT_KEY) === "true";
  }
  async getToken() {
    return Promise.resolve({ id_token: "" });
  }
  async logout() {
    localStorage.removeItem(LOCAL_CLIENT_KEY);
  }
}
