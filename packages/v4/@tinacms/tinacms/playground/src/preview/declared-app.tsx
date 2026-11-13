import { type ReactNode, useEffect, useState } from 'react';
import { BlogIndex } from './blog-index';
import { PostPage } from './post-page';

const subscribers = new Set<() => void>();

/** A router-like navigate: it changes the URL without a page load. */
export function navigate(href: string) {
  history.pushState(null, '', href);
  for (const notify of subscribers) notify();
}

function useLocationSearch(): string {
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

export function DeclaredApp() {
  const params = new URLSearchParams(useLocationSearch());
  const post = params.get('post');
  if (params.get('view') === 'blog' || !post) return <BlogIndex />;
  return <PostPage path={post} />;
}
