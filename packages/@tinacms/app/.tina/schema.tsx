import { defineSchema, defineConfig } from 'tinacms'

const schema = defineSchema({
  collections: [
    {
      name: 'post',
      path: 'posts',
      fields: [
        {
          name: 'title',
          type: 'string',
        },
      ],
    },
  ],
})

export const config = defineConfig({
  schema,
  apiURL: 'http://localhost:4001/graphql',
})

export default schema
