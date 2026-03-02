import type { Collection } from 'tinacms';

const Blog: Collection = {
  label: 'Blogs',
  name: 'blog',
  path: 'content/blogs',
  format: 'mdx',
  ui: {
    router: ({ document }) => `/blog/${document._sys.filename}`,
    filename: {
      slugify: (values) =>
        `${(values?.title || `blog-${Date.now()}`).toLowerCase().split(' ').join('-')}`,
      readonly: true,
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      isTitle: true,
      required: true,
    },
    {
      type: 'image',
      name: 'heroImage',
      label: 'Hero Image',
      // @ts-ignore
      uploadDir: () => 'blogs',
    },
    {
      type: 'rich-text',
      label: 'Excerpt',
      name: 'excerpt',
      overrides: {
        toolbar: ['bold', 'italic', 'link'],
      },
    },
    {
      type: 'string',
      label: 'Description',
      name: 'description',
    },
    {
      type: 'reference',
      label: 'Author',
      name: 'author',
      collections: ['author'],
    },
    {
      type: 'datetime',
      label: 'Publish Date',
      name: 'pubDate',
    },
    {
      type: 'datetime',
      label: 'Updated Date',
      name: 'updatedDate',
    },
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      isBody: true,
    },
  ],
};

export default Blog;
