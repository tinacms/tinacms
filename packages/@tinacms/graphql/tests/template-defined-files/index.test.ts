import { it, expect, describe } from 'vitest';
import config from './tina/config';
import { setup, setupMutation, format } from '../util';

it('queries single template-defined document', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      author(relativePath: "bob-northwind.md") {
        ... on Document {
          id
          _sys {
            filename
            extension
            path
          }
        }
        ... on AuthorPerson {
          name
          email
          bio
        }
      }
    }`,
    variables: {},
  });
  await expect(format(result)).toMatchFileSnapshot(
    'expected-snapshots/single-template-document.json'
  );
});

it('queries multi-template collection with union types', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      productConnection {
        edges {
          node {
            __typename
            ... on Document {
              id
              _sys {
                filename
                extension
                path
              }
            }
            ... on ProductBook {
              title
              isbn
              pages
            }
            ... on ProductSoftware {
              title
              version
              platform
            }
          }
        }
      }
    }`,
    variables: {},
  });
  await expect(format(result)).toMatchFileSnapshot(
    'expected-snapshots/multi-template-collection.json'
  );
});

it('queries specific template type from multi-template collection', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get({
    query: `query {
      product(relativePath: "accounting-book.md") {
        __typename
        ... on Document {
          id
          _sys {
            filename
            extension
            path
          }
        }
        ... on ProductBook {
          title
          isbn
          pages
        }
      }
    }`,
    variables: {},
  });
  await expect(format(result)).toMatchFileSnapshot(
    'expected-snapshots/specific-template-type.json'
  );
});

