import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format, loadVariables } from '../util';

const updateMutation = `
  mutation UpdateMovie($params: DocumentUpdateMutation!) {
    updateDocument(
      collection: "movie", 
      relativePath: "in.md", 
      params: $params
    ) {
      ...on Document { _values, _sys { title } }
    }
  }
`;

it('executes mutation with reference and validates bridge writes', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);
  const variables = await loadVariables(__dirname);

  const result = await query({
    query: updateMutation,
    variables,
  });

  await expect(format(result)).toMatchFileSnapshot('updated-movie-node.json');

  const writes = bridge.getWrites();
  expect(writes.size).toBeGreaterThan(0);

  const movieWrite = bridge.getWrite('movies/in.md');
  expect(movieWrite).toBeDefined();
  await expect(movieWrite).toMatchFileSnapshot('updated-movie-content.md');
});
