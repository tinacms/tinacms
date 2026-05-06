/**
 * @type {import("tinacms").Collection}
 */
export default {
  label: "Blog Posts",
  name: "post",
  path: "content/post",
  indexes: [
    {
      name: "title",
      fields: [{ name: "title" }],
    },
  ],
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title",
      searchable: true,
    },
    {
      type: "string",
      label: "Blog Post Body",
      name: "body",
      isBody: true,
      ui: {
        component: "textarea",
      },
    },
  ],
  ui: {
    router: ({ document }) => {
      return `/posts/${document._sys.filename}`;
    },
  },
};
