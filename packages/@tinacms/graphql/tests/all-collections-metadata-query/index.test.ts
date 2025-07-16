import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('retrieves list of all collections', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      collections {
        name
        label
        path
        format
        fields
      }
    }`,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot('node.json');
});
