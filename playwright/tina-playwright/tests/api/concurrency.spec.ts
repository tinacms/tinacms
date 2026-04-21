/**
 * Concurrency guards — four scenarios firing N parallel ops on the same
 * path. Each asserts file + index coherence after the lock serialises:
 *
 *   1. Concurrent create on the same path    → first wins, rest reject ("already exists")
 *   2. Concurrent update on the same doc     → all succeed, last-write-wins
 *   3. Concurrent delete on the same doc     → first wins, rest reject ("does not exist")
 *   4. Concurrent rename of the same source  → first wins, rest reject (source already moved)
 */

import { test, expect } from "../../fixtures/test-content";
import {
  createDocument,
  updateDocument,
  deleteDocument,
  gqlRequest,
} from "../../utils/graphql";

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

// ---------------------------------------------------------------------------
// 1. Concurrent creates on the same non-existent path
// ---------------------------------------------------------------------------

test("concurrent creates on the same path — exactly one succeeds, others error cleanly", async ({
  apiContext,
  contentCleanup,
}) => {
  const relativePath = "playwright-concurrent-create.md";
  const collection = "post";
  // Track up front so teardown runs regardless of which create wins.
  contentCleanup.track(collection, relativePath);

  const titles = Array.from(
    { length: PARALLEL_COUNT },
    (_, i) => `concurrent-create-${i}`
  );

  const responses = await Promise.all(
    titles.map((title) =>
      createDocument(apiContext, {
        collection,
        relativePath,
        params: { post: { title, body: title } },
      })
    )
  );

  // 1. Exactly one succeeds; the rest error cleanly. Anything else means
  //    the lock let two creates past the "doesn't exist" check.
  const successful = responses.filter((r) => r.errors === undefined);
  const failed = responses.filter((r) => r.errors !== undefined);
  expect(successful).toHaveLength(1);
  expect(failed).toHaveLength(PARALLEL_COUNT - 1);

  // 2. The winning title is readable.
  const readBody = (await gqlRequest(apiContext, GET_POST, {
    relativePath,
  })) as { data: { post: { title: string } } };
  const winningTitle = readBody.data.post.title;
  expect(titles).toContain(winningTitle);

  // 3. Index has exactly one edge across all candidate titles.
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
  expect(indexBody.data.postConnection.edges[0].node.title).toBe(winningTitle);
});

// ---------------------------------------------------------------------------
// 2. Concurrent updates on the same existing document (last-write-wins)
// ---------------------------------------------------------------------------

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

  // 3. Exactly one edge across ALL sent titles. Using `in: titles` instead of
  //    `eq: finalTitle` catches stale index rows under any losing title.
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

// ---------------------------------------------------------------------------
// 3. Concurrent deletes on the same existing document
// ---------------------------------------------------------------------------

test("concurrent deletes on the same document — exactly one succeeds, others error cleanly", async ({
  apiContext,
  contentCleanup,
}) => {
  const relativePath = "playwright-concurrent-delete.md";
  const collection = "post";

  const createBody = await createDocument(apiContext, {
    collection,
    relativePath,
    params: { post: { title: "to-be-deleted", body: "to-be-deleted" } },
  });
  expect(createBody.errors).toBeUndefined();
  // Tracked for safety; by the time teardown runs the doc should already be
  // gone, and the fixture's check-before-delete skips it cleanly.
  contentCleanup.track(collection, relativePath);

  const responses = await Promise.all(
    Array.from({ length: PARALLEL_COUNT }, () =>
      deleteDocument(apiContext, { collection, relativePath })
    )
  );

  // 1. Exactly one succeeds; the rest error cleanly. Anything else means
  //    the lock let two deletes past the "does exist" check.
  const successful = responses.filter((r) => r.errors === undefined);
  const failed = responses.filter((r) => r.errors !== undefined);
  expect(successful).toHaveLength(1);
  expect(failed).toHaveLength(PARALLEL_COUNT - 1);

  // 2. Subsequent read returns a GraphQL error — doc is gone.
  const readBody = await gqlRequest(apiContext, GET_POST, { relativePath });
  expect(readBody.errors).toBeDefined();

  // 3. Index has no edges for the post's original title.
  const indexBody = (await gqlRequest(apiContext, POST_CONNECTION_BY_TITLE, {
    filter: { title: { eq: "to-be-deleted" } },
  })) as {
    data: {
      postConnection: {
        edges: Array<{ node: { title: string } }>;
      };
    };
  };
  expect(indexBody.data.postConnection.edges).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 4. Concurrent rename — pins the put-new + delete-old sequence under the lock.
// ---------------------------------------------------------------------------

test("concurrent renames of the same source — exactly one succeeds, others error cleanly", async ({
  apiContext,
  contentCleanup,
}) => {
  const sourcePath = "playwright-concurrent-rename-source.md";
  const collection = "post";

  const createBody = await createDocument(apiContext, {
    collection,
    relativePath: sourcePath,
    params: { post: { title: "rename-seed", body: "rename-seed" } },
  });
  expect(createBody.errors).toBeUndefined();
  contentCleanup.track(collection, sourcePath);

  // N potential target paths — only the winner's target is ever created;
  // the fixture's check-before-delete safely skips the rest.
  const targetPaths = Array.from(
    { length: PARALLEL_COUNT },
    (_, i) => `playwright-concurrent-rename-target-${i}.md`
  );
  for (const target of targetPaths) {
    contentCleanup.track(collection, target);
  }

  // Rename via updateDocument with params.relativePath set to the new path.
  const responses = await Promise.all(
    targetPaths.map((newPath) =>
      updateDocument(apiContext, {
        collection,
        relativePath: sourcePath,
        params: { relativePath: newPath } as Record<string, unknown>,
      })
    )
  );

  // 1. Exactly one rename succeeds — the first to acquire the lock; subsequent
  //    requests find the source gone and throw "does not exist".
  const successful = responses.filter((r) => r.errors === undefined);
  const failed = responses.filter((r) => r.errors !== undefined);
  expect(successful).toHaveLength(1);
  expect(failed).toHaveLength(PARALLEL_COUNT - 1);

  // 2. Source path is gone.
  const sourceRead = await gqlRequest(apiContext, GET_POST, {
    relativePath: sourcePath,
  });
  expect(sourceRead.errors).toBeDefined();

  // 3. Exactly one target path resolves — the winner's.
  const targetReads = await Promise.all(
    targetPaths.map((p) =>
      gqlRequest(apiContext, GET_POST, { relativePath: p }).then((r) => ({
        path: p,
        exists: r.errors === undefined,
      }))
    )
  );
  const existingTargets = targetReads.filter((t) => t.exists);
  expect(existingTargets).toHaveLength(1);
});
