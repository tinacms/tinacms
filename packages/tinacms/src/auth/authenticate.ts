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

// Custom error for when user cancels authentication by closing the popup
export class AuthenticationCancelledError extends Error {
  constructor(message = 'Authentication cancelled') {
    super(message);
    this.name = 'AuthenticationCancelledError';
  }
}

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

    // Check if popup was blocked
    if (!authTab) {
      reject(
        new Error(
          'Popup was blocked by browser. Please allow popups for this site.'
        )
      );
      return;
    }

    // Message handler for auth completion
    const messageHandler = (e: MessageEvent) => {
      if (e.data.source === TINA_LOGIN_EVENT) {
        clearInterval(pollInterval);
        window.removeEventListener('message', messageHandler);

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

    // Poll to detect if popup was closed without completing auth
    const pollInterval = setInterval(() => {
      if (authTab.closed) {
        clearInterval(pollInterval);
        window.removeEventListener('message', messageHandler);
        reject(new AuthenticationCancelledError('Popup was closed'));
      }
    }, 500);

    window.addEventListener('message', messageHandler);
  });
};
