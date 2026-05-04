/**
 * Per-collection data loaders. Each returns a `QueryResult` shaped for
 * `<Base>`'s `forms` prop AND for the matching island refresh endpoint.
 *
 * Query strings come from `queries.ts` which extracts the canonical
 * auto-generated shape (with the `... on Document { _sys, id }`
 * selection the admin needs to build forms). Hashing the same string
 * server-side and in the bridge keeps overlay ids matching.
 */
import client from '../../tina/__generated__/client';
import {
  AUTHOR_QUERY,
  BLOG_QUERY,
  GLOBAL_QUERY,
  PAGE_QUERY,
  POST_QUERY,
} from './queries';
import { type QueryResult, withOverlay } from './tina-preview';

interface GlobalData {
  global: {
    header?: {
      name?: string | null;
      color?: string | null;
      nav?: Array<{ href?: string; label?: string }>;
    } | null;
    footer?: { social?: Array<{ icon?: string; url?: string }> } | null;
    theme?: {
      color?: string | null;
      font?: string | null;
      darkMode?: string | null;
    } | null;
  } | null;
}

const DEFAULT_GLOBAL: GlobalData = {
  global: {
    header: { name: '', color: 'default', nav: [] },
    footer: { social: [] },
    theme: { color: 'blue', font: 'sans', darkMode: 'system' },
  },
};

export function getGlobal(request: Request): Promise<QueryResult<GlobalData>> {
  const variables = { relativePath: 'index.json' };
  return withOverlay<GlobalData>({
    query: GLOBAL_QUERY,
    variables,
    request,
    fetcher: async () => {
      const result = await client.queries.global(variables);
      return result?.data as GlobalData | null;
    },
    defaults: DEFAULT_GLOBAL,
  });
}

export function getPage(slug: string, request: Request) {
  const variables = { relativePath: `${slug}.md` };
  return withOverlay({
    query: PAGE_QUERY,
    variables,
    request,
    fetcher: async () => {
      const result = await client.queries.page(variables);
      return result?.data as { page: { blocks: unknown[] } } | null;
    },
    defaults: { page: { blocks: [] } },
  });
}

export function getPost(slug: string, request: Request) {
  const variables = { relativePath: `${slug}.md` };
  return withOverlay({
    query: POST_QUERY,
    variables,
    request,
    fetcher: async () => {
      const result = await client.queries.post(variables);
      return result?.data as { post: Record<string, unknown> } | null;
    },
    defaults: { post: { title: '', _body: null, tags: [] } },
  });
}

export function getBlog(filename: string, request: Request) {
  const variables = { relativePath: `${filename}.md` };
  return withOverlay({
    query: BLOG_QUERY,
    variables,
    request,
    fetcher: async () => {
      const result = await client.queries.blog(variables);
      return result?.data as { blog: Record<string, unknown> } | null;
    },
    defaults: { blog: { title: '', _body: null } },
  });
}

export function getAuthor(filename: string, request: Request) {
  const variables = { relativePath: `${filename}.md` };
  return withOverlay({
    query: AUTHOR_QUERY,
    variables,
    request,
    fetcher: async () => {
      const result = await client.queries.author(variables);
      return result?.data as { author: Record<string, unknown> } | null;
    },
    defaults: { author: { name: '', hobbies: [] } },
  });
}
