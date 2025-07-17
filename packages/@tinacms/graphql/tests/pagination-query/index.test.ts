import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('handles pagination with forward and backward navigation', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      paginatedAsc: movieConnection(sort: "releaseDate", first: 1) {
        edges {
          node {
            id
            title
            releaseDate
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      },
      paginatedAscPage2: movieConnection(sort: "releaseDate", first: 2, after: "MjMzMzY2NDAwMDAwHW1vdmllcy9tb3ZpZS1hbHBoYS5tZA==") {
        edges {
          node {
            id
            title
            releaseDate
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      },
      paginatedDesc: movieConnection(sort: "releaseDate", last: 1) {
        edges {
          node {
            id
            title
            releaseDate
          }
        }
        pageInfo {
          hasPreviousPage
          startCursor
        }
      },
      paginatedDescPage2: movieConnection(sort: "releaseDate", last: 2, before: "ODA5MDQ5NjAwMDAwHW1vdmllcy9tb3ZpZS1lcHNpbG9uLm1k") {
        edges {
          node {
            id
            title
            releaseDate
          }
        }
        pageInfo {
          hasPreviousPage
          startCursor
        }
      },
      paginatedAscFinalPage: movieConnection(sort: "releaseDate", first: 10, after: "NDQ3NjM4NDAwMDAwHW1vdmllcy9tb3ZpZS1nYW1tYS5tZA==") {
        edges {
          node {
            id
            title
            releaseDate
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      },
      paginatedDescFinalPage: movieConnection(sort: "releaseDate", last: 10, before: "NDQ3NjM4NDAwMDAwHW1vdmllcy9tb3ZpZS1nYW1tYS5tZA==") {
        edges {
          node {
            id
            title
            releaseDate
          }
        }
        pageInfo {
          hasPreviousPage
          startCursor
        }
      }
    }`,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot('node.json');
});
