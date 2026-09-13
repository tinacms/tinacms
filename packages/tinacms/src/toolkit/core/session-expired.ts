import { isErrorNamed } from './errors';
import type { EventBus } from './event';

export class SessionExpiredError extends Error {
  constructor() {
    super('Your session has ended. Please sign in again.');
    this.name = 'SessionExpiredError';
  }
}

export const isSessionExpiredError = (
  error: unknown
): error is SessionExpiredError =>
  error instanceof SessionExpiredError ||
  isErrorNamed(error, 'SessionExpiredError');

// The auth wall subscribes and returns the user to the login modal.
export const dispatchSessionExpired = (events: EventBus) => {
  events.dispatch({ type: 'cms:session-expired' });
};
