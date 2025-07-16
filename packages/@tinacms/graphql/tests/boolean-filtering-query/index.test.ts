import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('filters movies by boolean archived operations', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      archivedTrue: movieConnection(filter: { archived: { eq: true } }, sort: "title") {
        edges {
          node {
            id
            title
            archived
          }
        }
      },
      archivedFalse: movieConnection(filter: { archived: { eq: false } }, sort: "title") {
        edges {
          node {
            id
            title
            archived
          }
        }
      }
    }`,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot('node.json');
});
