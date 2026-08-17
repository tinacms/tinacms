import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('retrieves collection document list', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      directorsConnection {
        totalCount
        edges {
          node {
            id
            name
            bio
            yearsActive
            nationality
          }
        }
      }
    }`,
    variables: {},
  });
  await expect(format(result)).toMatchFileSnapshot('node.json');
});

it('returns empty edges and zero totalCount for an empty collection', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      screenwritersConnection {
        totalCount
        edges {
          node {
            id
            name
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }`,
    variables: {},
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.screenwritersConnection.totalCount).toBe(0);
  expect(result.data?.screenwritersConnection.edges).toEqual([]);
  expect(result.data?.screenwritersConnection.pageInfo.hasNextPage).toBe(false);
  expect(result.data?.screenwritersConnection.pageInfo.hasPreviousPage).toBe(
    false
  );
});
