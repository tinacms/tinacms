import { Collection } from '../types';
import { TinaSchema } from './TinaSchema';

describe('TinaSchema', () => {
  describe('getCollectionByFullPath', () => {
    const testCollection = (
      name: string,
      path: string,
      format: 'mdx' | 'json'
    ): Collection => {
      return {
        label: name,
        name,
        path,
        format,
        fields: [
          {
            label: 'field',
            type: 'string',
            name: 'field',
          },
        ],
      };
    };
    const schemaWithoutRoot = new TinaSchema({
      collections: [
        testCollection('test', 'content/test', 'mdx'),
        testCollection('test2', 'content/test2', 'mdx'),
        testCollection('test3', '/content/test3', 'mdx'),
        testCollection('test4', '/content/test4/', 'mdx'),
        testCollection('test5', 'content/test', 'json'),
      ],
    });
    const schemaWithRoot = new TinaSchema({
      collections: [
        testCollection('test', '', 'mdx'),
        testCollection('test2', 'content', 'mdx'),
        testCollection('test3', 'content', 'json'),
      ],
    });

    const expectCollectionFound = (
      schema: TinaSchema,
      path: string,
      collectionName: string
    ) => {
      const collection = schema.getCollectionByFullPath(path);
      expect(collection?.name).toEqual(collectionName);
    };
    const expectNoCollectionFound = (schema: TinaSchema, path: string) => {
      expect(() => schema.getCollectionByFullPath(path)).toThrow();
    };

    it('fetches correct collection with getCollectionByFullPath in schema without root', async () => {
      expectCollectionFound(
        schemaWithoutRoot,
        'content/test/foobar.mdx',
        'test'
      );
      expectCollectionFound(
        schemaWithoutRoot,
        'content/test2/foobar.mdx',
        'test2'
      );
      expectCollectionFound(
        schemaWithoutRoot,
        'content/test3/foobar.mdx',
        'test3'
      );
      expectCollectionFound(
        schemaWithoutRoot,
        'content/test4/foobar.mdx',
        'test4'
      );
      expectCollectionFound(
        schemaWithoutRoot,
        '/content/test/foobar.mdx',
        'test'
      );
      expectCollectionFound(
        schemaWithoutRoot,
        'content/test/foobar.json',
        'test5'
      );
    });

    it('getCollectionByPath throws exception if path not in known collection in schema without root', async () => {
      expectNoCollectionFound(
        schemaWithoutRoot,
        'content/no-matching-collection/foobar.mdx'
      );
      expectNoCollectionFound(schemaWithoutRoot, 'content/test2/foobar.json');
    });

    it('fetches correct collection with getCollectionByFullPath in schema with root', async () => {
      expectCollectionFound(schemaWithRoot, 'foobar.mdx', 'test');
      expectCollectionFound(schemaWithRoot, 'content.mdx', 'test');
      expectCollectionFound(schemaWithRoot, '/foobar.mdx', 'test');
      expectCollectionFound(schemaWithRoot, '/content.mdx', 'test');
      expectCollectionFound(schemaWithRoot, 'content/foobar.mdx', 'test2');
      expectCollectionFound(schemaWithRoot, 'content/foobar.json', 'test3');
      expectCollectionFound(schemaWithRoot, '/content/foobar.mdx', 'test2');
      expectCollectionFound(
        schemaWithRoot,
        'content/sub-dir/foobar.mdx',
        'test2'
      );
    });

    it('getCollectionByPath throws exception if path not in known collection in schema with root', async () => {
      expectNoCollectionFound(schemaWithRoot, 'foobar.json');
    });
  });

  describe('findReferencesFromCollection', () => {
    it('should find a single reference field', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'post',
            path: 'post',
            fields: [
              {
                type: 'reference',
                name: 'author',
                collections: ['author'],
              },
            ],
          },
        ],
      });

      const references = schema.findReferencesFromCollection('post');
      expect(references).toEqual({
        author: ['$.author'],
      });
    });

    it('should find multiple reference fields', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'post',
            path: 'post',
            fields: [
              {
                type: 'reference',
                name: 'author',
                collections: ['author'],
              },
              {
                type: 'reference',
                name: 'category',
                collections: ['category'],
              },
            ],
          },
        ],
      });

      const references = schema.findReferencesFromCollection('post');
      expect(references).toEqual({
        author: ['$.author'],
        category: ['$.category'],
      });
    });

    it('should find references in a list of objects', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'post',
            path: 'post',
            fields: [
              {
                type: 'object',
                name: 'authors',
                list: true,
                fields: [
                  {
                    type: 'reference',
                    name: 'author',
                    collections: ['author'],
                  },
                ],
              },
            ],
          },
        ],
      });

      const references = schema.findReferencesFromCollection('post');
      expect(references).toEqual({
        author: ['$.authors[*].author'],
      });
    });

    it('should find nested reference fields', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'post',
            path: 'post',
            fields: [
              {
                type: 'object',
                name: 'metadata',
                fields: [
                  {
                    type: 'reference',
                    name: 'author',
                    collections: ['author'],
                  },
                  {
                    type: 'reference',
                    name: 'editor',
                    collections: ['editor'],
                  },
                ],
              },
            ],
          },
        ],
      });

      const references = schema.findReferencesFromCollection('post');
      expect(references).toEqual({
        author: ['$.metadata.author'],
        editor: ['$.metadata.editor'],
      });
    });

    it('should find references across multiple collections', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'post',
            path: 'post',
            fields: [
              {
                type: 'reference',
                name: 'author',
                collections: ['author'],
              },
            ],
          },
          {
            name: 'author',
            path: 'author',
            fields: [
              {
                type: 'reference',
                name: 'publisher',
                collections: ['publisher'],
              },
            ],
          },
        ],
      });

      const postReferences = schema.findReferencesFromCollection('post');
      expect(postReferences).toEqual({
        author: ['$.author'],
      });

      const authorReferences = schema.findReferencesFromCollection('author');
      expect(authorReferences).toEqual({
        publisher: ['$.publisher'],
      });
    });

    it('should return an empty object if no references exist', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'post',
            path: 'post',
            fields: [
              {
                type: 'string',
                name: 'title',
              },
            ],
          },
        ],
      });

      const references = schema.findReferencesFromCollection('post');
      expect(references).toEqual({});
    });

    it('should return an empty object if no references exist', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'post',
            path: 'post',
            fields: [
              {
                type: 'string',
                name: 'title',
              },
            ],
          },
        ],
      });

      const references = schema.findReferencesFromCollection('post');
      expect(references).toEqual({});
    });

    it('should find references in templates', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'post',
            path: 'post',
            templates: [
              {
                name: 'article',
                fields: [
                  {
                    type: 'reference',
                    name: 'author',
                    collections: ['author'],
                  },
                ],
              },
            ],
          },
        ],
      });

      const references = schema.findReferencesFromCollection('post');
      expect(references).toEqual({
        author: ['$.article.author'],
      });
    });

    it('should find references in nested templates', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'post',
            path: 'post',
            templates: [
              {
                name: 'article',
                fields: [
                  {
                    type: 'object',
                    name: 'metadata',
                    fields: [
                      {
                        type: 'reference',
                        name: 'author',
                        collections: ['author'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      const references = schema.findReferencesFromCollection('post');
      expect(references).toEqual({
        author: ['$.article.metadata.author'],
      });
    });
  });

  describe('walkFields', () => {
    it('should walk a single non-list, non-nested field', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'simpleCollection',
            path: 'simpleCollection',
            fields: [
              {
                type: 'string',
                name: 'title',
              },
            ],
          },
        ],
      });
      const mockCb = jest.fn();
      schema.walkFields(mockCb);

      expect(mockCb).toHaveBeenCalledTimes(1);
      expect(mockCb).toHaveBeenCalledWith({
        collection: {
          name: 'simpleCollection',
          path: 'simpleCollection',
          format: 'md',
          slug: 'simpleCollection',
          fields: [
            {
              name: 'title',
              type: 'string',
              searchable: true,
              uid: false,
            },
          ],
        },
        field: {
          name: 'title',
          type: 'string',
          searchable: true,
          uid: false,
        },
        path: '$.title',
      });
    });

    it('should walk all fields with list of objects', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'simpleCollection',
            path: 'simpleCollection',
            fields: [
              {
                type: 'object',
                name: 'authorRefList',
                list: true,
                fields: [
                  {
                    type: 'reference',
                    label: 'Author',
                    name: 'author',
                    collections: ['author'],
                  },
                ],
              },
            ],
          },
        ],
      });
      const mockCb = jest.fn();
      schema.walkFields(mockCb);

      expect(mockCb).toHaveBeenCalledTimes(2);
      expect(mockCb).toHaveBeenCalledWith({
        collection: {
          name: 'simpleCollection',
          path: 'simpleCollection',
          format: 'md',
          slug: 'simpleCollection',
          fields: [
            {
              name: 'authorRefList',
              type: 'object',
              searchable: true,
              uid: false,
              list: true,
              fields: [
                {
                  type: 'reference',
                  label: 'Author',
                  name: 'author',
                  collections: ['author'],
                  searchable: true,
                  uid: false,
                },
              ],
            },
          ],
        },
        field: {
          name: 'authorRefList',
          type: 'object',
          list: true,
          searchable: true,
          uid: false,
          fields: [
            {
              type: 'reference',
              label: 'Author',
              name: 'author',
              collections: ['author'],
              searchable: true,
              uid: false,
            },
          ],
        },
        path: '$.authorRefList[*]',
      });
      expect(mockCb).toHaveBeenCalledWith({
        collection: {
          name: 'simpleCollection',
          path: 'simpleCollection',
          format: 'md',
          slug: 'simpleCollection',
          fields: [
            {
              name: 'authorRefList',
              type: 'object',
              searchable: true,
              uid: false,
              list: true,
              fields: [
                {
                  type: 'reference',
                  label: 'Author',
                  name: 'author',
                  collections: ['author'],
                  searchable: true,
                  uid: false,
                },
              ],
            },
          ],
        },
        field: {
          type: 'reference',
          label: 'Author',
          name: 'author',
          collections: ['author'],
          searchable: true,
          uid: false,
        },
        path: '$.authorRefList[*].author',
      });
    });

    it('should walk nested fields within an object', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'nestedCollection',
            path: 'nestedCollection',
            fields: [
              {
                type: 'object',
                name: 'metadata',
                fields: [
                  {
                    type: 'string',
                    name: 'description',
                  },
                  {
                    type: 'number',
                    name: 'priority',
                  },
                ],
              },
            ],
          },
        ],
      });
      const mockCb = jest.fn();
      schema.walkFields(mockCb);

      expect(mockCb).toHaveBeenCalledTimes(3);
      expect(mockCb).toHaveBeenCalledWith({
        collection: {
          name: 'nestedCollection',
          path: 'nestedCollection',
          format: 'md',
          slug: 'nestedCollection',
          fields: [
            {
              name: 'metadata',
              type: 'object',
              searchable: true,
              uid: false,
              fields: [
                {
                  name: 'description',
                  type: 'string',
                  searchable: true,
                  uid: false,
                },
                {
                  name: 'priority',
                  type: 'number',
                  searchable: true,
                  uid: false,
                },
              ],
            },
          ],
        },
        field: {
          name: 'metadata',
          type: 'object',
          searchable: true,
          uid: false,
          fields: [
            {
              name: 'description',
              type: 'string',
              searchable: true,
              uid: false,
            },
            {
              name: 'priority',
              type: 'number',
              searchable: true,
              uid: false,
            },
          ],
        },
        path: '$.metadata',
      });
      expect(mockCb).toHaveBeenCalledWith({
        collection: {
          name: 'nestedCollection',
          path: 'nestedCollection',
          format: 'md',
          slug: 'nestedCollection',
          fields: [
            {
              name: 'metadata',
              type: 'object',
              searchable: true,
              uid: false,
              fields: [
                {
                  name: 'description',
                  type: 'string',
                  searchable: true,
                  uid: false,
                },
                {
                  name: 'priority',
                  type: 'number',
                  searchable: true,
                  uid: false,
                },
              ],
            },
          ],
        },
        field: {
          name: 'description',
          type: 'string',
          searchable: true,
          uid: false,
        },
        path: '$.metadata.description',
      });
      expect(mockCb).toHaveBeenCalledWith({
        collection: {
          name: 'nestedCollection',
          path: 'nestedCollection',
          format: 'md',
          slug: 'nestedCollection',
          fields: [
            {
              name: 'metadata',
              type: 'object',
              searchable: true,
              uid: false,
              fields: [
                {
                  name: 'description',
                  type: 'string',
                  searchable: true,
                  uid: false,
                },
                {
                  name: 'priority',
                  type: 'number',
                  searchable: true,
                  uid: false,
                },
              ],
            },
          ],
        },
        field: {
          name: 'priority',
          type: 'number',
          searchable: true,
          uid: false,
        },
        path: '$.metadata.priority',
      });
    });

    it('should walk a list of primitive fields', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'listCollection',
            path: 'listCollection',
            fields: [
              {
                type: 'string',
                name: 'tags',
                list: true,
              },
            ],
          },
        ],
      });
      const mockCb = jest.fn();
      schema.walkFields(mockCb);

      expect(mockCb).toHaveBeenCalledTimes(1);
      expect(mockCb).toHaveBeenCalledWith({
        collection: {
          name: 'listCollection',
          path: 'listCollection',
          format: 'md',
          slug: 'listCollection',
          fields: [
            {
              name: 'tags',
              type: 'string',
              searchable: true,
              uid: false,
              list: true,
            },
          ],
        },
        field: {
          name: 'tags',
          type: 'string',
          searchable: true,
          uid: false,
          list: true,
        },
        path: '$.tags[*]',
      });
    });

    it('should walk body with templates', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'post',
            path: 'post',
            fields: [
              {
                name: 'body',
                type: 'rich-text',
                isBody: true,
                templates: [
                  {
                    name: 'WarningCallout',
                    label: 'WarningCallout',
                    match: {
                      start: '{%',
                      end: '%}',
                    },
                    fields: [
                      {
                        name: 'text',
                        label: 'Text',
                        type: 'string',
                        required: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
      const mockCb = jest.fn();
      schema.walkFields(mockCb);

      expect(mockCb).toHaveBeenCalledTimes(2);
      expect(mockCb).toHaveBeenCalledWith({
        collection: {
          name: 'post',
          format: 'md',
          slug: 'post',
          path: 'post',
          fields: [
            {
              name: 'body',
              type: 'rich-text',
              isBody: true,
              parser: {
                type: 'markdown',
              },
              uid: false,
              searchable: true,
              templates: [
                {
                  name: 'WarningCallout',
                  label: 'WarningCallout',
                  match: {
                    start: '{%',
                    end: '%}',
                  },
                  fields: [
                    {
                      name: 'text',
                      label: 'Text',
                      type: 'string',
                      required: true,
                      searchable: true,
                      uid: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
        field: {
          name: 'body',
          type: 'rich-text',
          isBody: true,
          uid: false,
          parser: {
            type: 'markdown',
          },
          searchable: true,
          templates: [
            {
              name: 'WarningCallout',
              label: 'WarningCallout',
              match: {
                start: '{%',
                end: '%}',
              },
              fields: [
                {
                  name: 'text',
                  label: 'Text',
                  type: 'string',
                  required: true,
                  searchable: true,
                  uid: false,
                },
              ],
            },
          ],
        },
        path: '$.body',
      });

      expect(mockCb).toHaveBeenCalledWith({
        collection: {
          name: 'post',
          format: 'md',
          slug: 'post',
          path: 'post',
          fields: [
            {
              name: 'body',
              type: 'rich-text',
              isBody: true,
              parser: {
                type: 'markdown',
              },
              searchable: true,
              templates: [
                {
                  name: 'WarningCallout',
                  label: 'WarningCallout',
                  match: {
                    start: '{%',
                    end: '%}',
                  },
                  fields: [
                    {
                      name: 'text',
                      label: 'Text',
                      type: 'string',
                      required: true,
                      searchable: true,
                      uid: false,
                    },
                  ],
                },
              ],
              uid: false,
            },
          ],
        },
        field: {
          name: 'text',
          label: 'Text',
          type: 'string',
          required: true,
          searchable: true,
          uid: false,
        },
        path: '$.body.WarningCallout.text',
      });
    });

    it('should handle an empty collection', () => {
      const schema = new TinaSchema({
        collections: [],
      });
      const mockCb = jest.fn();
      schema.walkFields(mockCb);

      expect(mockCb).not.toHaveBeenCalled();
    });

    it('should handle a collection with no fields', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'emptyCollection',
            path: 'emptyCollection',
            fields: [],
          },
        ],
      });
      const mockCb = jest.fn();
      schema.walkFields(mockCb);

      expect(mockCb).not.toHaveBeenCalled();
    });
  });
});
