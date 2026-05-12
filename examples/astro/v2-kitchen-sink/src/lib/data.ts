/**
 * Per-collection data loaders. Each one calls the standard Tina client
 * exactly the way the React kitchen-sink does, then pipes the result
 * through `requestWithMetadata()` so the editor overlay flows in
 * automatically when the page is rendered inside the admin iframe.
 */
import { requestWithMetadata } from '@tinacms/astro';
import client from '../../tina/__generated__/client';

export const getGlobal = () =>
  requestWithMetadata(client.queries.global({ relativePath: 'index.json' }));

export const getPage = (slug: string) =>
  requestWithMetadata(client.queries.page({ relativePath: `${slug}.md` }));

export const getPost = (slug: string) =>
  requestWithMetadata(client.queries.post({ relativePath: `${slug}.md` }));

export const getBlog = (filename: string) =>
  requestWithMetadata(client.queries.blog({ relativePath: `${filename}.md` }));

export const getAuthor = (filename: string) =>
  requestWithMetadata(
    client.queries.author({ relativePath: `${filename}.md` })
  );
