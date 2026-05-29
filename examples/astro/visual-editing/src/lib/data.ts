/**
 * Per-collection data loaders. Each one calls the standard Tina client
 * exactly the way the React kitchen-sink does, then pipes the result
 * through `requestWithMetadata()` so the editor overlay flows in
 * automatically when the page is rendered inside the admin iframe.
 *
 * Page-level loaders pass `priority: 'primary'` so the admin focuses
 * the page's own document instead of the layout-level `getGlobal()` —
 * the bridge emits `user-select-form` for the primary id when more
 * than one form is registered.
 */
import { requestWithMetadata } from '@tinacms/astro';
import client from '../../tina/__generated__/client';

export const getGlobal = () =>
  requestWithMetadata(client.queries.global({ relativePath: 'index.json' }));

export const getPage = (slug: string) =>
  requestWithMetadata(client.queries.page({ relativePath: `${slug}.md` }), {
    priority: 'primary',
  });

export const getPost = (slug: string) =>
  requestWithMetadata(client.queries.post({ relativePath: `${slug}.md` }), {
    priority: 'primary',
  });

export const getBlog = (filename: string) =>
  requestWithMetadata(client.queries.blog({ relativePath: `${filename}.md` }), {
    priority: 'primary',
  });

export const getAuthor = (filename: string) =>
  requestWithMetadata(
    client.queries.author({ relativePath: `${filename}.md` }),
    { priority: 'primary' }
  );
