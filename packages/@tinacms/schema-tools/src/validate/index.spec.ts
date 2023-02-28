/**

*/

import { Schema } from '../types'
import { validateSchema } from '.'

let consoleErrMock
beforeEach(() => {
  consoleErrMock = jest.spyOn(console, 'error').mockImplementation()
})
afterEach(() => {
  consoleErrMock.mockRestore()
})
const validSchemaWithTemplates: Schema = {
  collections: [
    {
      name: 'page',
      path: 'content/page',
      label: 'Page',
      format: 'mdx',
      templates: [
        {
          name: 'foo',
          label: 'bar',
          fields: [{ type: 'string', name: 'foo' }],
        },
      ],
    },
  ],
}

const validSchema: Schema = {
  collections: [
    {
      name: 'page',
      path: 'content/page',
      label: 'Page',
      format: 'mdx',
      fields: [
        {
          label: 'Title',
          name: 'Title',
          type: 'string',
        },
        {
          name: 'body',
          label: 'Main Content',
          type: 'rich-text',
          isBody: true,
        },
      ],
    },
    {
      label: 'Blog Posts',
      name: 'post',
      path: 'content/post',
      format: 'md',
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'object',
          label: 'Related Posts',
          name: 'posts',
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.label }
            },
          },
          fields: [
            {
              name: 'post',
              type: 'reference',
              collections: ['post'],
            },
            {
              type: 'object',
              label: 'Something',
              name: 'foo',
              fields: [
                {
                  name: 'bar',
                  type: 'string',
                },
                {
                  type: 'object',
                  label: 'Something',
                  name: 'foo',
                  fields: [
                    {
                      name: 'bar',
                      type: 'string',
                    },
                    {
                      type: 'object',
                      label: 'Something',
                      name: 'foo',
                      fields: [
                        {
                          name: 'bar',
                          type: 'string',
                        },
                        {
                          type: 'object',
                          label: 'Something',
                          name: 'foo',
                          fields: [
                            {
                              name: 'bar',
                              type: 'string',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'label',
              type: 'string',
            },
          ],
        },
        {
          type: 'object',
          label: 'Something',
          name: 'foo',
          fields: [
            {
              name: 'bar',
              label: 'Bar',
              type: 'string',
            },
          ],
        },
        {
          type: 'string',

          label: 'Topic',
          name: 'topic',
          options: ['programming', 'blacksmithing'],
          list: true,
        },
        {
          type: 'rich-text',
          label: 'Blog Post Body',
          name: 'body',
          isBody: true,
          templates: [
            {
              name: 'Gallery',
              label: 'Gallery',
              fields: [
                {
                  label: 'Images',
                  name: 'images',
                  type: 'object',
                  list: true,
                  fields: [
                    {
                      type: 'image',
                      name: 'src',
                      label: 'Source',
                    },
                    {
                      type: 'string',
                      name: 'width',
                      label: 'Width',
                    },
                    {
                      type: 'string',
                      name: 'height',
                      label: 'Height',
                    },
                  ],
                },
                {
                  type: 'string',
                  name: 'alignment',
                  label: 'Alignment',
                  options: ['left', 'center', 'right'],
                },
                {
                  type: 'string',
                  name: 'gap',
                  label: 'Gap',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
const schemaWithBadFormat = {
  collections: [
    {
      name: 'foo',
      path: 'foo/bar',
      format: 'not a format',
      fields: [{ name: 'foo', type: 'string' }],
    },
  ],
}

const schemaWitNoName = {
  collections: [
    {
      path: 'foo/bar',
      fields: [{ name: 'foo', type: 'string' }],
    },
  ],
}
const schemaWithDuplicateName: Schema = {
  collections: [
    {
      name: 'foo',
      path: 'foo/bar',
      fields: [{ name: 'foo', type: 'string' }],
    },
    {
      name: 'foo',
      path: 'foo/bar',
      fields: [{ name: 'foo', type: 'string' }],
    },
  ],
}

const schemaWithDuplicateTemplates: Schema = {
  collections: [
    {
      name: 'foo',
      path: 'foo/bar',
      templates: [
        {
          name: 'foo',
          label: 'foo',
          fields: [{ name: 'foo', type: 'string' }],
        },
        {
          name: 'foo',
          label: 'foo',
          fields: [{ name: 'foo', type: 'string' }],
        },
      ],
    },
  ],
}

const schemaWithDeeplyNestedError: Schema = {
  collections: [
    {
      name: 'foo',
      path: 'foo/bar',
      fields: [
        {
          type: 'object',
          label: 'Something',
          name: 'foo',
          fields: [
            {
              type: 'object',
              label: 'Something',
              name: 'foo',
              fields: [
                {
                  name: 'bar',
                  type: 'string',
                },
                {
                  type: 'object',
                  label: 'Something',
                  name: 'foo',
                  fields: [
                    {
                      name: 'bar',
                      type: 'string',
                    },
                    {
                      type: 'object',
                      label: 'Something',
                      name: 'foo',
                      fields: [
                        {
                          name: 'bar',
                          // @ts-ignore
                          type: 'not a type',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
const schemaWithTemplatesAndFields = {
  collections: [
    {
      name: 'foo',
      label: 'Foo',
      path: '/foo',
      fields: [{ name: 'foo', type: 'string' }],
      templates: [
        {
          name: 'bar',
          label: 'Bar',
          fields: [{ name: 'foo', type: 'string' }],
        },
      ],
    },
  ],
}

const schemaWithEmptyFields: Schema = {
  collections: [
    {
      name: 'foo',
      label: 'Foo',
      path: '/foo',
      fields: [],
    },
  ],
}

const schemaWithEmptyTemplates: Schema = {
  collections: [
    {
      name: 'foo',
      label: 'Foo',
      path: '/foo',
      templates: [],
    },
  ],
}
const schemaWithInvalidFiledNesterUnderRichText: Schema = {
  collections: [
    {
      name: 'foo',
      label: 'Foo',
      path: '/foo',
      fields: [
        {
          type: 'rich-text',
          label: 'Blog Post Body',
          name: 'body',
          isBody: true,
          templates: [
            {
              name: 'Gallery',
              label: 'Gallery',
              fields: [
                {
                  type: 'strung',
                  name: 'alignment',
                  label: 'Alignment',
                  options: ['left', 'center', 'right'],
                },
                {
                  type: 'string',
                  name: 'gap',
                  label: 'Gap',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
const schemaWithBadType = {
  collections: [
    {
      name: 'foo',
      path: 'foo/bar',
      fields: [{ type: 'strung', name: 'foo' }],
    },
  ],
}

const schemaWithIsTitleValid = {
  collections: [
    {
      name: 'foo',
      path: 'foo/bar',
      fields: [{ type: 'string', name: 'foo', isTitle: true, required: true }],
    },
  ],
}

const schemaWithIsTitleNotValid1 = {
  collections: [
    {
      name: 'foo',
      path: 'foo/bar',
      fields: [{ type: 'string', name: 'foo', isTitle: true }],
    },
  ],
}
const schemaWithIsTitleNotValid2 = {
  collections: [
    {
      name: 'foo',
      path: 'foo/bar',
      fields: [{ type: 'string', name: 'foo', isTitle: true, list: true }],
    },
  ],
}
describe('validateSchema', () => {
  it('Passes on a valid schema', () => {
    validateSchema({ schema: validSchema })
    expect(consoleErrMock).not.toHaveBeenCalled()
    validateSchema({ schema: validSchemaWithTemplates })
    expect(consoleErrMock).not.toHaveBeenCalled()
  })
  it('fails when a bad format is given', () => {
    expect(() => {
      validateSchema({ schema: schemaWithBadFormat })
    }).toThrow()
  })
  it('fails when a no name is given', () => {
    expect(() => {
      validateSchema({ schema: schemaWitNoName })
    }).toThrow()
  })
  it('fails when two collections have the same name', () => {
    expect(() => {
      validateSchema({ schema: schemaWithDuplicateName })
    }).toThrow()
  })

  it('fails when two templates have the same name', () => {
    expect(() => {
      validateSchema({ schema: schemaWithDuplicateTemplates })
    }).toThrow()
  })
  it('fails on deeply nested incorrect object', () => {
    expect(() => {
      validateSchema({ schema: schemaWithDeeplyNestedError })
    }).toThrow()
  })
  it('fails when templates and fields are provided', () => {
    expect(() => {
      validateSchema({ schema: schemaWithTemplatesAndFields })
    }).toThrow()
  })
  it('fails when fields is empty', () => {
    expect(() => {
      validateSchema({ schema: schemaWithEmptyFields })
    }).toThrow()
  })
  it('fails when templates is empty', () => {
    expect(() => {
      validateSchema({ schema: schemaWithEmptyTemplates })
    }).toThrow()
  })
  it('fails when a deeply nested field under a template is invalid', () => {
    expect(() => {
      validateSchema({ schema: schemaWithInvalidFiledNesterUnderRichText })
    }).toThrow()
  })
  it('fails when a invalid type is given', () => {
    expect(() => {
      validateSchema({ schema: schemaWithBadType })
    }).toThrow()
  })
  it('fails when a invalid configuration for `isTitle` is given', () => {
    expect(() => {
      validateSchema({ schema: schemaWithIsTitleNotValid1 })
    }).toThrow()
    expect(() => {
      validateSchema({ schema: schemaWithIsTitleNotValid2 })
    }).toThrow()
  })
  it('passes when a valid configuration for `isTitle` is given', () => {
    validateSchema({ schema: schemaWithIsTitleValid })
    expect(consoleErrMock).not.toHaveBeenCalled()
  })
})
