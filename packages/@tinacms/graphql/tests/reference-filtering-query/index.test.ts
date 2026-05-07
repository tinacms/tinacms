import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('filters movies by director name using direct reference', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      moviesByBobNorthwind: movieConnection(filter: { director: { director: { name: { eq: "Bob Northwind" } } } }) {
        edges {
          node {
            id
            title
            director {
              ... on Director {
                name
              }
            }
          }
        }
      }
      moviesByCharlieSouthwind: movieConnection(filter: { director: { director: { name: { eq: "Charlie Southwind" } } } }) {
        edges {
          node {
            id
            title
            director {
              ... on Director {
                name
              }
            }
          }
        }
      }
    }`,
    variables: {},
  });
  await expect(format(result)).toMatchFileSnapshot('node.json');
});

it('filters movies by nested reference traversal', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      moviesByAlicesParent: movieConnection(filter: { director: { director: { relatives: { child: { relative: { name: { eq: "Alice Eastwind" } } } } } } }) {
        edges {
          node {
            id
            title
            director {
              ... on Director {
                name
              }
            }
          }
        }
      }
    }`,
    variables: {},
  });
  await expect(format(result)).toMatchFileSnapshot(
    'nested-reference-node.json'
  );
});
