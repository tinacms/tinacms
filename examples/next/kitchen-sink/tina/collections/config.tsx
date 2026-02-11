import type { Collection } from '@tinacms/cli/dist/index';

const Config: Collection = {
    label: 'Global Config',
    name: 'config',
    path: 'content/config',
    format: 'json',
    fields: [
        { name: "seoTitle", type: "string", required: true },
        { name: "body", type: "rich-text", isBody: true, required: true }
    ],
}
export default Config;