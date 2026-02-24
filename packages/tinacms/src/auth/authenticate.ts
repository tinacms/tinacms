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

    if (!authTab) {
      reject(
        new Error(
          'Login popup was blocked by the browser. Please allow popups for this site and try again.'
        )
      );
      return;
    }

    const cleanup = () => {
      clearInterval(pollTimer);
      window.removeEventListener('message', handleMessage);
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data.source === TINA_LOGIN_EVENT) {
        cleanup();
        authTab.close();
        resolve({
          id_token: e.data.id_token,
          access_token: e.data.access_token,
          refresh_token: e.data.refresh_token,
        });
      }
    };

    const pollTimer = setInterval(() => {
      if (authTab.closed) {
        cleanup();
        reject(
          new Error(
            'Login popup was closed before authentication was completed.'
          )
        );
      }
    }, 500);

    window.addEventListener('message', handleMessage);
  });
};
