import { Schema } from '@tinacms/schema-tools';

export const schema: Schema = {
  collections: [
    {
      label: 'Blog Posts',
      name: 'post',
      path: 'content/posts',
      defaultItem: {
        title: 'New Post',
        author: 'Anonymous',
        date: '2024-01-01T00:00:00.000Z',
      },
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string',
          label: 'Author',
          name: 'author',
        },
        {
          type: 'datetime',
          label: 'Date',
          name: 'date',
        },
        {
          type: 'rich-text',
          label: 'Content',
          name: 'content',
        },
      ],
    },
    {
      label: 'Pages',
      name: 'page',
      path: 'content/pages',
      defaultItem: {
        title: 'New Page',
        slug: 'new-page',
      },
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string',
          label: 'Slug',
          name: 'slug',
        },
        {
          type: 'rich-text',
          label: 'Body',
          name: 'body',
        },
      ],
    },
    {
      label: 'Authors',
      name: 'author',
      path: 'content/authors',
      defaultItem: {
        name: 'New Author',
        bio: 'Author bio',
      },
      fields: [
        {
          type: 'string',
          label: 'Name',
          name: 'name',
        },
        {
          type: 'string',
          label: 'Email',
          name: 'email',
        },
        {
          type: 'rich-text',
          label: 'Bio',
          name: 'bio',
        },
      ],
    },
  ],
};

export default { schema };
