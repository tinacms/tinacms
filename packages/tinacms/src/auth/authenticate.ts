/**

*/

import popupWindow from './popupWindow';

const TINA_LOGIN_EVENT = 'tinaCloudLogin';
export const AUTH_TOKEN_KEY = 'tinacms-auth';

// Debug logging
const debugLog = (msg: string, data?: any) => {
  console.log(`[TinaCMS Auth Debug] ${msg}`, data !== undefined ? data : '');
};

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
  debugLog('authenticate() called', { clientId, frontendUrl });

  return new Promise((resolve, reject) => {
    const origin = `${window.location.protocol}//${window.location.host}`;
    debugLog('Opening popup', { origin });

    const authTab = popupWindow(
      `${frontendUrl}/signin?clientId=${clientId}&origin=${origin}`,
      '_blank',
      window,
      1000,
      700
    );

    debugLog('Popup result', {
      authTabExists: !!authTab,
      authTabClosed: authTab?.closed,
      authTabType: typeof authTab,
    });

    // Check if popup was blocked
    if (!authTab) {
      debugLog('Popup was blocked by browser!');
      reject(
        new Error(
          'Popup was blocked by browser. Please allow popups for this site.'
        )
      );
      return;
    }

    // Message handler for auth completion
    const messageHandler = (e: MessageEvent) => {
      debugLog('Message received', {
        source: e.data?.source,
        origin: e.origin,
      });

      if (e.data.source === TINA_LOGIN_EVENT) {
        debugLog('Auth success - TINA_LOGIN_EVENT received');
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
    let pollCount = 0;
    const pollInterval = setInterval(() => {
      pollCount++;
      const isClosed = authTab.closed;

      if (pollCount <= 3 || isClosed) {
        debugLog('Polling popup', {
          pollCount,
          isClosed,
          authTabExists: !!authTab,
        });
      }

      if (isClosed) {
        debugLog('Popup closed detected - rejecting promise');
        clearInterval(pollInterval);
        window.removeEventListener('message', messageHandler);
        const error = new AuthenticationCancelledError('Popup was closed');
        debugLog('Rejecting with error', {
          errorName: error.name,
          errorMessage: error.message,
        });
        reject(error);
      }
    }, 500);

    window.addEventListener('message', messageHandler);
    debugLog('Message listener registered, polling started');
  });
};
