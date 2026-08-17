import { it, expect } from 'vitest';
import config from './tina/config';
import { setup } from '../util';

const malformedCases: Array<{ name: string; query: string }> = [
  {
    name: 'filter referencing a field not declared on the collection',
    query: `query {
      movieConnection(filter: { ghostField: { eq: "anything" } }) {
        edges { node { id } }
      }
    }`,
  },
  {
    name: 'filter argument with the wrong scalar type for the field',
    query: `query {
      movieConnection(filter: { rating: { eq: "not-a-number" } }) {
        edges { node { id } }
      }
    }`,
  },
  {
    name: 'query against a collection that is not declared in the schema',
    query: `query {
      ghostCollectionConnection {
        edges { node { id } }
      }
    }`,
  },
];

it.each(malformedCases)('rejects $name', async ({ query }) => {
  const { get } = await setup(__dirname, config);

  const result = await get({ query, variables: {} });
  expect(result.errors).toBeDefined();
  expect(result.errors!.length).toBeGreaterThan(0);
});
