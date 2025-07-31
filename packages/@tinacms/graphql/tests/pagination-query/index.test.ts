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

// NOTE: The following test is incorrect.
// There is no consistency between how sequences of 1 or 2 pages are being returned.
/*
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
}); */

it('handles forward pagination when over-requesting items', async () => {
  const { get } = await setup(__dirname, config);

  // Get first 2 items to establish a cursor
  const firstPages = await get({
    query: FORWARD_PAGINATION_QUERY,
    variables: {
      sort: 'releaseDate',
      first: 2,
    },
  });

  expect(firstPages.data).toBeDefined();
  expect(firstPages.data!.movieConnection.edges).toHaveLength(2);
  expect(firstPages.data!.movieConnection.pageInfo.hasNextPage).toBe(true);

  // Request 10 items but only 3 remain
  const overRequestPage = await get({
    query: FORWARD_PAGINATION_QUERY,
    variables: {
      sort: 'releaseDate',
      first: 10,
      after: firstPages.data!.movieConnection.pageInfo.endCursor,
    },
  });

  expect(overRequestPage.data).toBeDefined();
  expect(overRequestPage.data!.movieConnection.edges).toHaveLength(3);
  expect(overRequestPage.data!.movieConnection.edges[0].node.id).toBe(
    'movies/movie-gamma.md'
  );
  expect(overRequestPage.data!.movieConnection.edges[1].node.id).toBe(
    'movies/movie-delta.md'
  );
  expect(overRequestPage.data!.movieConnection.edges[2].node.id).toBe(
    'movies/movie-epsilon.md'
  );
  expect(overRequestPage.data!.movieConnection.pageInfo.hasNextPage).toBe(
    false
  );
});

it('handles backward pagination when over-requesting items', async () => {
  const { get } = await setup(__dirname, config);

  // Get last 1 item to establish a cursor
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
  expect(lastPage.data!.movieConnection.pageInfo.hasPreviousPage).toBe(true);

  // Request 10 items but only 4 remain before epsilon
  const overRequestPage = await get({
    query: BACKWARD_PAGINATION_QUERY,
    variables: {
      sort: 'releaseDate',
      last: 10,
      before: lastPage.data!.movieConnection.pageInfo.startCursor,
    },
  });

  expect(overRequestPage.data).toBeDefined();
  expect(overRequestPage.data!.movieConnection.edges).toHaveLength(4);
  expect(overRequestPage.data!.movieConnection.edges[0].node.id).toBe(
    'movies/movie-delta.md'
  );
  expect(overRequestPage.data!.movieConnection.edges[1].node.id).toBe(
    'movies/movie-gamma.md'
  );
  expect(overRequestPage.data!.movieConnection.edges[2].node.id).toBe(
    'movies/movie-beta.md'
  );
  expect(overRequestPage.data!.movieConnection.edges[3].node.id).toBe(
    'movies/movie-alpha.md'
  );
  expect(overRequestPage.data!.movieConnection.pageInfo.hasPreviousPage).toBe(
    false
  );
});
