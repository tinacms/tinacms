// @ts-nocheck FIXME
import { defineSchema, defineConfig } from 'tinacms'
import { blockTemplate } from '../components/blocks'
import { footerTemplate } from '../components/footer'
import { navTemplate } from '../components/nav'
import { localeCollection } from '../components/locale-info'
import { themeTemplate } from '../components/theme'
import { newsTemplate } from '../components/news'
import { TinaCloudCloudinaryMediaStore } from 'next-tinacms-cloudinary'

const schema = defineSchema({
  collections: [
    localeCollection(),
    newsTemplate(),
    footerTemplate(),
    themeTemplate,
    navTemplate(),
    blockTemplate(),
  ],
  indexes: [
    {
      name: 'by-date',
      fields: [
        {
          name: 'publishDate',
          default: '',
        },
      ],
    },
  ],
})

export default schema

const branch = process.env.VERCEL_GIT_COMMIT_REF || 'main'
const apiURL =
  process.env.NODE_ENV == 'development'
    ? 'http://localhost:4001/graphql'
    : `https://content.tinajs.io/content/d94095b9-fb25-40a6-a3ea-277ad5653cb0/github/${branch}`

export const tinaConfig = defineConfig({
  apiURL,
  schema,
  cmsCallback: (cms) => {
    cms.flags.set('branch-switcher', true)
    cms.flags.set('use-unstable-formify', true)
    return cms
  },
  mediaStore: TinaCloudCloudinaryMediaStore,
  formifyCallback: ({ formConfig, createForm, createGlobalForm }) => {
    if (
      [
        'content/navigation/main.md',
        'content/localeInfo/main.md',
        'content/footer/main.md',
        'content/theme/main.json',
      ].includes(formConfig.id)
    ) {
      return createGlobalForm(formConfig, { layout: 'fullscreen' })
    }
    return createForm(formConfig)
  },
})
