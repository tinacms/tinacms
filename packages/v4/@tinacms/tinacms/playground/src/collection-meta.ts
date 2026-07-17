// The collection's file mapping, shared between the app (content.ts) and
// vite.config.ts's data-layer middleware. Kept import-free so the Vite config
// loader can bundle it without dragging app code into node.
export const postCollectionMeta = {
  name: 'post',
  path: 'content/posts',
  format: 'mdx',
  // Wire-level field shapes — enough for the data layer's GraphQL schema. The
  // app's form fields (content.ts) override these with richer t.* definitions.
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'featured', type: 'boolean' },
    // v3 content model: the markdown body, served by GraphQL as the mdx AST.
    { name: 'body', type: 'rich-text', isBody: true },
  ],
} as const;
