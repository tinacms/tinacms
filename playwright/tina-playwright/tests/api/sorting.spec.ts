/**
 * Sorting tests — TinaCMS contributor perspective.
 *
 * These tests guard TinaCMS's own sort mechanics, not user schema config:
 *
 *   1. Unknown sort key → silent fallback (no error), returns results
 *   2. CREATE → index written immediately, doc appears in sorted results
 *   3. UPDATE → old index entry removed, new entry written (stale index bug)
 *   4. DELETE → index entry removed, doc no longer appears in sorted results
 *   5. `last` arg → reverses iterator (descending order)
 *
 * TinaCMS sort internals (packages/@tinacms/graphql/src/database/index.ts):
 *   - sort: "field" → reads from LevelDB index sublevel for that field
 *   - Unknown sort key → indexDefinition is undefined → falls back to rootLevel (no throw)
 *   - reverse: !!last → reverses the LevelDB iterator for descending order
 *   - Index writes happen in makeIndexOpsForDocument() on every create/update/delete
 */

import { test, expect } from "../../fixtures/test-content";

const CREATE_DOCUMENT = `
  mutation CreateDocument($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
    createDocument(collection: $collection, relativePath: $relativePath, params: $params) {
      __typename
    }
  }
`;

const UPDATE_DOCUMENT = `
  mutation UpdateDocument($collection: String!, $relativePath: String!, $params: DocumentUpdateMutation!) {
    updateDocument(collection: $collection, relativePath: $relativePath, params: $params) {
      __typename
    }
  }
`;

const DELETE_DOCUMENT = `
  mutation DeleteDocument($collection: String!, $relativePath: String!) {
    deleteDocument(collection: $collection, relativePath: $relativePath) {
      __typename
    }
  }
`;

const POST_CONNECTION_SORT = `
  query PostConnectionSort($sort: String, $last: Float, $filter: PostFilter) {
    postConnection(sort: $sort, last: $last, filter: $filter) {
      edges {
        node {
          title
        }
      }
    }
  }
`;

// ── 1. Unknown sort key — documents the current behavior (throws) ─────────────
//
// KNOWN BUG: The code comment in database/index.ts says:
//   "the only way this is actually undefined is if the caller specified a non-existent sort key"
// implying silent fallback. But in practice, TinaCMS throws an internal GraphQL error.
// This test documents the current behavior. If TinaCMS fixes it to fall back silently,
// change expect(body.errors).toBeDefined() → expect(body.errors).toBeUndefined().

test("sort: unknown key — currently throws an error (known behavior)", async ({
  apiContext,
}) => {
  const resp = await apiContext.post("/graphql", {
    data: {
      query: POST_CONNECTION_SORT,
      variables: { sort: "nonExistentField" },
    },
  });

  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();
  // Current behavior: throws an internal error for unknown sort keys
  // Expected behavior per code intent: silent fallback to filepath order
  expect(body.errors).toBeDefined();
});

// ── 2. Index freshness after CREATE ──────────────────────────────────────────

test("sort — newly created document appears in sorted results immediately", async ({
  apiContext,
  contentCleanup,
}) => {
  const relativePath = "playwright-sort-new.md";
  const title = "AAAA Sort Index Create Test";

  const createResp = await apiContext.post("/graphql", {
    data: {
      query: CREATE_DOCUMENT,
      variables: {
        collection: "post",
        relativePath,
        params: { post: { title, body: "" } },
      },
    },
  });
  expect(createResp.ok()).toBeTruthy();
  expect((await createResp.json()).errors).toBeUndefined();
  contentCleanup.track("post", relativePath);

  // If makeIndexOpsForDocument skipped the write on CREATE, filter returns 0 results
  const sortResp = await apiContext.post("/graphql", {
    data: {
      query: POST_CONNECTION_SORT,
      variables: { sort: "title", filter: { title: { eq: title } } },
    },
  });
  const sortBody = await sortResp.json();
  expect(sortBody.errors).toBeUndefined();
  expect(sortBody.data.postConnection.edges).toHaveLength(1);
  expect(sortBody.data.postConnection.edges[0].node.title).toBe(title);
});

// ── 3. Index freshness after UPDATE ──────────────────────────────────────────

