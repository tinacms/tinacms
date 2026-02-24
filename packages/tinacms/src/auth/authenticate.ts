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
  frontendUrl: string
): Promise<TokenObject> => {
  return new Promise((resolve, reject) => {
    const origin = `${window.location.protocol}//${window.location.host}`;
    const authTab = popupWindow(
      `${frontendUrl}/signin?clientId=${clientId}&origin=${origin}`,
      '_blank',
      window,
      1000,
      700
    );

    // Poll to detect if popup was closed without completing auth
    const pollTimer = setInterval(() => {
      if (authTab?.closed) {
        clearInterval(pollTimer);
        window.removeEventListener('message', handleMessage);
        reject(new Error('Login cancelled - popup was closed'));
      }
    }, 500);

    // TODO - Grab this from the URL instead of passing through localstorage
    const handleMessage = function (e: MessageEvent) {
      if (e.data.source === TINA_LOGIN_EVENT) {
        clearInterval(pollTimer);
        window.removeEventListener('message', handleMessage);
        if (authTab) {
          authTab.close();
        }
        resolve({
          id_token: e.data.id_token,
          access_token: e.data.access_token,
          refresh_token: e.data.refresh_token,
        });
      }
    };

    window.addEventListener('message', handleMessage);
  });
};