describe('Template-Defined Files Mutations', () => {
  describe('Create Document Tests', () => {
    it('creates single template collection document (author)', async () => {
      const { query, bridge } = await setupMutation(__dirname, config);

      const result = await query({
        query: `
          mutation {
            createDocument(
              collection: "author"
              relativePath: "new-author.md"
              params: {
                author: {
                  person: {
                    name: "Mr John Smith"
                    email: "john@smith.com"
                    bio: "CEO of Smith company"
                  }
                }
              }
            ) {
              __typename
              ... on Document {
                id
                _sys {
                  filename
                  extension
                  path
                }
              }
              ... on AuthorPerson {
                name
                email
                bio
              }
            }
          }
        `,
        variables: {},
      });

      await expect(format(result)).toMatchFileSnapshot(
        'expected-snapshots/create-author-response.json'
      );

      const newDocWrite = bridge.getWrite('authors/new-author.md');
      await expect(newDocWrite).toBeDefined();
      await expect(newDocWrite).toMatchFileSnapshot(
        'expected-snapshots/new-author-content.md'
      );
    });

    /*
     * The following test will fail as there is a bug in the Lookup generation that
     * fails to create the createAuthor entry correctly.
    it('creates single template collection document using collection-specific mutation', async () => {
      const { query, bridge } = await setupMutation(__dirname, config);

      const result = await query({
        query: `
          mutation {
            createAuthor(
              relativePath: "john-smith.md"
              params: {
                person: {
                  name: "Mr John Smith"
                  email: "john@smith.com"
                  bio: "CEO of Smith company"
                }
              }
            ) {
              __typename
              ... on Document {
                id
                _sys {
                  filename
                  extension
                  path
                }
              }
              ... on AuthorPerson {
                name
                email
                bio
              }
            }
          }
        `,
        variables: {},
      });

      expect(format(result)).toMatchFileSnapshot('expected-snapshots/create-author-specific-response.json');

      const newDocWrite = bridge.getWrite('authors/john-smith.md');
      expect(newDocWrite).toBeDefined();
      expect(newDocWrite).toMatchFileSnapshot('expected-snapshots/john-smith-content.md');
    }); */

    it('creates multi-template collection document with book template', async () => {
      const { query, bridge } = await setupMutation(__dirname, config);

      const result = await query({
        query: `
          mutation {
            createDocument(
              collection: "product"
              relativePath: "northwind-book.md"
              params: {
                product: {
                  book: {
                    title: "Northwind Business Guide"
                    isbn: "978-0-123456-78-9"
                    pages: 250
                  }
                }
              }
            ) {
              __typename
              ... on Document {
                id
                _sys {
                  filename
                  extension
                  path
                }
              }
              ... on ProductBook {
                title
                isbn
                pages
              }
            }
          }
        `,
        variables: {},
      });

      await expect(format(result)).toMatchFileSnapshot(
        'expected-snapshots/create-product-book-response.json'
      );

      const newDocWrite = bridge.getWrite('products/northwind-book.md');
      await expect(newDocWrite).toBeDefined();
      await expect(newDocWrite).toMatchFileSnapshot(
        'expected-snapshots/northwind-book-content.md'
      );
    });

    /*
     * The following test will fail as there is a bug in the Lookup generation that
     * fails to create the createProduct entry correctly.
    it('creates multi-template collection document with software template', async () => {
      const { query, bridge } = await setupMutation(__dirname, config);

      const result = await query({
        query: `
          mutation {
            createProduct(
              relativePath: "northwind-crm.md"
              params: {
                software: {
                  title: "Northwind CRM System"
                  version: "2.1.0"
                  platform: "web"
                }
              }
            ) {
              __typename
              ... on Document {
                id
                _sys {
                  filename
                  extension
                  path
                }
              }
              ... on ProductSoftware {
                title
                version
                platform
              }
            }
          }
        `,
        variables: {},
      });

      expect(format(result)).toMatchFileSnapshot('expected-snapshots/create-product-software-response.json');

      const newDocWrite = bridge.getWrite('products/northwind-crm.md');
      expect(newDocWrite).toBeDefined();
      expect(newDocWrite).toMatchFileSnapshot('expected-snapshots/northwind-crm-content.md');
    }); */
  });

  describe('Update Document Tests', () => {
    it('updates single template document using updateDocument', async () => {
      const { query, bridge } = await setupMutation(__dirname, config);

      const result = await query({
        query: `
          mutation {
            updateDocument(
              collection: "author"
              relativePath: "bob-northwind.md"
              params: {
                author: {
                  person: {
                    name: "Mr Bob Northwind"
                    email: "bob.northwind@northwind.com"
                    bio: "Updated CEO of Northwind company with extensive business experience"
                  }
                }
              }
            ) {
              __typename
              ... on Document {
                id
                _sys {
                  filename
                  extension
                  path
                }
              }
              ... on AuthorPerson {
                name
                email
                bio
              }
            }
          }
        `,
        variables: {},
      });

      await expect(format(result)).toMatchFileSnapshot(
        'expected-snapshots/update-author-response.json'
      );

      const updatedWrite = bridge.getWrite('authors/bob-northwind.md');
      await expect(updatedWrite).toBeDefined();
      await expect(updatedWrite).toMatchFileSnapshot(
        'expected-snapshots/updated-bob-northwind-content.md'
      );
    });

    it('updates single template document using collection-specific mutation', async () => {
      const { query, bridge } = await setupMutation(__dirname, config);

      const result = await query({
        query: `
          mutation {
            updateAuthor(
              relativePath: "bob-northwind.md"
              params: {
                person: {
                  name: "Mr Bob Northwind"
                  email: "ceo@northwind.com"
                  bio: "Founder and CEO of Northwind company"
                }
              }
            ) {
              __typename
              ... on Document {
                id
                _sys {
                  filename
                  extension
                  path
                }
              }
            }
          }
        `,
        variables: {},
      });

      await expect(format(result)).toMatchFileSnapshot(
        'expected-snapshots/update-author-specific-response.json'
      );

      const updatedWrite = bridge.getWrite('authors/bob-northwind.md');
      await expect(updatedWrite).toBeDefined();
      await expect(updatedWrite).toMatchFileSnapshot(
        'expected-snapshots/updated-bob-northwind-specific-content.md'
      );
    });

    it('updates multi-template document with book template', async () => {
      const { query, bridge } = await setupMutation(__dirname, config);

      const result = await query({
        query: `
          mutation {
            updateDocument(
              collection: "product"
              relativePath: "accounting-book.md"
              params: {
                product: {
                  book: {
                    title: "Advanced Accounting for Northwind"
                    isbn: "978-0-987654-32-1"
                    pages: 350
                  }
                }
              }
            ) {
              __typename
              ... on Document {
                id
                _sys {
                  filename
                  extension
                  path
                }
              }
              ... on ProductBook {
                title
                isbn
                pages
              }
            }
          }
        `,
        variables: {},
      });

      await expect(format(result)).toMatchFileSnapshot(
        'expected-snapshots/update-product-book-response.json'
      );

      const updatedWrite = bridge.getWrite('products/accounting-book.md');
      await expect(updatedWrite).toBeDefined();
      await expect(updatedWrite).toMatchFileSnapshot(
        'expected-snapshots/updated-accounting-book-content.md'
      );
    });

    it('updates multi-template document with software template', async () => {
      const { query, bridge } = await setupMutation(__dirname, config);

      const result = await query({
        query: `
          mutation {
            updateProduct(
              relativePath: "crm-software.md"
              params: {
                software: {
                  title: "Northwind CRM Enterprise"
                  version: "3.0.0"
                  platform: "cloud"
                }
              }
            ) {
              __typename
              ... on Document {
                id
                _sys {
                  filename
                  extension
                  path
                }
              }
              ... on ProductSoftware {
                title
                version
                platform
              }
            }
          }
        `,
        variables: {},
      });

      await expect(format(result)).toMatchFileSnapshot(
        'expected-snapshots/update-product-software-response.json'
      );

      const updatedWrite = bridge.getWrite('products/crm-software.md');
      expect(updatedWrite).toBeDefined();
      await expect(updatedWrite).toMatchFileSnapshot(
        'expected-snapshots/updated-crm-software-content.md'
      );
    });
  });

  describe('Error Handling Tests', () => {
    it('handles invalid template for collection', async () => {
      const { query, bridge } = await setupMutation(__dirname, config);

      const result = await query({
        query: `
          mutation {
            createDocument(
              collection: "author"
              relativePath: "invalid-template.md"
              params: {
                author: {
                  book: {
                    title: "This field doesn't exist in author template"
                    isbn: "978-0-123456-78-9"
                    pages: 250
                  }
                }
              }
            ) {
              __typename
            }
          }
        `,
        variables: {},
      });

      await expect(format(result)).toMatchFileSnapshot(
        'expected-snapshots/invalid-template-error.json'
      );

      // Verify no file was written when mutation fails
      const writes = bridge.getWrites();
      expect(writes).not.toHaveProperty('authors/invalid-template.md');
    });

    it('handles update of non-existent document', async () => {
      const { query, bridge } = await setupMutation(__dirname, config);

      const result = await query({
        query: `
          mutation {
            updateDocument(
              collection: "author"
              relativePath: "non-existent-author.md"
              params: {
                author: {
                  person: {
                    name: "Mr John Smith"
                    email: "john@smith.com"
                    bio: "CEO of Smith company"
                  }
                }
              }
            ) {
              __typename
            }
          }
        `,
        variables: {},
      });

      await expect(format(result)).toMatchFileSnapshot(
        'expected-snapshots/update-nonexistent-document-error.json'
      );

      // Verify no files were written when update fails
      const writes = bridge.getWrites();
      expect(writes).not.toHaveProperty('authors/non-existent-author.md');
    });
  });
});
