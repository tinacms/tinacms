/**
 * Per-collection data loaders. Each returns a `QueryResult` shaped for
 * `<Base>`'s `forms` prop AND for the matching island refresh endpoint.
 * The query string is the GraphQL document the admin re-runs on edit;
 * keep it consistent between page and island so the overlay id matches.
 */
import client from '../../tina/__generated__/client';
import { withOverlay, type QueryResult } from './tina-preview';

const GLOBAL_QUERY = `query global($relativePath: String!) {
  global(relativePath: $relativePath) {
    header {
      name
      color
      nav { href label }
    }
    footer {
      social { icon url }
    }
    theme {
      color
      font
      darkMode
    }
  }
}`;

const PAGE_QUERY = `query page($relativePath: String!) {
  page(relativePath: $relativePath) {
    blocks { __typename ... on PageBlocksHero { tagline headline text image { src alt } actions { label type icon link } color }
      ... on PageBlocksFeatures { title description items { title text icon { name color style } actions { label type icon link } } color }
      ... on PageBlocksCta { title description actions { label type icon link } color }
      ... on PageBlocksTestimonial { quote author color }
      ... on PageBlocksContent { body color }
    }
  }
}`;

const POST_QUERY = `query post($relativePath: String!) {
  post(relativePath: $relativePath) {
    title heroImg excerpt
    author { ... on Author { name avatar } }
    date tags { tag { ... on Tag { name } } }
    _body
  }
}`;

const BLOG_QUERY = `query blog($relativePath: String!) {
  blog(relativePath: $relativePath) {
    title heroImage excerpt description
    author { ... on Author { name avatar } }
    pubDate updatedDate
    _body
  }
}`;

const AUTHOR_QUERY = `query author($relativePath: String!) {
  author(relativePath: $relativePath) {
    name avatar description hobbies
  }
}`;

interface GlobalData {
  global: {
    header?: { name?: string | null; color?: string | null; nav?: Array<{ href?: string; label?: string }> } | null;
    footer?: { social?: Array<{ icon?: string; url?: string }> } | null;
    theme?: { color?: string | null; font?: string | null; darkMode?: string | null } | null;
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
