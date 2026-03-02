/**

*/

import popupWindow from './popupWindow';

const TINA_LOGIN_EVENT = 'tinaCloudLogin';
export const AUTH_TOKEN_KEY = 'tinacms-auth';

// Debug logging for auth flow investigation
const authLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, message, data };

  // Store in global array for easy access
  if (typeof window !== 'undefined') {
    (window as any).__TINA_AUTH_LOGS__ =
      (window as any).__TINA_AUTH_LOGS__ || [];
    (window as any).__TINA_AUTH_LOGS__.push(logEntry);
  }

  // Log to console with prefix
  console.log(
    `[TINA-AUTH ${timestamp}]`,
    message,
    data !== undefined ? data : ''
  );
};

export type TokenObject = {
  id_token: string;
  access_token?: string;
  refresh_token?: string;
};

// Custom error for when user cancels authentication
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
  authLog('authenticate() called', { clientId, frontendUrl });

  return new Promise((resolve, reject) => {
    const origin = `${window.location.protocol}//${window.location.host}`;
    authLog('Creating popup window', { origin });

    const authTab = popupWindow(
      `${frontendUrl}/signin?clientId=${clientId}&origin=${origin}`,
      '_blank',
      window,
      1000,
      700
    );

    authLog('Popup window created', {
      popupExists: !!authTab,
      popupClosed: authTab?.closed,
    });

    // Message handler for auth completion
    const messageHandler = (e: MessageEvent) => {
      authLog('Message event received', {
        source: e.data?.source,
        hasIdToken: !!e.data?.id_token,
      });

      if (e.data.source === TINA_LOGIN_EVENT) {
        authLog('TINA_LOGIN_EVENT received - authentication successful');
        clearInterval(pollInterval);
        window.removeEventListener('message', messageHandler);

        if (authTab) {
          authLog('Closing popup window');
          authTab.close();
        }
        resolve({
          id_token: e.data.id_token,
          access_token: e.data.access_token,
          refresh_token: e.data.refresh_token,
        });
        authLog('Promise resolved with token');
      }
    };

    // Poll to detect if popup was closed without completing auth
    const pollInterval = setInterval(() => {
      authLog('Polling popup state', {
        popupExists: !!authTab,
        popupClosed: authTab?.closed,
      });

      if (authTab && authTab.closed) {
        authLog('Popup was closed by user (detected via polling)');
        clearInterval(pollInterval);
        window.removeEventListener('message', messageHandler);
        // FIX: Reject the promise so the button resets
        reject(new AuthenticationCancelledError('Popup was closed'));
        authLog('Promise rejected - auth cancelled');
      }
    }, 500);

    window.addEventListener('message', messageHandler);

    authLog(
      'Message event listener registered, waiting for auth completion...'
    );
  });
};
