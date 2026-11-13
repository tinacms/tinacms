import { SiteNav } from './site-nav';

/** Declares only the shared nav, so the admin shows "Nothing to edit on this page". */
export function BlogIndex() {
  return (
    <>
      <SiteNav />
      <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '3rem' }}>
        <h1 data-testid='blog-index-title'>Blog</h1>
        <p>This page draws no document of its own.</p>
      </main>
    </>
  );
}
