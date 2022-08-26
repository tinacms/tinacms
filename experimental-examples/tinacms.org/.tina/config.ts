import { defineConfig } from 'tinacms'
import schema from './schema'
import { client } from './__generated__/client'
export const tinaConfig = defineConfig({
  client,
  schema,
  clientId: '3ce51d60-d05b-49f8-8575-c70a6f02f304',
  branch: 'add-tinacms',
  token: process.env.TINA_TOKEN!,
  cmsCallback: (cms) => {
    import('react-tinacms-editor').then(({ MarkdownFieldPlugin }) => {
      cms.plugins.add(MarkdownFieldPlugin)
    })
    cms.flags.set('branch-switcher', true)

    import('tinacms').then(({ RouteMappingPlugin }) => {
      const RouteMapping = new RouteMappingPlugin((collection, document) => {
        if (['page'].includes(collection.name)) {
          if (document._sys.filename === 'home') {
            return `/`
          }
          return `/${document._sys.filename}`
        }

        if (['post'].includes(collection.name)) {
          return `/blog/${document._sys.filename}`
        }

        return undefined
      })

      cms.plugins.add(RouteMapping)
    })
    return cms
  },
})
