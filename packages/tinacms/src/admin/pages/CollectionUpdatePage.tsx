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
import { useParams, useHistory, Link } from 'react-router-dom'

import GetCMS from '../components/GetCMS'
import GetCollection, { Collection } from '../components/GetCollection'
import GetDocument from '../components/GetDocument'

import type { TinaCMS } from '@tinacms/toolkit'

const updateDocument = async (
  cms: TinaCMS,
  collection: Collection,
  relativePath: string,
  values: any
) => {
  const { _collection, _template, ...params } = values

  await cms.api.tina.request(
    `mutation($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
      updateDocument(
        collection: $collection, 
        relativePath: $relativePath, 
        params: $params
      ){__typename}
    }`,
    {
      variables: {
        collection: collection.name,
        relativePath,
        params: { [collection.name]: { ...params } },
      },
    }
  )
}

const CollectionUpdatePage = () => {
  const { collectionName, filename } = useParams()
  const history = useHistory()

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetCollection
          cms={cms}
          collectionName={collectionName}
          includeDocuments={false}
        >
          {(collection: Collection) => {
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
                        collection,
                        relativePath,
                        values
                      )
                      history.push(`/admin/collections/${collection.name}`)
                    },
                  })
                  return (
                    <div className="w-full h-screen">
                      {/* <h3 className="text-xl mb-6">
                      <Link
                        className="opacity-80 hover:opacity-100 transition-opacity ease-out"
                        to={`/admin/collections/${collection.name}`}
                      >
                        {collection.label}
                      </Link>{' '}
                      - Create New
                    </h3> */}
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
        </GetCollection>
      )}
    </GetCMS>
  )
}

export default CollectionUpdatePage
