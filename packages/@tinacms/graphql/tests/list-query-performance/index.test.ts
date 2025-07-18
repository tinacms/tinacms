import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format, SlowMemoryLevel } from '../util';

const TEST_TIMEOUT = 5000;
const EACH_GET_DELAY = 1000;

it('retrieves a 4 item list within 5 seconds', async () => {
  const { get } = await setup(__dirname, config, new SlowMemoryLevel<string, Record<string, any>>(EACH_GET_DELAY));
  const result = await get({
    query: `query {
      movieConnection {
        totalCount
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
  expect(format(result)).toMatchFileSnapshot('node.json');
}, { timeout: TEST_TIMEOUT });
