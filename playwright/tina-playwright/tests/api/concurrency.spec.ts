/**
 * Concurrency guard — verifies that the AsyncLock wrapping gqlResolve
 * (cli/src/next/vite/plugins.ts) keeps concurrent mutations consistent.
 *
 * All writes are serialised by `databaseLock`, so N parallel updates on the
 * same document must:
 *   1. All resolve without GraphQL errors (no lock timeout, no mid-write throw)
 *   2. Leave the document readable with one of the sent titles
 *   3. Leave the LevelDB `title` index with exactly one matching edge — if a
 *      write's index ops were dropped or doubled, the regression surfaces here
 */

import { test, expect } from "../../fixtures/test-content";
import { createDocument, updateDocument, gqlRequest } from "../../utils/graphql";

const GET_POST = `
  query GetPost($relativePath: String!) {
    post(relativePath: $relativePath) {
      title
    }
  }
`;

const POST_CONNECTION_BY_TITLE = `
  query PostConnectionByTitle($filter: PostFilter) {
    postConnection(filter: $filter) {
      totalCount
      edges { node { title } }
    }
  }
`;

const PARALLEL_UPDATE_COUNT = 8;

test("concurrent updates on the same document all resolve without data loss", async ({
  apiContext,
  contentCleanup,
}) => {
  const relativePath = "playwright-concurrency.md";
  const collection = "post";

  const createBody = await createDocument(apiContext, {
    collection,
    relativePath,
    params: { post: { title: "seed", body: "seed" } },
  });
  expect(createBody.errors).toBeUndefined();
  contentCleanup.track(collection, relativePath);

  const titles = Array.from(
    { length: PARALLEL_UPDATE_COUNT },
    (_, i) => `concurrent-update-${i}`
  );

  const responses = await Promise.all(
    titles.map((title) =>
      updateDocument(apiContext, {
        collection,
        relativePath,
        params: { post: { title, body: title } },
      })
    )
  );

  // 1. Every mutation succeeds
  for (const body of responses) {
    expect(body.errors).toBeUndefined();
  }

  // 2. Final read returns one of the sent titles (not a corrupted half-state)
  const readBody = (await gqlRequest(apiContext, GET_POST, {
    relativePath,
  })) as { data: { post: { title: string } } };
  const finalTitle = readBody.data.post.title;
  expect(titles).toContain(finalTitle);

  // 3. The title index reflects exactly one document — no stale entries left
  //    behind by the losing writes
  const indexBody = (await gqlRequest(apiContext, POST_CONNECTION_BY_TITLE, {
    filter: { title: { eq: finalTitle } },
  })) as {
    data: {
      postConnection: {
        totalCount: number;
        edges: Array<{ node: { title: string } }>;
      };
    };
  };
  expect(indexBody.data.postConnection.edges).toHaveLength(1);
  expect(indexBody.data.postConnection.edges[0].node.title).toBe(finalTitle);
});
