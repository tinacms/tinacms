import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('handles multi-field sorting operations using index', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      multiFieldSort: movieConnection(sort: "release-rating") {
        edges {
          node {
            id
            title
            releaseDate
            rating
          }
        }
      }
    }`,
    variables: {},
  });
  await expect(format(result)).toMatchFileSnapshot('node.json');
});

it('surfaces a GraphQL error when sort key matches no defined index or field', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      movieConnection(sort: "non-existent-index") {
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

  expect(result.errors).toBeDefined();
  expect(result.errors!.length).toBeGreaterThan(0);
  expect(result.errors![0].path).toContain('movieConnection');
});
