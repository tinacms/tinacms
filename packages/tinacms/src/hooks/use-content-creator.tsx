/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'
import { useCMS } from '@tinacms/toolkit'
import { ContentCreatorPlugin, OnNewDocument } from './create-page-plugin'

export type FilterCollections = (
  options: {
    label: string
    value: string
  }[]
) => { label: string; value: string }[]

export type DocumentCreatorArgs = {
  onNewDocument?: OnNewDocument
  filterCollections?: FilterCollections
}

export const useDocumentCreatorPlugin = (args?: DocumentCreatorArgs) => {
  const cms = useCMS()
  const [values, setValues] = React.useState<{
    collection?: string
    template?: string
    relativePath?: string
  }>({})
  const [plugin, setPlugin] = React.useState(null)

  React.useEffect(() => {
    const run = async () => {
      /**
       * Query for Collections and Templates
       */
      const res = await cms.api.tina.request(
        (gql) => gql`
          {
            collections {
              label
              slug
              format
              templates
            }
          }
        `,
        { variables: {} }
      )

      /**
       * Build Collection Options
       */
      const allCollectionOptions: { label: string; value: string }[] = []
      res.collections.forEach((collection) => {
        const value = collection.slug
        const label = `${collection.label}`
        allCollectionOptions.push({ value, label })
      })

      let collectionOptions
      if (
        args &&
        args.filterCollections &&
        typeof args.filterCollections === 'function'
      ) {
        const filtered = args.filterCollections(allCollectionOptions)
        collectionOptions = [
          { value: '', label: 'Choose Collection' },
          ...filtered,
        ]
      } else {
        collectionOptions = [
          { value: '', label: 'Choose Collection' },
          ...allCollectionOptions,
        ]
      }

      /**
       * Build Template Options
       */
      const templateOptions: { label: string; value: string }[] = [
        { value: '', label: 'Choose Template' },
      ]

      if (values.collection) {
        const filteredCollection = res.collections.find(
          (c) => c.slug === values.collection
        )
        filteredCollection?.templates?.forEach((template) => {
          templateOptions.push({ value: template.name, label: template.label })
        })
      }

      /**
       * Build 'Add Document' Form
       */
      setPlugin(
        new ContentCreatorPlugin({
          label: 'Add Document',
          onNewDocument: args && args.onNewDocument,
          collections: res.collections,
          onChange: async ({ values }) => {
            setValues(values)
          },
          initialValues: values,
          fields: [
            {
              component: 'select',
              name: 'collection',
              label: 'Collection',
              description: 'Select the collection.',
              options: collectionOptions,
              validate: async (value: any, allValues: any, meta: any) => {
                if (!value) {
                  return true
                }
              },
            },
            {
              component: 'select',
              name: 'template',
              label: 'Template',
              description: 'Select the template.',
              options: templateOptions,
              validate: async (value: any, allValues: any, meta: any) => {
                // If there are no templates, this isn't required
                if (!value && templateOptions.length > 1) {
                  if (meta.dirty) {
                    return 'Required'
                  }
                  return true
                }
              },
            },
            {
              component: 'text',
              name: 'relativePath',
              label: 'Name',
              description: `A unique name for the content. Example: "newPost" or "blog_022021`,
              placeholder: 'newPost',
              validate: (value: any, allValues: any, meta: any) => {
                if (!value) {
                  if (meta.dirty) {
                    return 'Required'
                  }
                  return true
                }

                /**
                 * Check for valid `name` based on
                 * https://github.com/tinacms/tina-graphql-gateway/blob/682e2ed54c51520d1a87fac2887950839892f465/packages/tina-graphql-gateway-cli/src/cmds/compile/index.ts#L296
                 * */

                const isValid = /^[_a-zA-Z0-9][\-_a-zA-Z0-9]*$/.test(value)
                if (value && !isValid) {
                  return 'Must begin with a-z, A-Z, 0-9, or _ and contain only a-z, A-Z, 0-9, - or _'
                }
              },
            },
          ],
        })
      )
    }

    run()
  }, [cms])

  React.useEffect(() => {
    if (plugin) {
      cms.plugins.add(plugin)
    }

    return () => {
      if (plugin) {
        cms.plugins.remove(plugin)
      }
    }
  }, [plugin])
}
