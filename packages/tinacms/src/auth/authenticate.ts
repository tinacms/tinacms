import popupWindow from './popupWindow';

const TINA_LOGIN_EVENT = 'tinaCloudLogin';
export const AUTH_TOKEN_KEY = 'tinacms-auth';

export class AuthenticationCancelledError extends Error {
  constructor() {
    super('Authentication was cancelled');
    this.name = 'AuthenticationCancelledError';
  }
}

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

    // Handle popup blocked by browser
    if (!authTab) {
      reject(new AuthenticationCancelledError());
      return;
    }

    let isResolved = false;

    const handleMessage = (e: MessageEvent) => {
      if (e.data.source === TINA_LOGIN_EVENT) {
        isResolved = true;
        cleanup();
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

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      if (popupCheckInterval) {
        clearInterval(popupCheckInterval);
      }
    };

    // Check if popup was closed without completing authentication
    const popupCheckInterval = setInterval(() => {
      if (authTab?.closed && !isResolved) {
        cleanup();
        reject(new AuthenticationCancelledError());
      }
    }, 500);

    window.addEventListener('message', handleMessage);
  });
};
