/**
 * Content schema consistency tests.
 *
 * These tests query the GraphQL API directly to validate that the content
 * schema is consistent with expectations. Since content text can change
 * via TinaCMS, we validate field presence and types rather than exact values.
 *
 * This ensures that schema changes are caught — e.g. if a required field
 * is removed or renamed, these tests will fail.
 */
import { test, expect } from '@playwright/test';

/** Helper to POST a GraphQL query with retry for transient 500 errors */
async function gql(request: any, query: string, retries = 3) {
  let lastResponse: any;
  for (let i = 0; i < retries; i++) {
    lastResponse = await request.post('/api/gql', {
      headers: { 'Content-Type': 'application/json' },
      data: { query },
    });
    if (lastResponse.status() === 200) break;
    if (i < retries - 1) await new Promise((r) => setTimeout(r, 3000));
  }
  expect(lastResponse.status()).toBe(200);
  const body = await lastResponse.json();
  // Fail fast with a helpful message if the GraphQL API returned errors
  if (body.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);
  }
  return body;
}

test.describe('Schema Consistency — Collections', () => {
  test('all expected collections are queryable', async ({ request }) => {
    // Query introspection-like: try to fetch each collection connection
    const collections = [
      'postConnection',
      'authorConnection',
      'tagConnection',
      'blogConnection',
      'documentationConnection',
      'pageConnection',
      'globalConnection',
    ];

    for (const col of collections) {
      const body = await gql(request, `{ ${col} { edges { node { id } } } }`);
      expect(body.data).toHaveProperty(col);
      expect(body.data[col]).toHaveProperty('edges');
    }
  });
});

test.describe('Schema Consistency — Post Collection', () => {
  test('post should have title, author reference, and _body', async ({
    request,
  }) => {
    const body = await gql(
      request,
      `{
        postConnection(first: 1) {
          edges {
            node {
              title
              author { ... on Author { name } }
              _body
            }
          }
        }
      }`
    );
    const post = body.data.postConnection.edges[0]?.node;
    expect(post).toBeDefined();
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('author');
    expect(post).toHaveProperty('_body');
  });
});

test.describe('Schema Consistency — Author Collection', () => {
  test('author should have name and optional hobbies list', async ({
    request,
  }) => {
    const body = await gql(
      request,
      `{
        authorConnection(first: 1) {
          edges {
            node {
              name
              hobbies
              avatar
            }
          }
        }
      }`
    );
    const author = body.data.authorConnection.edges[0]?.node;
    expect(author).toBeDefined();
    expect(author).toHaveProperty('name');
    // hobbies is optional but the field must exist in the schema
    expect(author).toHaveProperty('hobbies');
  });
});

test.describe('Schema Consistency — Tag Collection', () => {
  test('tag should have a name field', async ({ request }) => {
    const body = await gql(
      request,
      `{
        tagConnection(first: 1) {
          edges {
            node {
              name
            }
          }
        }
      }`
    );
    const tag = body.data.tagConnection.edges[0]?.node;
    expect(tag).toBeDefined();
    expect(tag).toHaveProperty('name');
    expect(typeof tag.name).toBe('string');
  });
});

test.describe('Schema Consistency — Blog Collection', () => {
  test('blog should have title, heroImage, and _body', async ({ request }) => {
    const body = await gql(
      request,
      `{
        blogConnection(first: 1) {
          edges {
            node {
              title
              heroImage
              _body
            }
          }
        }
      }`
    );
    const blog = body.data.blogConnection.edges[0]?.node;
    expect(blog).toBeDefined();
    expect(blog).toHaveProperty('title');
    expect(blog).toHaveProperty('heroImage');
    expect(blog).toHaveProperty('_body');
  });
});

test.describe('Schema Consistency — Documentation Collection', () => {
  test('documentation should have title, tags, and _body', async ({
    request,
  }) => {
    const body = await gql(
      request,
      `{
        documentationConnection(first: 1) {
          edges {
            node {
              title
              tags {
                tag { ... on Tag { name } }
              }
              _body
            }
          }
        }
      }`
    );
    const doc = body.data.documentationConnection.edges[0]?.node;
    expect(doc).toBeDefined();
    expect(doc).toHaveProperty('title');
    expect(doc).toHaveProperty('tags');
    expect(doc).toHaveProperty('_body');
  });
});

test.describe('Schema Consistency — Page Collection', () => {
  test('home page should have blocks with valid __typename', async ({
    request,
  }) => {
    const body = await gql(
      request,
      `{
        page(relativePath: "home.mdx") {
          blocks {
            __typename
          }
        }
      }`
    );
    const blocks = body.data.page.blocks;
    expect(Array.isArray(blocks)).toBeTruthy();
    expect(blocks.length).toBeGreaterThan(0);

    // All blocks should have a recognized typename
    const validTypeNames = [
      'PageBlocksHero',
      'PageBlocksFeatures',
      'PageBlocksCta',
      'PageBlocksTestimonial',
      'PageBlocksContent',
    ];

    for (const block of blocks) {
      expect(validTypeNames).toContain(block.__typename);
    }
  });
});

test.describe('Schema Consistency — Global Collection', () => {
  test('global config should have header, footer, and theme', async ({
    request,
  }) => {
    const body = await gql(
      request,
      `{
        global(relativePath: "index.json") {
          header {
            name
            color
            nav { href label }
          }
          footer {
            social { icon url }
          }
          theme {
            color
            font
            darkMode
          }
        }
      }`
    );
    const global = body.data.global;
    expect(global).toHaveProperty('header');
    expect(global).toHaveProperty('footer');
    expect(global).toHaveProperty('theme');

    // Header should have navigation items
    expect(Array.isArray(global.header.nav)).toBeTruthy();
    expect(global.header.nav.length).toBeGreaterThan(0);

    // Each nav item should have href and label
    for (const navItem of global.header.nav) {
      expect(navItem).toHaveProperty('href');
      expect(navItem).toHaveProperty('label');
    }

    // Theme should have valid values
    expect([
      'blue',
      'teal',
      'green',
      'red',
      'pink',
      'purple',
      'orange',
      'yellow',
    ]).toContain(global.theme.color);
    expect(['sans', 'serif', 'mono']).toContain(global.theme.font);
    expect(['system', 'light', 'dark']).toContain(global.theme.darkMode);
  });
});
