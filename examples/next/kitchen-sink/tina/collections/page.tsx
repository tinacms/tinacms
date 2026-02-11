import type { Collection } from '@tinacms/cli/dist/index';

const Pages: Collection = {
    label: 'Pages',
    name: 'page',
    path: 'content/pages',
    format: 'mdx',
    fields: [
        { name: "seoTitle", type: "string", required: true },
        { name: "body", type: "rich-text", isBody: true, required: true }
    ],
}
export default Pages;