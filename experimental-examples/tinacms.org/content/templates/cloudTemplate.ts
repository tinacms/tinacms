export const FeaturedItemsFields = [
  {
    label: 'Headline',
    name: 'headline',
    component: 'text',
  },
  {
    label: 'Subline',
    name: 'subline',
    component: 'text',
  },
  {
    label: 'Link URL',
    name: 'url',
    component: 'text',
  },
  {
    label: 'Media',
    name: 'media',
    component: 'group',
    fields: [
      {
        label: 'Media Source',
        name: 'src',
        component: 'text',
      },
    ],
  },
]

export const CallToActionFields = [
  {
    label: 'Headline',
    name: 'headline',
    component: 'markdown',
  },
  {
    label: 'Subline',
    name: 'subline',
    component: 'text',
  },
  {
    label: 'Action Items',
    name: 'actionItems',
    component: 'group-list',
    fields: [
      {
        label: 'Action Label',
        name: 'label',
        component: 'text',
      },
      {
        label: 'Action Variant',
        name: 'variant',
        component: 'select',
        options: ['button', 'link'],
      },
      {
        label: 'Action URL',
        name: 'url',
        component: 'text',
        //TO DO: Determine why validate blows up application
        // validate: (value: string) => {
        //   console.log(typeof value)
        //   if (!value?.startsWith('http')) {
        //     return 'Not a valid URL, try again'
        //   }
        //   return undefined
        // }
      },
      {
        label: 'Action Icon',
        name: 'icon',
        component: 'select',
        options: ['', 'arrowRight'],
      },
    ],
    itemProps: (item: any) => ({
      key: item.name,
      label: `Action: ${item.label || 'New Action'}`,
    }),
  },
]

const CloudPageTemplate = {
  label: 'Cloud',
  defaultItem: {},
  fields: [
    {
      label: 'Nav',
      name: 'navItems',
      component: 'group-list',
      fields: [
        {
          label: 'Label',
          name: 'label',
          component: 'text',
        },
        {
          label: 'Link',
          name: 'link',
          component: 'text',
        },
      ],
      itemProps: (item: any) => ({
        key: item.link,
        label: item.label,
      }),
    },
    {
      label: 'SEO',
      name: 'seo',
      component: 'group',
      fields: [
        { name: 'title', label: 'Page Title', component: 'text' },
        {
          name: 'description',
          label: 'Page Description',
          component: 'textarea',
        },
      ],
    },
  ],
}

export default CloudPageTemplate
