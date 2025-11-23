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
  expect(format(result)).toMatchFileSnapshot('node.json');
});
