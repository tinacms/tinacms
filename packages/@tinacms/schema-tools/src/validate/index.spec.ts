import { TinaCloudSchema } from '../types'
import { validateSchema } from '.'

let consoleErrMock
beforeEach(() => {
  consoleErrMock = jest.spyOn(console, 'error').mockImplementation()
})
afterEach(() => {
  consoleErrMock.mockRestore()
})
const validSchema: TinaCloudSchema<false> = {
  collections: [
    {
      name: 'page',
      path: 'content/page',
      label: 'Page',
      format: 'mdx',
      fields: [
        // {
        //   name: 'thingOne',
        //   type: 'string',
        // },
        {
          label: 'Title',
          name: 'Title',
          type: 'string',
          ui: {
            // defaultValue: 'Title',
            // Examples of how you COULD use a custom form
            // component: ({ form, field, input }) => {
            //   return (
            //     <div>
            //       <label>This is a test</label>
            //       <input {...input}></input>
            //     </div>
            //   )
            // },
            validate: (val) => {
              if (val?.length > 5) {
                return 'Too Long!!!'
              }
            },
          },
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
      format: 'not a format',
      fields: [{ name: 'foo', type: 'string' }],
    },
  ],
}
describe('validateSchema', () => {
  it('Passes on a valid schema', () => {
    validateSchema({ config: validSchema })
    expect(consoleErrMock).not.toHaveBeenCalled()
  })
  it('fails when a bad format is given', () => {
    expect(() => {
      validateSchema({ config: schemaWithBadFormat })
    }).toThrow()
  })
  it('fails when a no name is given', () => {
    expect(() => {
      validateSchema({ config: schemaWitNoName })
    }).toThrow()
  })
})
