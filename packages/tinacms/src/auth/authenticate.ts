/**

*/

import popupWindow from "./popupWindow";

const TINA_LOGIN_EVENT = "tinaCloudLogin";
export const AUTH_TOKEN_KEY = "tinacms-auth";

// Helper function to generate a random string
const generateRandomString = (length) => {
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (dec) => ("0" + dec.toString(16)).slice(-2)).join(
    ""
  );
};

// Helper function to generate a code challenge
const generateCodeChallenge = async (codeVerifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export type TokenObject = {
  id_token: string;
  access_token?: string;
  refresh_token?: string;
};
export const authenticate = (
  clientId: string,
  frontendUrl: string,
  oauth2?: boolean
): Promise<TokenObject> => {
  return new Promise(async (resolve) => {
    const origin = `${window.location.protocol}//${window.location.host}`;
    if (oauth2) {
      // Generate a code verifier and code challenge
      const codeVerifier = generateRandomString(32);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Save the code verifier in localStorage
      localStorage.setItem("code_verifier", codeVerifier);

      const redirectUri = encodeURIComponent(`${origin}/admin/auth/callback`);
      window.location.href = `${frontendUrl}/oauth-signin?redirect_uri=${redirectUri}&code_challenge=${codeChallenge}&client_id=${clientId}`;
      return;
    }
    const authTab = popupWindow(
      `${frontendUrl}/signin?clientId=${clientId}&origin=${origin}`,
      "_blank",
      window,
      1000,
      700
    );

    // TODO - Grab this from the URL instead of passing through localstorage
    window.addEventListener("message", function (e: MessageEvent) {
      if (e.data.source === TINA_LOGIN_EVENT) {
        if (authTab) {
          authTab.close();
        }
        resolve({
          id_token: e.data.id_token,
          access_token: e.data.access_token,
          refresh_token: e.data.refresh_token,
        });
      }
    });
  });
};
