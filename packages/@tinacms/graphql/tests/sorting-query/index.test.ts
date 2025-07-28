import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('handles single and multi-field sorting operations', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      sortByTitle: movieConnection(sort: "title") {
        edges {
          node {
            id
            title
            releaseDate
            rating
          }
        }
      },
      sortByReleaseDate: movieConnection(sort: "releaseDate") {
        edges {
          node {
            id
            title
            releaseDate
            rating
          }
        }
      },
      sortByRating: movieConnection(sort: "rating") {
        edges {
          node {
            id
            title
            releaseDate
            rating
          }
        }
      },
    }`,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot('node.json');
});
