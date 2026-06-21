import { codegen } from '@graphql-codegen/core';
import { loadDocuments } from '@graphql-tools/load';
import { buildSchema, parse } from 'graphql';
import { generateTypes } from './index';

jest.mock('@graphql-codegen/core', () => ({
  codegen: jest.fn(),
}));

jest.mock('@graphql-tools/load', () => ({
  loadDocuments: jest.fn(),
}));

jest.mock('@graphql-tools/graphql-file-loader', () => ({
  GraphQLFileLoader: jest.fn(),
}));

const mockedCodegen = codegen as jest.MockedFunction<typeof codegen>;
const mockedLoadDocuments = loadDocuments as jest.MockedFunction<
  typeof loadDocuments
>;

describe('generateTypes', () => {
  beforeEach(() => {
    mockedCodegen.mockReset();
    mockedLoadDocuments.mockReset();
  });

  it('throws when loaded documents fail schema validation', async () => {
    const schema = buildSchema(`
      type Query {
        post: Post
      }

      type Post {
        title: String!
      }
    `);

    mockedLoadDocuments
      .mockResolvedValueOnce([
        {
          document: parse(`
            query InvalidQuery {
              post {
                missingField
              }
            }
          `),
          location: 'queries.gql',
        },
      ])
      .mockResolvedValueOnce([]);

    await expect(
      generateTypes(schema, 'queries.gql', 'frags.gql', 'http://localhost:4001')
    ).rejects.toThrow('GraphQL Document Validation failed with 1 errors');
    expect(mockedCodegen).not.toHaveBeenCalled();
  });
});
