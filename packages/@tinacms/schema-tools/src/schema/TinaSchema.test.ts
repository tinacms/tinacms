import { TinaSchema } from './TinaSchema'

describe('TinaSchema', () => {
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
      })

      const references = schema.findReferencesFromCollection('post')
      expect(references).toEqual({
        author: ['$.author'],
      })
    })

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
      })

      const references = schema.findReferencesFromCollection('post')
      expect(references).toEqual({
        author: ['$.author'],
        category: ['$.category'],
      })
    })

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
      })

      const references = schema.findReferencesFromCollection('post')
      expect(references).toEqual({
        author: ['$.authors[*].author'],
      })
    })

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
      })

      const references = schema.findReferencesFromCollection('post')
      expect(references).toEqual({
        author: ['$.metadata.author'],
        editor: ['$.metadata.editor'],
      })
    })

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
      })

      const postReferences = schema.findReferencesFromCollection('post')
      expect(postReferences).toEqual({
        author: ['$.author'],
      })

      const authorReferences = schema.findReferencesFromCollection('author')
      expect(authorReferences).toEqual({
        publisher: ['$.publisher'],
      })
    })

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
      })

      const references = schema.findReferencesFromCollection('post')
      expect(references).toEqual({})
    })

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
      })

      const references = schema.findReferencesFromCollection('post')
      expect(references).toEqual({})
    })

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
      })

      const references = schema.findReferencesFromCollection('post')
      expect(references).toEqual({
        author: ['$.article.author'],
      })
    })

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
      })

      const references = schema.findReferencesFromCollection('post')
      expect(references).toEqual({
        author: ['$.article.metadata.author'],
      })
    })
  })

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
      })
      const mockCb = jest.fn()
      schema.walkFields(mockCb)

      expect(mockCb).toHaveBeenCalledTimes(1)
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
      })
    })

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
      })
      const mockCb = jest.fn()
      schema.walkFields(mockCb)

      expect(mockCb).toHaveBeenCalledTimes(2)
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
      })
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
      })
    })
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
      })
      const mockCb = jest.fn()
      schema.walkFields(mockCb)

      expect(mockCb).toHaveBeenCalledTimes(3)
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
      })
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
      })
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
      })
    })
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
      })
      const mockCb = jest.fn()
      schema.walkFields(mockCb)

      expect(mockCb).toHaveBeenCalledTimes(1)
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
      })
    })

    it('should handle an empty collection', () => {
      const schema = new TinaSchema({
        collections: [],
      })
      const mockCb = jest.fn()
      schema.walkFields(mockCb)

      expect(mockCb).not.toHaveBeenCalled()
    })

    it('should handle a collection with no fields', () => {
      const schema = new TinaSchema({
        collections: [
          {
            name: 'emptyCollection',
            path: 'emptyCollection',
            fields: [],
          },
        ],
      })
      const mockCb = jest.fn()
      schema.walkFields(mockCb)

      expect(mockCb).not.toHaveBeenCalled()
    })
  })
})
