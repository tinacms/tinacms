import { Schema } from '@tinacms/schema-tools'

export const schema: Schema = {
  collections: [
    {
      name: 'author',
      path: 'authors',
      fields: [
        {
          name: 'name',
          type: 'string',
        },
      ],
    },
    {
      name: 'post',
      path: '',
      fields: [
        {
          name: 'author',
          type: 'reference',
          collections: ['author'],
        },
      ],
    },
  ],
}

export default { schema }
