/**
 * GraphQL API & Explorer page tests.
 *
 * Validates that:
 * - The /gql page loads and renders the explorer UI
 * - The /api/gql endpoint responds correctly to GET and POST requests
 */
import { test, expect } from '@playwright/test';

/** Helper to POST a GraphQL query with retry on 500 (dev server compilation) */
async function gqlPost(request: any, query: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const response = await request.post('/api/gql', {
      headers: { 'Content-Type': 'application/json' },
      data: { query },
    });
    if (response.status() === 200) return response;
    // Wait before retry to let the dev server finish compiling
    if (i < retries - 1) await new Promise((r) => setTimeout(r, 3000));
  }
  // Return the last response even if it's an error
  return request.post('/api/gql', {
    headers: { 'Content-Type': 'application/json' },
    data: { query },
  });
}

/** Helper to GET with retry on 500 */
async function gqlGet(request: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const response = await request.get('/api/gql');
    if (response.status() === 200) return response;
    if (i < retries - 1) await new Promise((r) => setTimeout(r, 3000));
  }
  return request.get('/api/gql');
}

test.describe('GraphQL Explorer Page', () => {
  test('should load the GraphQL page', async ({ page }) => {
    await page.goto('/gql');
    await expect(page.locator('h1')).toContainText(/GraphQL/i);
  });

  test('should display the interactive explorer section', async ({ page }) => {
    await page.goto('/gql');
    await expect(page.locator('text=Try It Out')).toBeVisible();
  });

  test('should display example query section', async ({ page }) => {
    await page.goto('/gql');
    await expect(page.locator('text=Example Query')).toBeVisible();
  });

  test('should contain links to API endpoint and admin', async ({ page }) => {
    await page.goto('/gql');
    const apiLink = page.locator('a[href="/api/gql"]');
    await expect(apiLink).toBeVisible();
  });
});

test.describe('GraphQL API Endpoint', () => {
  // Run API tests serially to avoid overwhelming the dev server during compilation
  test.describe.configure({ mode: 'serial' });

  test('GET /api/gql should return API info', async ({ request }) => {
    const response = await gqlGet(request);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('message');
    expect(body.message).toMatch(/GraphQL/i);
  });

  test('POST /api/gql should execute a query', async ({ request }) => {
    const response = await gqlPost(
      request,
      `{
        postConnection {
          edges {
            node {
              id
              title
            }
          }
        }
      }`
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('postConnection');
    expect(body.data.postConnection).toHaveProperty('edges');
    expect(Array.isArray(body.data.postConnection.edges)).toBeTruthy();
  });

  test('POST /api/gql should return typed schema fields for posts', async ({
    request,
  }) => {
    const response = await gqlPost(
      request,
      `{
        postConnection {
          edges {
            node {
              _sys { filename }
              title
            }
          }
        }
      }`
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    const edges = body.data.postConnection.edges;
    expect(edges.length).toBeGreaterThan(0);

    // Every post node should have required fields from the schema
    for (const edge of edges) {
      expect(edge.node).toHaveProperty('title');
      expect(edge.node).toHaveProperty('_sys');
      expect(edge.node._sys).toHaveProperty('filename');
      // Title should be a non-empty string (it's required in the schema)
      expect(typeof edge.node.title).toBe('string');
      expect(edge.node.title.length).toBeGreaterThan(0);
    }
  });

  test('POST /api/gql should return authors with schema fields', async ({
    request,
  }) => {
    const response = await gqlPost(
      request,
      `{
        authorConnection {
          edges {
            node {
              _sys { filename }
              name
            }
          }
        }
      }`
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    const edges = body.data.authorConnection.edges;
    expect(edges.length).toBeGreaterThan(0);

    for (const edge of edges) {
      expect(edge.node).toHaveProperty('name');
      expect(edge.node).toHaveProperty('_sys');
    }
  });

  test('POST /api/gql should return tags with schema fields', async ({
    request,
  }) => {
    const response = await gqlPost(
      request,
      `{
        tagConnection {
          edges {
            node {
              _sys { filename }
              name
            }
          }
        }
      }`
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    const edges = body.data.tagConnection.edges;
    expect(edges.length).toBeGreaterThan(0);

    for (const edge of edges) {
      expect(edge.node).toHaveProperty('name');
      expect(edge.node).toHaveProperty('_sys');
    }
  });

  test('POST /api/gql should return documentation with schema fields', async ({
    request,
  }) => {
    const response = await gqlPost(
      request,
      `{
        documentationConnection {
          edges {
            node {
              _sys { filename breadcrumbs }
              title
            }
          }
        }
      }`
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    const edges = body.data.documentationConnection.edges;
    expect(edges.length).toBeGreaterThan(0);

    for (const edge of edges) {
      expect(edge.node).toHaveProperty('title');
      expect(edge.node._sys).toHaveProperty('breadcrumbs');
      expect(typeof edge.node.title).toBe('string');
      expect(edge.node.title.length).toBeGreaterThan(0);
    }
  });

  test('POST /api/gql should return blogs with schema fields', async ({
    request,
  }) => {
    const response = await gqlPost(
      request,
      `{
        blogConnection {
          edges {
            node {
              _sys { filename }
              title
            }
          }
        }
      }`
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    const edges = body.data.blogConnection.edges;
    expect(edges.length).toBeGreaterThan(0);

    for (const edge of edges) {
      expect(edge.node).toHaveProperty('title');
      expect(typeof edge.node.title).toBe('string');
      expect(edge.node.title.length).toBeGreaterThan(0);
    }
  });

  test('POST /api/gql should return page with blocks schema', async ({
    request,
  }) => {
    const response = await gqlPost(
      request,
      `{
        page(relativePath: "home.mdx") {
          _sys { filename }
          blocks {
            __typename
          }
        }
      }`
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data).toHaveProperty('page');
    expect(body.data.page).toHaveProperty('blocks');
    expect(Array.isArray(body.data.page.blocks)).toBeTruthy();
    expect(body.data.page.blocks.length).toBeGreaterThan(0);

    // Each block should have a __typename
    for (const block of body.data.page.blocks) {
      expect(block).toHaveProperty('__typename');
      expect(typeof block.__typename).toBe('string');
    }
  });

  test('POST /api/gql should return global config', async ({ request }) => {
    const response = await gqlPost(
      request,
      `{
        global(relativePath: "index.json") {
          header {
            name
            nav {
              href
              label
            }
          }
          theme {
            color
            font
            darkMode
          }
        }
      }`
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    const global = body.data.global;
    expect(global).toHaveProperty('header');
    expect(global.header).toHaveProperty('name');
    expect(global.header).toHaveProperty('nav');
    expect(Array.isArray(global.header.nav)).toBeTruthy();
    expect(global).toHaveProperty('theme');
    expect(global.theme).toHaveProperty('color');
    expect(global.theme).toHaveProperty('font');
    expect(global.theme).toHaveProperty('darkMode');
  });
});
