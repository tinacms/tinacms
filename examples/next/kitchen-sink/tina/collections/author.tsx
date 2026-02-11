import type { Collection } from '@tinacms/cli/dist/index';

const Authors: Collection = {
    label: 'Authors',
    name: 'author',
    path: 'content/authors',
    format: 'mdx',
    fields: [
        { name: 'name', type: 'string', isTitle: true, required: true },
        { name: 'description', type: 'string' },
        { name: 'pubDate', type: 'datetime'},
        { name: 'updatedDate', type: 'datetime'},
        { name: 'heroImage', type: 'image' },
        { name: 'body', type: 'rich-text', isBody: true }
    ],
}
export default Authors;