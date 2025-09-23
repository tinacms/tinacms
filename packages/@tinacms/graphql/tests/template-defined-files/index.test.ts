import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

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
        ... on AuthorAuthor {
          name
          email
          bio
        }
      }
    }`,
    variables: {},
  });
  expect(format(result)).toMatchFileSnapshot('single-template-document.json');
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
  expect(format(result)).toMatchFileSnapshot('multi-template-collection.json');
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
  expect(format(result)).toMatchFileSnapshot('specific-template-type.json');
});