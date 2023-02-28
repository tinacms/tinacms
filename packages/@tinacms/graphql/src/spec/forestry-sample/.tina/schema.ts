/**

*/

import { Schema } from '../../..'
import { blocksCollection } from './blocks'

const tinaSchema: Schema = {
  collections: [
    {
      label: 'Author',
      name: 'author',
      path: 'content/authors',
      templates: [
        {
          name: 'author',
          label: 'Author',
          fields: [
            {
              name: 'name',
              label: 'Name',
              type: 'string',
            },
            {
              name: 'socialMedia',
              label: 'Social Media',
              type: 'object',
              list: true,
              fields: [
                {
                  type: 'string',
                  name: 'platform',
                  label: 'Platform',
                  options: ['twitter', 'facebook', 'instagram'],
                },
                {
                  name: 'handle',
                  label: 'Handle',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      label: 'Post',
      name: 'post',
      path: 'content/posts',
      templates: [
        {
          name: 'post',
          label: 'Post',
          fields: [
            {
              type: 'string',
              label: 'Title',
              name: 'title',
            },
            {
              type: 'string',
              label: 'Body',
              isBody: true,
              name: 'body',
            },
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
    {
      label: 'Stuff',
      name: 'stuff',
      path: 'content/stuff',
      format: 'md',
      templates: [
        {
          label: 'Template 1',
          name: 'template_1',
          fields: [
            {
              type: 'string',
              label: 'Title',
              name: 'title',
            },
          ],
        },
        {
          label: 'Template 2',
          name: 'template_2',
          fields: [
            {
              type: 'string',
              label: 'Title',
              name: 'title',
            },
          ],
        },
        {
          label: 'Template 3',
          name: 'template_3',
          fields: [
            {
              type: 'string',
              label: 'Title',
              name: 'title',
            },
          ],
        },
      ],
    },
    blocksCollection,
  ],
}

export { tinaSchema }
