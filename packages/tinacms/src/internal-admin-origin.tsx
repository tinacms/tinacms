import React from 'react';

/**
 * Trusted admin parent origins for overlay messages.
 * Defaults to the page origin because legacy admin embeds the site same-origin,
 * and useTina posts back to `window.location.origin`.
 *
 * Internal only: consumed by useTina; tests may import the provider directly.
 */
const TinaAdminOriginContext = React.createContext<string | string[] | null>(
  null
);

export function TinaAdminOriginProvider(props: {
  origin: string | string[];
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <TinaAdminOriginContext.Provider value={props.origin}>
      {props.children}
    </TinaAdminOriginContext.Provider>
  );
}

export function useTrustedAdminOrigins(): string[] {
  const configured = React.useContext(TinaAdminOriginContext);
  return React.useMemo(() => {
    if (configured == null) {
      return typeof window !== 'undefined' ? [window.location.origin] : [];
    }
    return Array.isArray(configured) ? [...configured] : [configured];
  }, [configured]);
}

export function isFromAdmin(
  event: MessageEvent,
  trustedOrigins: string[]
): boolean {
  if (typeof window === 'undefined') return false;
  if (!trustedOrigins.includes(event.origin)) return false;
  return event.source === window.parent;
}
