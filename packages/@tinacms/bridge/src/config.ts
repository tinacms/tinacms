/**
 * Bridge runtime config. `init()` populates this once before any listener
 * is wired, so the per-feature modules don't each need to thread the
 * `adminOrigin` through their constructors.
 */
let configuredAdminOrigins: string[] = [];

export function setAdminOrigin(origin: string | string[]): void {
  configuredAdminOrigins = Array.isArray(origin) ? [...origin] : [origin];
}

/**
 * Returns the canonical admin origin used as the `targetOrigin` for outbound
 * postMessage. When multiple origins are configured the first entry wins —
 * that's the deployment's primary admin host; the others are accepted for
 * inbound traffic but the bridge still posts to the canonical one.
 */
export function getAdminOrigin(): string {
  return configuredAdminOrigins[0] ?? '';
}

/**
 * Returns true only for postMessage events that originated from the admin
 * iframe parent — `event.origin` matches one of the configured admin
 * origins AND `event.source` is the parent window. Both checks are
 * required: origin alone leaves us open to sibling frames sharing the
 * same origin, source alone leaves us open to cross-origin parents that
 * happen to have a handle to our window.
 */
export function isFromAdmin(event: MessageEvent): boolean {
  if (typeof window === 'undefined') return false;
  if (!configuredAdminOrigins.includes(event.origin)) return false;
  return event.source === window.parent;
}
