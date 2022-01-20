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

import { transformDocumentIntoMutationRequestPayload } from '../../hooks/use-graphql-forms'

import GetCMS from '../components/GetCMS'
import GetDocumentFields from '../components/GetDocumentFields'
import GetDocument from '../components/GetDocument'

import type { TinaCMS } from '@tinacms/toolkit'
import { TinaAdminApi } from '../api'

const updateDocument = async (
  cms: TinaCMS,
  relativePath: string,
  collection: { name: string },
  mutationInfo: { includeCollection: boolean; includeTemplate: boolean },
  values: any
) => {
  const api = new TinaAdminApi(cms.api.tina)
  const { includeCollection, includeTemplate } = mutationInfo
  const params = transformDocumentIntoMutationRequestPayload(values, {
    includeCollection,
    includeTemplate,
  })

  await api.updateDocument(collection.name, relativePath, params)
}

const CollectionUpdatePage = () => {
  const { collectionName, filename } = useParams()
  const navigate = useNavigate()

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetDocumentFields cms={cms} collectionName={collectionName}>
          {({ collection, mutationInfo }) => {
            const relativePath = `${filename}.${collection.format}`

            return (
              <GetDocument
                cms={cms}
                collectionName={collection.name}
                relativePath={relativePath}
              >
                {(document) => {
                  const form = new Form({
                    id: 'update-form',
                    label: 'form',
                    fields: document.form.fields,
                    initialValues: document.values,
                    onSubmit: async (values) => {
                      await updateDocument(
                        cms,
                        relativePath,
                        collection,
                        mutationInfo,
                        values
                      )
                      navigate(`/collections/${collection.name}`)
                    },
                  })

                  return (
                    <div className="w-full h-screen">
                      <div className="flex flex-col items-center w-full flex-1">
                        <FullscreenFormBuilder
                          label={collection.label + ` - ` + filename}
                          form={form}
                        />
                      </div>
                    </div>
                  )
                }}
              </GetDocument>
            )
          }}
        </GetDocumentFields>
      )}
    </GetCMS>
  )
}

export default CollectionUpdatePage
