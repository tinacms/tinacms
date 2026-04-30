/**
 * Concurrency guard — N parallel updates on the same document must all
 * resolve, leave the doc readable with one of the sent titles, and leave
 * the LevelDB title index with exactly one matching edge.
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
      edges { node { title } }
    }
  }
`;

const PARALLEL_COUNT = 8;

test("concurrent updates on the same document all resolve without data loss", async ({
  apiContext,
  contentCleanup,
}) => {
  const relativePath = "playwright-concurrent-update.md";
  const collection = "post";

  const createBody = await createDocument(apiContext, {
    collection,
    relativePath,
    params: { post: { title: "seed", body: "seed" } },
  });
  expect(createBody.errors).toBeUndefined();
  contentCleanup.track(collection, relativePath);

  const titles = Array.from(
    { length: PARALLEL_COUNT },
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

  // 1. Every mutation resolves cleanly — no lock timeout, no mid-write throw.
  for (const body of responses) {
    expect(body.errors).toBeUndefined();
  }

  // 2. Final read matches one of the sent titles — no corrupted half-state.
  const readBody = (await gqlRequest(apiContext, GET_POST, {
    relativePath,
  })) as { data: { post: { title: string } } };
  const finalTitle = readBody.data.post.title;
  expect(titles).toContain(finalTitle);

  // 3. Exactly one edge across ALL sent titles — `in` vs `eq` catches stale
  //    rows left under any losing title.
  const indexBody = (await gqlRequest(apiContext, POST_CONNECTION_BY_TITLE, {
    filter: { title: { in: titles } },
  })) as {
    data: {
      postConnection: {
        edges: Array<{ node: { title: string } }>;
      };
    };
  };
  expect(indexBody.data.postConnection.edges).toHaveLength(1);
  expect(indexBody.data.postConnection.edges[0].node.title).toBe(finalTitle);
});
