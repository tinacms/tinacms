import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('retrieves collection metadata and schema information', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      collection(collection: "article") {
        name
        label
        path
        format
        fields
        templates
      }
    }`,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot('node.json');
});
