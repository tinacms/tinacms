import { defineServerHook, reject } from '@tinacms/tinacms/server';

const RESERVED_SLUGS = new Set(['admin', 'api']);

// The server side of the `slug` hook (tina/hooks.ts). Only the site's server
// loads this file, so the rule holds for every save that goes through it.
export default defineServerHook(() => ({
  beforeSave: (document) => {
    const slug = String(document.slug || document.title || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (RESERVED_SLUGS.has(slug)) {
      reject(
        `The slug "${slug}" belongs to a route of this site. Pick another.`
      );
    }
    return { ...document, slug };
  },
}));
