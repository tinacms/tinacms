import type { Collection } from 'tinacms';
import { makeSlugify, dateFieldSchemas } from '../schemas/shared-fields';

const Blog: Collection = {
  label: 'Blogs',
  name: 'blog',
  path: 'content/blogs',
  format: 'mdx',
  ui: {
    router: ({
      document,
    }: { document: { _sys: { filename: string; breadcrumbs: string[] } } }) =>
      `/blog/${document._sys.filename}`,
    filename: {
      slugify: makeSlugify('blog'),
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
    ...dateFieldSchemas,
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      isBody: true,
    },
  ],
};

export default Blog;
