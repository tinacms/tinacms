import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation } from '../util';

const createMutation = (title: string) => `
  mutation {
    createDocument(
      collection: "post"
      relativePath: "race.md"
      params: { post: { title: "${title}" } }
    ) {
      __typename
    }
  }
`;

const updateMutation = (title: string) => `
  mutation {
    updateDocument(
      collection: "post"
      relativePath: "race.md"
      params: { post: { title: "${title}" } }
    ) {
      ...on Document { _values }
    }
  }
`;

it('handles parallel creates of the same relativePath without leaving inconsistent bridge state', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const [resultA, resultB] = await Promise.all([
    query({ query: createMutation('Writer A'), variables: {} }),
    query({ query: createMutation('Writer B'), variables: {} }),
  ]);

  for (const result of [resultA, resultB]) {
    expect(result).toBeDefined();
    expect(result.data === null || result.data !== undefined).toBe(true);
  }

  const finalWrite = bridge.getWrite('posts/race.md');
  expect(finalWrite).toBeDefined();
  expect(
    finalWrite!.includes('Writer A') || finalWrite!.includes('Writer B')
  ).toBe(true);
});

it('serializes parallel updates of the same document to a single final state', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);
  await query({
    query: `
      mutation {
        createDocument(
          collection: "post"
          relativePath: "race.md"
          params: { post: { title: "Initial" } }
        ) { __typename }
      }
    `,
    variables: {},
  });

  const [resultA, resultB] = await Promise.all([
    query({ query: updateMutation('Update A'), variables: {} }),
    query({ query: updateMutation('Update B'), variables: {} }),
  ]);

  expect(resultA).toBeDefined();
  expect(resultB).toBeDefined();

  const finalWrite = bridge.getWrite('posts/race.md');
  expect(finalWrite).toBeDefined();
  expect(
    finalWrite!.includes('Update A') || finalWrite!.includes('Update B')
  ).toBe(true);
  expect(finalWrite).not.toContain('Initial');
});
