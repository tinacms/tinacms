import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('has the expected output and writes the expected string', async () => {
  const query = `query { document(collection: "post", relativePath: "in.md") { ...on Document { _values, _sys { title } }} }`;

  const { get } = await setup(__dirname, config);
  const result = await get({ query, variables: {} });
  expect(format(result)).toMatchFileSnapshot('document-query-node.json');
});

it('retrieves document using node field with ID', async () => {
  const nodeQuery = `query { node(id: "post/in.md") { ...on Document { _values, _sys { title } }} }`;
  const { get } = await setup(__dirname, config);
  const result = await get({ query: nodeQuery, variables: {} });
  expect(format(result)).toMatchFileSnapshot('node-query-node.json');
});