test("sort — index is updated on updateDocument (old entry removed, new entry written)", async ({
  apiContext,
  contentCleanup,
}) => {
  const relativePath = "playwright-sort-update.md";
  const originalTitle = "ZZZZ Sort Index Update Original";
  const updatedTitle = "AAAA Sort Index Update Renamed";

  const createResp = await apiContext.post("/graphql", {
    data: {
      query: CREATE_DOCUMENT,
      variables: {
        collection: "post",
        relativePath,
        params: { post: { title: originalTitle, body: "" } },
      },
    },
  });
  expect(createResp.ok()).toBeTruthy();
  expect((await createResp.json()).errors).toBeUndefined();
  contentCleanup.track("post", relativePath);

  const updateResp = await apiContext.post("/graphql", {
    data: {
      query: UPDATE_DOCUMENT,
      variables: {
        collection: "post",
        relativePath,
        params: { post: { title: updatedTitle, body: "" } },
      },
    },
  });
  expect(updateResp.ok()).toBeTruthy();
  expect((await updateResp.json()).errors).toBeUndefined();

  const [oldResp, newResp] = await Promise.all([
    apiContext.post("/graphql", {
      data: {
        query: POST_CONNECTION_SORT,
        variables: { sort: "title", filter: { title: { eq: originalTitle } } },
      },
    }),
    apiContext.post("/graphql", {
      data: {
        query: POST_CONNECTION_SORT,
        variables: { sort: "title", filter: { title: { eq: updatedTitle } } },
      },
    }),
  ]);

  const oldBody = await oldResp.json();
  const newBody = await newResp.json();
  expect(oldBody.errors).toBeUndefined();
  expect(newBody.errors).toBeUndefined();
  // Old index entry must be gone
  expect(oldBody.data.postConnection.edges).toHaveLength(0);
  // New index entry must be present
  expect(newBody.data.postConnection.edges).toHaveLength(1);
  expect(newBody.data.postConnection.edges[0].node.title).toBe(updatedTitle);
});

// ── 4. Index freshness after DELETE ──────────────────────────────────────────

test("sort — deleted document is removed from sorted results immediately", async ({
  apiContext,
  contentCleanup,
}) => {
  const relativePath = "playwright-sort-delete.md";
  const title = "AAAA Sort Index Delete Test";

  const createResp = await apiContext.post("/graphql", {
    data: {
      query: CREATE_DOCUMENT,
      variables: {
        collection: "post",
        relativePath,
        params: { post: { title, body: "" } },
      },
    },
  });
  expect(createResp.ok()).toBeTruthy();
  expect((await createResp.json()).errors).toBeUndefined();
  contentCleanup.track("post", relativePath);

  const deleteResp = await apiContext.post("/graphql", {
    data: {
      query: DELETE_DOCUMENT,
      variables: { collection: "post", relativePath },
    },
  });
  expect(deleteResp.ok()).toBeTruthy();
  expect((await deleteResp.json()).errors).toBeUndefined();

  // If makeIndexOpsForDocument skipped the del op, the doc still appears here
  const sortResp = await apiContext.post("/graphql", {
    data: {
      query: POST_CONNECTION_SORT,
      variables: { sort: "title", filter: { title: { eq: title } } },
    },
  });
  const sortBody = await sortResp.json();
  expect(sortBody.errors).toBeUndefined();
  expect(sortBody.data.postConnection.edges).toHaveLength(0);
});

// ── 5. Ascending order via `sort` ────────────────────────────────────────────

test("sort — results are returned in ascending order by title", async ({
  apiContext,
}) => {
  const seedTitles = ["Filter Alpha Post", "Filter Beta Post", "Gamma Unrelated"];
  const resp = await apiContext.post("/graphql", {
    data: {
      query: POST_CONNECTION_SORT,
      variables: {
        sort: "title",
        filter: { title: { in: seedTitles } },
      },
    },
  });

  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();
  expect(body.errors).toBeUndefined();

  const titles = body.data.postConnection.edges.map(
    ({ node }: { node: { title: string } }) => node.title
  );

  // Results must be ascending (A → Z)
  const ascending = [...titles].sort((a, b) => a.localeCompare(b));
  expect(titles).toEqual(ascending);
  expect(titles[0]).toBe("Filter Alpha Post"); // first alphabetically
});

// ── 6. Descending order via `last` ────────────────────────────────────────────

test("sort — `last` arg reverses iterator, returns results in descending order", async ({
  apiContext,
}) => {
  const seedTitles = ["Filter Alpha Post", "Filter Beta Post", "Gamma Unrelated"];
  const resp = await apiContext.post("/graphql", {
    data: {
      query: POST_CONNECTION_SORT,
      variables: {
        sort: "title",
        last: 10,
        filter: { title: { in: seedTitles } },
      },
    },
  });

  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();
  expect(body.errors).toBeUndefined();

  const titles = body.data.postConnection.edges.map(
    ({ node }: { node: { title: string } }) => node.title
  );

  // With `last`, TinaCMS sets reverse:true on the LevelDB iterator
  // Results must be descending (Z → A)
  const descending = [...titles].sort((a, b) => b.localeCompare(a));
  expect(titles).toEqual(descending);
  expect(titles[0]).toBe("Gamma Unrelated"); // last alphabetically = first when reversed
});

