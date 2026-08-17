import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const createArticleMutation = `
  mutation {
    addPendingDocument(
      collection: "page"
      relativePath: "new-article.md"
      template: "article"
    ) {
      __typename
    }
  }
`;

const createProductMutation = `
  mutation {
    addPendingDocument(
      collection: "page"
      relativePath: "new-product.md"
      template: "product"
    ) {
      __typename
    }
  }
`;

it('creates pending document with article template and validates bridge writes', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({ query: createArticleMutation, variables: {} });
  await expect(format(result)).toMatchFileSnapshot(
    'addPendingDocument-article-response.json'
  );

  const newDocWrite = bridge.getWrite('pages/new-article.md');
  expect(newDocWrite).toBeDefined();
  await expect(newDocWrite).toMatchFileSnapshot('new-article-content.md');
});

it('creates pending document with product template and validates bridge writes', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({ query: createProductMutation, variables: {} });
  await expect(format(result)).toMatchFileSnapshot(
    'addPendingDocument-product-response.json'
  );

  const newDocWrite = bridge.getWrite('pages/new-product.md');
  expect(newDocWrite).toBeDefined();
  await expect(newDocWrite).toMatchFileSnapshot('new-product-content.md');
});
