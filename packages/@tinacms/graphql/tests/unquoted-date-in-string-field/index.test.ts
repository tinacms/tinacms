import { expect, it } from 'vitest';
import { setup, setupMutation } from '../util';
import config from './tina/config';

const postFields = 'title publishedOn publishedAt revisions';

it('indexes the file and returns the dates as strings', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: `query { post(relativePath: "in.md") { ${postFields} } }`,
    variables: {},
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.post).toEqual({
    title: 'Unquoted dates',
    publishedOn: '2026-10-08T00:00:00.000Z',
    publishedAt: '2024-02-10T10:30:00.000Z',
    revisions: ['2025-01-15T00:00:00.000Z', 'first draft'],
  });
});

it('finds the document by the string the editor shows', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: `query {
      postConnection(filter: { publishedAt: { eq: "2024-02-10T10:30:00.000Z" } }) {
        totalCount
      }
    }`,
    variables: {},
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.postConnection).toEqual({ totalCount: 1 });
});

it('saves the dates back as strings', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({
    query: `mutation {
      updateDocument(
        collection: "post"
        relativePath: "in.md"
        params: {
          post: {
            title: "Edited"
            publishedOn: "2026-10-08T00:00:00.000Z"
            publishedAt: "2024-02-10T10:30:00.000Z"
          }
        }
      ) {
        ...on Document { id }
      }
    }`,
    variables: {},
  });

  expect(result.errors).toBeUndefined();
  const saved = bridge.getWrite('posts/in.md');
  expect(saved).toContain("publishedOn: '2026-10-08T00:00:00.000Z'");
  expect(saved).toContain("publishedAt: '2024-02-10T10:30:00.000Z'");
});
