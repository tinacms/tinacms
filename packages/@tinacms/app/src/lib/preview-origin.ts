/**
 * Utilities for securing the admin <-> preview iframe postMessage channel.
 *
 * The trusted peer is the preview iframe loaded by the admin. Messages are only
 * trusted when they match the expected preview origin and, when available, the
 * iframe's exact `contentWindow`.
 */

/**
 * Returns the origin the preview iframe is allowed to be on.
 *
 * The admin only ever loads the preview from its own origin, so this is that
 * origin and nothing else. It is deliberately not derived from the preview URL:
 * reading the trust anchor out of a value the URL supplies is what allowed a
 * crafted link to nominate the origin it would then be trusted from.
 */
export const getPreviewOrigin = (): string =>
  typeof window !== 'undefined' ? window.location.origin : '';

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
