import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('filters movies by date using after, before, and between operations', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: `query {
      releaseDateAfter: movieConnection(filter: { releaseDate: { after: "2020-01-01T00:00:00.000Z" } }, sort: "releaseDate") {
        edges {
          node {
            id
            title
            releaseDate
          }
        }
      },
      releaseDateBefore: movieConnection(filter: { releaseDate: { before: "2020-01-01T00:00:00.000Z" } }, sort: "releaseDate") {
        edges {
          node {
            id
            title
            releaseDate
          }
        }
      },
      releaseDateBetween: movieConnection(filter: { releaseDate: { after: "2019-01-01T00:00:00.000Z", before: "2021-01-01T00:00:00.000Z" } }, sort: "releaseDate") {
        edges {
          node {
            id
            title
            releaseDate
          }
        }
      }
    }`,
    variables: {},
  });

  expect(format(result)).toMatchFileSnapshot('node.json');
});
