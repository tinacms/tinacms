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
import { Form, FullscreenFormBuilder } from '@tinacms/toolkit'
import { useParams, useNavigate } from 'react-router-dom'

import GetCMS from '../components/GetCMS'
import GetDocumentFields from '../components/GetDocumentFields'

import type { TinaCMS } from '@tinacms/toolkit'
import { transformDocumentIntoMutationRequestPayload } from '../../hooks/use-graphql-forms'

const createDocument = async (
  cms: TinaCMS,
  collection: { name: string },
  template: { name: string },
  mutationInfo: { includeCollection: boolean; includeTemplate: boolean },
  values: any
) => {
  const { relativePath, ...leftover } = values
  const { includeCollection, includeTemplate } = mutationInfo
  const params = transformDocumentIntoMutationRequestPayload(
    {
      _collection: collection.name,
      ...(template && { _template: template.name }),
      ...leftover,
    },
    {
      includeCollection,
      includeTemplate,
    }
  )

  await cms.api.tina.request(
    `mutation($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
      createDocument(
        collection: $collection, 
        relativePath: $relativePath, 
        params: $params
      ){__typename}
    }`,
    {
      variables: {
        collection: collection.name,
        relativePath,
        params,
      },
    }
  )
}

const CollectionCreatePage = () => {
  const { collectionName, templateName } = useParams()
  const navigate = useNavigate()

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetDocumentFields
          cms={cms}
          collectionName={collectionName}
          templateName={templateName}
        >
          {({ collection, template, fields, mutationInfo }) => {
            const form = new Form({
              id: 'create-form',
              label: 'form',
              fields: [
                {
                  name: 'relativePath',
                  label: 'Relative Path',
                  component: 'text',
                  required: true,
                  defaultValue: `${collection.name}${Date.now()}.${
                    collection.format
                  }`,
                },
                ...fields,
              ],
              onSubmit: async (values) => {
                await createDocument(
                  cms,
                  collection,
                  template,
                  mutationInfo,
                  values
                )
                navigate(`/admin/collections/${collection.name}`)
              },
            })

            const formLabel = template
              ? `${collection.label} - Create New ${template.label}`
              : `${collection.label} - Create New`

            return (
              <div className="w-full h-screen">
                <div className="flex flex-col items-center w-full flex-1">
                  <FullscreenFormBuilder label={formLabel} form={form} />
                </div>
              </div>
            )
          }}
        </GetDocumentFields>
      )}
    </GetCMS>
  )
}

export default CollectionCreatePage
