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

// NOTE: The following test is incorrect - see https://github.com/tinacms/tinacms/issues/5921
// There is no consistency between how sequences of 1 or 2 pages are being returned.
/*
const BACKWARD_PAGINATION_QUERY = `query BackwardPagination(
  $sort: String!
  $last: Float!
  $before: String
) {
  movieConnection(sort: $sort, last: $last, before: $before) {
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
}`;

it('handles backward pagination through to first page', async () => {
  const { get } = await setup(__dirname, config);

  // Last page
  const lastPage = await get({
    query: BACKWARD_PAGINATION_QUERY,
    variables: {
      sort: 'releaseDate',
      last: 1,
    },
  });

  expect(lastPage.data).toBeDefined();
  expect(lastPage.data!.movieConnection.edges).toHaveLength(1);
  expect(lastPage.data!.movieConnection.edges[0].node.id).toBe(
    'movies/movie-epsilon.md'
  );
  expect(lastPage.data!.movieConnection.edges[0].node.title).toBe(
    'Movie Epsilon'
  );
  expect(lastPage.data!.movieConnection.pageInfo.hasPreviousPage).toBe(true);

  // Previous page
  const previousPage = await get({
    query: BACKWARD_PAGINATION_QUERY,
    variables: {
      sort: 'releaseDate',
      last: 2,
      before: lastPage.data!.movieConnection.pageInfo.startCursor,
    },
  });

  expect(previousPage.data).toBeDefined();
  expect(previousPage.data!.movieConnection.edges).toHaveLength(2);
  expect(previousPage.data!.movieConnection.edges[0].node.id).toBe(
    'movies/movie-delta.md'
  );
  expect(previousPage.data!.movieConnection.edges[1].node.id).toBe(
    'movies/movie-gamma.md'
  );
  expect(previousPage.data!.movieConnection.pageInfo.hasPreviousPage).toBe(
    true
  );

  // First page
  const firstPage = await get({
    query: BACKWARD_PAGINATION_QUERY,
    variables: {
      sort: 'releaseDate',
      last: 2,
      before: previousPage.data!.movieConnection.pageInfo.startCursor,
    },
  });

  expect(firstPage.data).toBeDefined();
  expect(firstPage.data!.movieConnection.edges).toHaveLength(2);
  expect(firstPage.data!.movieConnection.edges[0].node.id).toBe(
    'movies/movie-gamma.md'
  );
  expect(firstPage.data!.movieConnection.edges[1].node.id).toBe(
    'movies/movie-beta.md'
  );
  expect(firstPage.data!.movieConnection.pageInfo.hasPreviousPage).toBe(true);

  // Get the very first page
  const veryFirstPage = await get({
    query: BACKWARD_PAGINATION_QUERY,
    variables: {
      sort: 'releaseDate',
      last: 1,
      before: firstPage.data!.movieConnection.pageInfo.startCursor,
    },
  });

  expect(veryFirstPage.data).toBeDefined();
  expect(veryFirstPage.data!.movieConnection.edges).toHaveLength(1);
  expect(veryFirstPage.data!.movieConnection.edges[0].node.id).toBe(
    'movies/movie-beta.md'
  );
  expect(veryFirstPage.data!.movieConnection.pageInfo.hasPreviousPage).toBe(
    true
  );

  // Get the actual first page
  const actualFirstPage = await get({
    query: BACKWARD_PAGINATION_QUERY,
    variables: {
      sort: 'releaseDate',
      last: 1,
      before: veryFirstPage.data!.movieConnection.pageInfo.startCursor,
    },
  });

  expect(actualFirstPage.data).toBeDefined();
  expect(actualFirstPage.data!.movieConnection.edges).toHaveLength(1);
  expect(actualFirstPage.data!.movieConnection.edges[0].node.id).toBe(
    'movies/movie-alpha.md'
  );
  expect(actualFirstPage.data!.movieConnection.pageInfo.hasPreviousPage).toBe(
    false
  );
});
*/
