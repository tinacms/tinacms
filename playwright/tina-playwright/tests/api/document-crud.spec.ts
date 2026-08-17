/**
 * GraphQL API integration tests — Document CRUD & Format Roundtrips
 *
 * Hits the GraphQL endpoint at localhost:4001/graphql directly over HTTP.
 * No browser involved. Tests run against a real dev server to verify the
 * full mutation pipeline and content serialization for each supported format.
 *
 * Collections used:
 *   - post     (md)   — full CRUD lifecycle
 *   - author   (mdx)  — create + read roundtrip
 *   - settings (json) — create + read roundtrip
 */

import { test, expect } from "../../fixtures/test-content";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

const GET_POST = `
  query GetPost($relativePath: String!) {
    post(relativePath: $relativePath) {
      title
      body
      id
    }
  }
`;

const GET_AUTHOR = `
  query GetAuthor($relativePath: String!) {
    author(relativePath: $relativePath) {
      Title
      id
    }
  }
`;

const GET_SETTINGS = `
  query GetSettings($relativePath: String!) {
    settings(relativePath: $relativePath) {
      label
      id
    }
  }
`;

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("Document CRUD lifecycle (md format)", () => {
  const relativePath = "playwright-crud-test.md";
  const collection = "post";

  test("create → read → update → delete a post", async ({
    apiContext,
    contentCleanup,
  }) => {
    // ------------------------------------------------------------------
    // CREATE
    // ------------------------------------------------------------------
    const createResp = await apiContext.post("/graphql", {
      data: {
        query: CREATE_DOCUMENT,
        variables: {
          collection,
          relativePath,
          params: {
            post: {
              title: "Playwright CRUD Test",
              body: "Initial body content.",
            },
          },
        },
      },
    });

    expect(createResp.ok()).toBeTruthy();
    const createBody = await createResp.json();
    expect(createBody.errors).toBeUndefined();

    // Register for cleanup immediately after creation
    contentCleanup.track(collection, relativePath);

    // ------------------------------------------------------------------
    // READ — verify the created document is accessible
    // ------------------------------------------------------------------
    const readResp = await apiContext.post("/graphql", {
      data: {
        query: GET_POST,
        variables: { relativePath },
      },
    });

    expect(readResp.ok()).toBeTruthy();
    const readBody = await readResp.json();
    expect(readBody.errors).toBeUndefined();
    expect(readBody.data.post.title).toBe("Playwright CRUD Test");

    // ------------------------------------------------------------------
    // UPDATE — change the title
    // ------------------------------------------------------------------
    const updateResp = await apiContext.post("/graphql", {
      data: {
        query: UPDATE_DOCUMENT,
        variables: {
          collection,
          relativePath,
          params: {
            post: {
              title: "Playwright CRUD Test (updated)",
              body: "Updated body content.",
            },
          },
        },
      },
    });

    expect(updateResp.ok()).toBeTruthy();
    const updateBody = await updateResp.json();
    expect(updateBody.errors).toBeUndefined();

    // ------------------------------------------------------------------
    // READ AGAIN — verify the update persisted
    // ------------------------------------------------------------------
    const readAfterUpdateResp = await apiContext.post("/graphql", {
      data: {
        query: GET_POST,
        variables: { relativePath },
      },
    });

    expect(readAfterUpdateResp.ok()).toBeTruthy();
    const readAfterUpdateBody = await readAfterUpdateResp.json();
    expect(readAfterUpdateBody.errors).toBeUndefined();
    expect(readAfterUpdateBody.data.post.title).toBe(
      "Playwright CRUD Test (updated)"
    );
    expect(readAfterUpdateBody.data.post.body.trim()).toBe("Updated body content.");

    // ------------------------------------------------------------------
    // DELETE — contentCleanup.track handles deletion in teardown,
    // but we also delete here to verify the mutation works and then
    // confirm the document is gone.
    // ------------------------------------------------------------------
    const deleteResp = await apiContext.post("/graphql", {
      data: {
        query: DELETE_DOCUMENT,
        variables: { collection, relativePath },
      },
    });

    expect(deleteResp.ok()).toBeTruthy();
    const deleteBody = await deleteResp.json();
    expect(deleteBody.errors).toBeUndefined();

    // READ AFTER DELETE — expect a GraphQL error (document not found)
    const readAfterDeleteResp = await apiContext.post("/graphql", {
      data: {
        query: GET_POST,
        variables: { relativePath },
      },
    });

    const readAfterDeleteBody = await readAfterDeleteResp.json();
    // TinaCMS returns a GraphQL error when the document does not exist
    expect(readAfterDeleteBody.errors).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// mdx format roundtrip
// ---------------------------------------------------------------------------

test.describe("Content format roundtrip (mdx)", () => {
  const relativePath = "playwright-mdx-roundtrip.mdx";
  const collection = "author";

  test("create + read roundtrip for .mdx format", async ({
    apiContext,
    contentCleanup,
  }) => {
    // CREATE
    const createResp = await apiContext.post("/graphql", {
      data: {
        query: CREATE_DOCUMENT,
        variables: {
          collection,
          relativePath,
          params: {
            author: {
              Title: "Playwright MDX Author",
            },
          },
        },
      },
    });

    expect(createResp.ok()).toBeTruthy();
    const createBody = await createResp.json();
    expect(createBody.errors).toBeUndefined();

    contentCleanup.track(collection, relativePath);

    // READ — verify the document is retrievable and data matches
    const readResp = await apiContext.post("/graphql", {
      data: {
        query: GET_AUTHOR,
        variables: { relativePath },
      },
    });

    expect(readResp.ok()).toBeTruthy();
    const readBody = await readResp.json();
    expect(readBody.errors).toBeUndefined();
    expect(readBody.data.author.Title).toBe("Playwright MDX Author");
  });
});

// ---------------------------------------------------------------------------
// json format roundtrip
// ---------------------------------------------------------------------------

test.describe("Content format roundtrip (json)", () => {
  const relativePath = "playwright-json-roundtrip.json";
  const collection = "settings";

  test("create + read roundtrip for .json format", async ({
    apiContext,
    contentCleanup,
  }) => {
    // CREATE
    const createResp = await apiContext.post("/graphql", {
      data: {
        query: CREATE_DOCUMENT,
        variables: {
          collection,
          relativePath,
          params: {
            settings: {
              label: "Playwright JSON Settings",
            },
          },
        },
      },
    });

    expect(createResp.ok()).toBeTruthy();
    const createBody = await createResp.json();
    expect(createBody.errors).toBeUndefined();

    contentCleanup.track(collection, relativePath);

    // READ — verify the document is retrievable and data matches
    const readResp = await apiContext.post("/graphql", {
      data: {
        query: GET_SETTINGS,
        variables: { relativePath },
      },
    });

    expect(readResp.ok()).toBeTruthy();
    const readBody = await readResp.json();
    expect(readBody.errors).toBeUndefined();
    expect(readBody.data.settings.label).toBe("Playwright JSON Settings");
  });
});
