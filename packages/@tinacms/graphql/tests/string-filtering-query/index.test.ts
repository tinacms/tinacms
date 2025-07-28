import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('filters movies by string title operations', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      titleEQ: movieConnection(filter: { title: { eq: "Movie Alpha" } }, sort: "title") {
        edges {
          node {
            id
            title
          }
        }
      },
      titleIN: movieConnection(filter: { title: { in: ["Movie Alpha", "Movie Beta"] } }, sort: "title") {
        edges {
          node {
            id
            title
          }
        }
      },
      titleStartsWith: movieConnection(filter: { title: { startsWith: "Movie" } }, sort: "title") {
        edges {
          node {
            id
            title
          }
        }
      }
    }`,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot('node.json');
});
