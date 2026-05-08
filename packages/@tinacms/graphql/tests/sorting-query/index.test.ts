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
  await expect(format(result)).toMatchFileSnapshot('node.json');
});

it('combines sort with filter, returning sorted results from the filtered subset only', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      movieConnection(
        sort: "rating"
        filter: { rating: { gte: 8.0 } }
      ) {
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

  expect(result.errors).toBeUndefined();
  const edges = result.data!.movieConnection.edges;
  expect(edges.length).toBeGreaterThan(0);
  for (const edge of edges) {
    expect(edge.node.rating).toBeGreaterThanOrEqual(8.0);
  }
  for (let i = 1; i < edges.length; i++) {
    expect(edges[i].node.rating).toBeGreaterThanOrEqual(
      edges[i - 1].node.rating
    );
  }
});
