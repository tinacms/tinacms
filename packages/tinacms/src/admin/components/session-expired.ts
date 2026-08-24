import type { TinaCMS } from '@tinacms/toolkit';

// The auth wall subscribes and returns the user to the login modal.
export const notifySessionExpired = (cms: TinaCMS) => {
  cms.events.dispatch({ type: 'cms:session-expired' });
};
