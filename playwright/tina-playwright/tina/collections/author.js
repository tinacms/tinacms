/**
 * @type {import('tinacms').Collection}
 */
export default {
  label: "Author",
  name: "author",
  path: "content/author",
  format: "mdx",
  fields: [
    {
      name: "Title",
      type: "string",
    },
  ],
};
