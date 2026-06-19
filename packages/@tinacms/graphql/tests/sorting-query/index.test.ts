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

it('sorts dates correctly including pre-1970 and across digit boundaries', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      movieConnection(sort: "releaseDate") {
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

  expect(result.errors).toBeUndefined();
  const edges = result.data!.movieConnection.edges;
  const dates = edges.map((e: any) => new Date(e.node.releaseDate).getTime());
  for (let i = 1; i < dates.length; i++) {
    expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
  }

  const titles = edges.map((e: any) => e.node.title);
  // Zeta Movie (1965) must appear first (pre-1970)
  expect(titles[0]).toBe('Zeta Movie');
  // Epsilon Movie (2001-09-01) must appear before Delta Movie (2018-05-10)
  const epsilonIndex = titles.indexOf('Epsilon Movie');
  const deltaIndex = titles.indexOf('Delta Movie');
  expect(epsilonIndex).toBeLessThan(deltaIndex);
});

it('sorts numbers correctly with mixed whole and decimal values', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      movieConnection(sort: "rating") {
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
  const ratings = edges.map((e: any) => e.node.rating);
  for (let i = 1; i < ratings.length; i++) {
    expect(ratings[i]).toBeGreaterThanOrEqual(ratings[i - 1]);
  }

  // Eta Movie (rating: 9) must sort between Alpha (8.5) and Gamma (9.1)
  const titles = edges.map((e: any) => e.node.title);
  const alphaIndex = titles.indexOf('Alpha Movie');
  const etaIndex = titles.indexOf('Eta Movie');
  const gammaIndex = titles.indexOf('Gamma Movie');
  expect(etaIndex).toBeGreaterThan(alphaIndex);
  expect(etaIndex).toBeLessThan(gammaIndex);
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
