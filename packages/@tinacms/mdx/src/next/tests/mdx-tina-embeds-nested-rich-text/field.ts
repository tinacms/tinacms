import { RichTextField } from '@tinacms/schema-tools'

export const field: RichTextField = {
  name: 'post',
  type: 'rich-text',
  parser: { type: 'mdx' },
  templates: [
    {
      name: "nestedField",
      label: "Nested Field",
      fields: [
        {
          type: "rich-text",
          name: "body",
          label: "Body",
          templates: [
            {
              name: "body",
              label: "Body",
              fields: [
                {
                  type: "rich-text",
                  name: "body",
                  label: "Body",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "DateTime",
      label: "Date & Time",
      inline: true,
      fields: [
        {
          name: "format",
          label: "Format",
          type: "string",
          options: ["utc", "iso", "local"],
        },
      ],
    },
  ],
}
