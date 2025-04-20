/**

*/

import popupWindow from './popupWindow';

const TINA_LOGIN_EVENT = 'tinaCloudLogin';
export const AUTH_TOKEN_KEY = 'tinacms-auth';

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
  return new Promise((resolve) => {
    const origin = `${window.location.protocol}//${window.location.host}`;
    if (oauth2) {
      const redirectUri = encodeURIComponent(`${origin}/admin/auth/callback`);
      const codeChallenge = 'jksdfjdsklf';
      window.location.href = `${frontendUrl}/oauth-signin?redirect_uri=${redirectUri}&code_challenge=${codeChallenge}&client_id=${clientId}`;
      return;
    }
    const authTab = popupWindow(
      `${frontendUrl}/signin?clientId=${clientId}&origin=${origin}`,
      '_blank',
      window,
      1000,
      700
    );

    // TODO - Grab this from the URL instead of passing through localstorage
    window.addEventListener('message', function (e: MessageEvent) {
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
