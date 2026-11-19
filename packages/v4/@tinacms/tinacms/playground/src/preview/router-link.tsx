import { type ReactNode, useEffect, useState } from 'react';

const subscribers = new Set<() => void>();

/** A router-like navigate: it changes the URL without a page load. */
export function navigate(href: string) {
  history.pushState(null, '', href);
  for (const notify of subscribers) notify();
}

export function useLocationSearch(): string {
  const [search, setSearch] = useState(location.search);
  useEffect(() => {
    const update = () => setSearch(location.search);
    subscribers.add(update);
    window.addEventListener('popstate', update);
    return () => {
      subscribers.delete(update);
      window.removeEventListener('popstate', update);
    };
  }, []);
  return search;
}

/** A link that navigates in its own onClick unless something already handled the click. */
export function RouterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (event.defaultPrevented) return;
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
