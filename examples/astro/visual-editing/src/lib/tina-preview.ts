import client from '../../tina/__generated__/client';
import { addContentSourceMetadata, hashFromQuery } from './metadata';

/**
 * Stateless overlay reader.
 *
 * The @tinacms/bridge attaches unsaved form data to island refetch
 * requests via the `X-Tina-Preview` header. It serializes a map of
 * `{ [queryId]: data }` so a single page can host multiple forms.
 *
 * In edit mode this helper returns the overlay; otherwise it falls
 * through to a normal Tina GraphQL fetch — same code runs in
 * production with no header, no bridge, and no edit-mode awareness.
 */
export interface PageQueryResult {
  data: PageData;
  query: string;
  variables: { relativePath: string };
  /** Stable id used to match overlay updates to this query. */
  id: string;
}

export interface PageData {
  page: {
    hero: { tagline: string | null; headline: string | null } | null;
    features: {
      title: string | null;
      items:
        | Array<{ name: string | null; description: string | null }>
        | null;
    } | null;
  };
}

const PAGE_QUERY = `query page($relativePath: String!) {
  page(relativePath: $relativePath) {
    hero { tagline headline }
    features { title items { name description } }
  }
}`;

const DEFAULT_PAGE: PageData = {
  page: {
    hero: { tagline: '', headline: '' },
    features: { title: '', items: [] },
  },
};

export async function getPageData(
  slug: string,
  request: Request,
): Promise<PageQueryResult> {
  const variables = { relativePath: `${slug}.json` };
  const id = hashFromQuery(JSON.stringify({ query: PAGE_QUERY, variables }));

  const overlay = readOverlay(request, id);
  if (overlay) {
    return {
      data: addContentSourceMetadata(id, overlay) as PageData,
      query: PAGE_QUERY,
      variables,
      id,
    };
  }

  const result = await client.request<PageData>(
    { query: PAGE_QUERY, variables },
    { branch: '' },
  ).catch(() => null);

  const data = result?.data ?? DEFAULT_PAGE;
  return {
    data: addContentSourceMetadata(id, data) as PageData,
    query: PAGE_QUERY,
    variables,
    id,
  };
}

function readOverlay(request: Request, id: string): PageData | null {
  const header = request.headers.get('X-Tina-Preview');
  if (!header) return null;

  try {
    const parsed = JSON.parse(header) as Record<string, PageData>;
    return parsed[id] ?? null;
  } catch {
    return null;
  }
}
