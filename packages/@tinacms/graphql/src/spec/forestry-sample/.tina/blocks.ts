/**

*/

export const blocksCollection = {
  label: 'Page',
  name: 'page',
  path: 'content/pages',
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
    },
    {
      type: 'object',
      label: 'SEO',
      name: 'seo',
      fields: [
        {
          type: 'string',
          name: 'seoTitle',
          label: 'SEO Title',
        },
        {
          type: 'image',
          name: 'ogImage',
          label: 'Open Graph Image',
        },
        {
          type: 'string',
          name: 'ogDescription',
          label: 'Open Graph Description',
        },
      ],
    },
    {
      type: 'object',
      list: true,
      label: 'Blocks',
      name: 'blocks',
      templates: [
        {
          label: 'Hero',
          name: 'hero',
          fields: [
            {
              type: 'string',
              label: 'Description',
              name: 'description',
            },
            {
              type: 'image',
              label: 'Background Image',
              name: 'backgroundImage',
            },
          ],
        },
        {
          label: 'Call to Action',
          name: 'cta',
          fields: [
            {
              type: 'string',
              label: 'CTA Text',
              name: 'ctaText',
            },
            {
              type: 'string',
              label: 'Style',
              name: 'ctaStyle',
              options: [
                {
                  label: 'Minimal',
                  value: 'minimal',
                },
                {
                  label: 'Flat',
                  value: 'flat',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
