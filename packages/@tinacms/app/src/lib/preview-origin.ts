/**
 * Utilities for securing the admin <-> preview iframe postMessage channel.
 *
 * The trusted peer is the preview iframe loaded by the admin. Messages are only
 * trusted when they match the expected preview origin and, when available, the
 * iframe's exact `contentWindow`.
 */

/**
 * Returns the origin expected for the preview iframe.
 *
 * Relative URLs resolve against `baseOrigin`; absolute URLs keep their own
 * origin.
 */
export const getExpectedPreviewOrigin = (
  url: string,
  baseOrigin: string = typeof window !== 'undefined'
    ? window.location.origin
    : ''
): string => {
  try {
    return new URL(url, baseOrigin || undefined).origin;
  } catch {
    return baseOrigin;
  }
};

/**
 * Checks whether a MessageEvent came from the trusted preview iframe.
 *
 * `event.data` is intentionally not read here, so callers can run this check
 * before trusting the payload.
 */
export const isFromTrustedPreviewOrigin = ({
  event,
  expectedOrigin,
  peerWindow,
}: {
  event: MessageEvent;
  expectedOrigin: string;
  peerWindow: Window | null | undefined;
}): boolean => {
  if (!expectedOrigin) return false;
  if (event.origin !== expectedOrigin) return false;
  if (peerWindow && event.source !== peerWindow) return false;
  return true;
};

/**
 * Sends a message to the preview iframe with a strict target origin.
 *
 * No-ops when the iframe window or origin is missing, and never uses `"*"`.
 */
export const postMessageToPreview = (
  peerWindow: Window | null | undefined,
  message: unknown,
  expectedOrigin: string
): void => {
  if (!peerWindow || !expectedOrigin) return;
  peerWindow.postMessage(message, expectedOrigin);
};
