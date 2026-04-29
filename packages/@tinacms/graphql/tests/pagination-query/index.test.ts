import { it, expect } from 'vitest';
import config from './tina/config';
import { setup } from '../util';

const FORWARD_PAGINATION_QUERY = `query ForwardPagination(
  $sort: String!
  $first: Float!
  $after: String
) {
  movieConnection(sort: $sort, first: $first, after: $after) {
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
  }
}`;

it('handles forward pagination through to last page', async () => {
  const { get } = await setup(__dirname, config);

  // First page
  const firstPage = await get({
    query: FORWARD_PAGINATION_QUERY,
    variables: {
      sort: 'releaseDate',
      first: 1,
    },
  });

  expect(firstPage.data).toBeDefined();
  expect(firstPage.data!.movieConnection.edges).toHaveLength(1);
  expect(firstPage.data!.movieConnection.edges[0].node.id).toBe(
    'movies/movie-alpha.md'
  );
  expect(firstPage.data!.movieConnection.edges[0].node.title).toBe(
    'Movie Alpha'
  );
  expect(firstPage.data!.movieConnection.pageInfo.hasNextPage).toBe(true);

  // Second page
  const secondPage = await get({
    query: FORWARD_PAGINATION_QUERY,
    variables: {
      sort: 'releaseDate',
      first: 2,
      after: firstPage.data!.movieConnection.pageInfo.endCursor,
    },
  });

  expect(secondPage.data).toBeDefined();
  expect(secondPage.data!.movieConnection.edges).toHaveLength(2);
  expect(secondPage.data!.movieConnection.edges[0].node.id).toBe(
    'movies/movie-beta.md'
  );
  expect(secondPage.data!.movieConnection.edges[1].node.id).toBe(
    'movies/movie-gamma.md'
  );
  expect(secondPage.data!.movieConnection.pageInfo.hasNextPage).toBe(true);

  // Final page
  const finalPage = await get({
    query: FORWARD_PAGINATION_QUERY,
    variables: {
      sort: 'releaseDate',
      first: 2,
      after: secondPage.data!.movieConnection.pageInfo.endCursor,
    },
  });

  expect(finalPage.data).toBeDefined();
  expect(finalPage.data!.movieConnection.edges).toHaveLength(2);
  expect(finalPage.data!.movieConnection.edges[0].node.id).toBe(
    'movies/movie-delta.md'
  );
  expect(finalPage.data!.movieConnection.edges[1].node.id).toBe(
    'movies/movie-epsilon.md'
  );
  expect(finalPage.data!.movieConnection.pageInfo.hasNextPage).toBe(false);
});
