import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      label: 'Post',
      name: 'post',
      path: 'posts',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'string',
          required: true,
        },
        {
          name: 'content',
          label: 'Content',
          type: 'rich-text',
        },
        {
          name: 'author',
          label: 'Author',
          type: 'string',
        },
        {
          name: 'published',
          label: 'Published',
          type: 'boolean',
        },
        {
          name: 'rating',
          label: 'Rating',
          type: 'number',
        },
        {
          name: 'publishDate',
          label: 'Publish Date',
          type: 'datetime',
        },
        {
          name: 'category',
          label: 'Category',
          type: 'string',
          options: ['technology', 'business', 'lifestyle'],
        },
        {
          name: 'featuredImage',
          label: 'Featured Image',
          type: 'image',
        },
        {
          name: 'tags',
          label: 'Tags',
          type: 'string',
          list: true,
        },
        {
          name: 'metadata',
          label: 'Metadata',
          type: 'object',
          fields: [
            {
              name: 'seoTitle',
              label: 'SEO Title',
              type: 'string',
            },
            {
              name: 'seoDescription',
              label: 'SEO Description',
              type: 'string',
            },
          ],
        },
        {
          name: 'authors',
          label: 'Authors',
          type: 'object',
          list: true,
          fields: [
            {
              name: 'name',
              label: 'Name',
              type: 'string',
            },
            {
              name: 'bio',
              label: 'Bio',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
};

export default { schema };
