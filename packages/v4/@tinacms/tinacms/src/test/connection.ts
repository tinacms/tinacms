import type {
  DocumentConnection,
  DocumentSummary,
  FolderSummary,
} from '../core/content/contract';

/** A single page holding every summary, as a provider answers a `list` with no query. */
export const connectionOf = (
  summaries: readonly DocumentSummary[],
  folders: FolderSummary[] = []
): DocumentConnection => ({
  edges: summaries.map((node) => ({ node, cursor: node.path })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: summaries.length,
  folders,
});
