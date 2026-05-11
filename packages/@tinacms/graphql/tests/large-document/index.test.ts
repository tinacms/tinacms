import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation } from '../util';

it('round-trips a multi-hundred-kilobyte content field without truncation', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const largeContent = 'a'.repeat(200 * 1024);

  const createResult = await query({
    query: `
      mutation {
        createDocument(
          collection: "article"
          relativePath: "huge.md"
          params: {
            article: {
              title: "Huge Article"
              content: ${JSON.stringify(largeContent)}
            }
          }
        ) {
          __typename
        }
      }
    `,
    variables: {},
  });

  expect(createResult.errors).toBeUndefined();

  const queryResult = await query({
    query: `
      query {
        article(relativePath: "huge.md") {
          title
          content
        }
      }
    `,
    variables: {},
  });

  expect(queryResult.errors).toBeUndefined();
  expect(queryResult.data?.article?.content?.length).toBe(largeContent.length);
  expect(queryResult.data?.article?.content).toBe(largeContent);

  const bridgeWrite = bridge.getWrite('articles/huge.md');
  expect(bridgeWrite).toBeDefined();
  expect(bridgeWrite!.length).toBeGreaterThan(largeContent.length);
});
