/**
 * Filtering smoke test — verifies that the `post` schema's `title` field is
 * correctly wired to GraphQL filtering end-to-end (schema → LevelDB → response).
 * Uses pre-seeded static fixtures in content/post/ (playwright-filter-*.md).
 */

import { test, expect } from "../../fixtures/api-context";

const POST_CONNECTION_FILTER = `
  query PostConnectionFilter($filter: PostFilter) {
    postConnection(filter: $filter) {
      totalCount
      edges {
        node {
          title
          id
        }
      }
    }
  }
`;

test("postConnection filter — title eq returns only the matching post", async ({
  apiContext,
}) => {
  const resp = await apiContext.post("/graphql", {
    data: {
      query: POST_CONNECTION_FILTER,
      variables: { filter: { title: { eq: "Filter Alpha Post" } } },
    },
  });

  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();
  expect(body.errors).toBeUndefined();

  const { totalCount, edges } = body.data.postConnection;
  expect(totalCount).toBe(1);
  expect(edges[0].node.title).toBe("Filter Alpha Post");
});
