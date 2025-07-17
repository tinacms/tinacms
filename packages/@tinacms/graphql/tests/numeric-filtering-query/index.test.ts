import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('filters movies by numeric rating operations', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      ratingIN: movieConnection(filter: { rating: { in: [7.2, 8.5] } }, sort: "rating") {
        edges {
          node {
            id
            title
            rating
          }
        }
      },
      ratingBetween: movieConnection(filter: { rating: { gt: 7, lte: 8.5 } }, sort: "rating") {
        edges {
          node {
            id
            title
            rating
          }
        }
      },
      ratingGTE: movieConnection(filter: { rating: { gte: 7.2 } }, sort: "rating") {
        edges {
          node {
            id
            title
            rating
          }
        }
      },
      ratingGT: movieConnection(filter: { rating: { gt: 7.2 } }, sort: "rating") {
        edges {
          node {
            id
            title
            rating
          }
        }
      },
      ratingLTE: movieConnection(filter: { rating: { lte: 8.5 } }, sort: "rating") {
        edges {
          node {
            id
            title
            rating
          }
        }
      },
      ratingLT: movieConnection(filter: { rating: { lt: 8.5 } }, sort: "rating") {
        edges {
          node {
            id
            title
            rating
          }
        }
      }
    }`,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot('node.json');
});
