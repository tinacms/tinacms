/**
 * @type {import('tinacms').Collection}
 */
export default {
  label: "Settings",
  name: "settings",
  path: "content/settings",
  format: "json",
  fields: [
    {
      name: "label",
      type: "string",
    },
  ],
};
