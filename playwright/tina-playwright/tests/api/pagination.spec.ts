/**
 * Pagination smoke tests — verifies that `first` and `after` cursor arguments
 * work correctly against real LevelDB data.
 *
 * Uses the same pre-seeded static fixtures as filtering and sorting:
 *   content/post/playwright-filter-alpha.md  → "Filter Alpha Post"
 *   content/post/playwright-filter-beta.md   → "Filter Beta Post"
 *   content/post/playwright-filter-aaa.md    → "Gamma Unrelated"
 *
 * Every query filters to these three seed titles so that parallel tests
 * creating or deleting posts (sorting, document-crud, concurrency) cannot
 * skew the totals.
 *
 * Tests:
 *   1. `first` limits the number of results returned
 *   2. `hasNextPage` is true when more results exist, false on the last page
 *   3. `after` cursor advances to the next page with no overlap
 */

import { test, expect } from "../../fixtures/api-context";

const SEED_TITLES = ["Filter Alpha Post", "Filter Beta Post", "Gamma Unrelated"];

const POST_CONNECTION_PAGINATE = `
  query PostConnectionPaginate($first: Float, $after: String, $sort: String, $filter: PostFilter) {
    postConnection(first: $first, after: $after, sort: $sort, filter: $filter) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          title
        }
      }
    }
  }
`;

const seedFilter = { title: { in: SEED_TITLES } };

// ── 1. `first` limits results ─────────────────────────────────────────────────

test("pagination — `first` limits the number of results returned", async ({
  apiContext,
}) => {
  const resp = await apiContext.post("/graphql", {
    data: {
      query: POST_CONNECTION_PAGINATE,
      variables: { sort: "title", first: 2, filter: seedFilter },
    },
  });

  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();
  expect(body.errors).toBeUndefined();

  // `first` is a limit — must return at most the requested number
  expect(body.data.postConnection.edges.length).toBeLessThanOrEqual(2);
});

// ── 2. `hasNextPage` reflects whether more results exist ──────────────────────

test("pagination — hasNextPage is true on first page, false on last page", async ({
  apiContext,
}) => {
  // Page 1: fetch 2 posts sorted by title
  const page1Resp = await apiContext.post("/graphql", {
    data: {
      query: POST_CONNECTION_PAGINATE,
      variables: { sort: "title", first: 2, filter: seedFilter },
    },
  });

  expect(page1Resp.ok()).toBeTruthy();
  const page1Body = await page1Resp.json();
  expect(page1Body.errors).toBeUndefined();

  const cursor = page1Body.data.postConnection.pageInfo.endCursor;

  // 3 seed posts exist, fetching 2 means more remain
  expect(page1Body.data.postConnection.pageInfo.hasNextPage).toBe(true);

  // Page 2: advance past page 1
  const page2Resp = await apiContext.post("/graphql", {
    data: {
      query: POST_CONNECTION_PAGINATE,
      variables: { sort: "title", first: 2, after: cursor, filter: seedFilter },
    },
  });

  expect(page2Resp.ok()).toBeTruthy();
  const page2Body = await page2Resp.json();
  expect(page2Body.errors).toBeUndefined();

  // Page 2 must have results — if cursor was ignored this would be a repeat of page 1
  expect(page2Body.data.postConnection.edges.length).toBeGreaterThan(0);

  // After exhausting all posts, hasNextPage must be false
  expect(page2Body.data.postConnection.pageInfo.hasNextPage).toBe(false);
});

// ── 3. `after` cursor advances pages with no overlap ──────────────────────────

test("pagination — `after` cursor returns the next page with no overlapping results", async ({
  apiContext,
}) => {
  // Page 1
  const page1Resp = await apiContext.post("/graphql", {
    data: {
      query: POST_CONNECTION_PAGINATE,
      variables: { sort: "title", first: 2, filter: seedFilter },
    },
  });

  expect(page1Resp.ok()).toBeTruthy();
  const page1Body = await page1Resp.json();
  expect(page1Body.errors).toBeUndefined();

  const page1Titles: string[] = page1Body.data.postConnection.edges.map(
    ({ node }: { node: { title: string } }) => node.title
  );
  const cursor = page1Body.data.postConnection.pageInfo.endCursor;

  // Only meaningful if page 1 returned results and there is a next page
  expect(page1Titles.length).toBeGreaterThan(0);
  expect(page1Body.data.postConnection.pageInfo.hasNextPage).toBe(true);

  // Page 2
  const page2Resp = await apiContext.post("/graphql", {
    data: {
      query: POST_CONNECTION_PAGINATE,
      variables: { sort: "title", first: 2, after: cursor, filter: seedFilter },
    },
  });

  expect(page2Resp.ok()).toBeTruthy();
  const page2Body = await page2Resp.json();
  expect(page2Body.errors).toBeUndefined();

  const page2Titles: string[] = page2Body.data.postConnection.edges.map(
    ({ node }: { node: { title: string } }) => node.title
  );

  // Page 2 must have results — if empty, the cursor didn't advance or data is missing
  expect(page2Titles.length).toBeGreaterThan(0);

  // No title from page 1 should appear on page 2
  for (const title of page2Titles) {
    expect(page1Titles).not.toContain(title);
  }
});
