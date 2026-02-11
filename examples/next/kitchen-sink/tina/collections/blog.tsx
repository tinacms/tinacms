import type { Collection } from '@tinacms/cli/dist/index';

const Blogs: Collection = {
    label: 'Blogs',
    name: 'blog',
    path: 'content/blogs',
    format: 'mdx',
    fields: [
        { name: "title", type: "string", isTitle: true, required: true },
        { name: "description", type: "string" },
        { name: "pubDate", type: "datetime" },
        { name: "updatedDate", type: "datetime" },
        { name: "heroImage", type: "image" },
        { name: "body", type: "rich-text", isBody: true }
    ],
}
export default Blogs;