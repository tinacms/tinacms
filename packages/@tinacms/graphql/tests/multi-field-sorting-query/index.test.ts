import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('handles multi-field sorting operations using index', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      multiFieldSort: movieConnection(sort: "release-rating") {
        edges {
          node {
            id
            title
            releaseDate
            rating
          }
        }
      }
    }`,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot('node.json');
});
