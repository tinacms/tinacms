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

import type { TinaCMS } from '@tinacms/toolkit'

import useGetDocumentFields from '../hooks/useGetDocumentFields'

import GetCMS from '../components/GetCMS'

const GetDocumentFields = ({
  cms,
  collectionName,
  children,
}: {
  cms: TinaCMS
  collectionName: string
  children: any
}) => {
  const { collection, fields } = useGetDocumentFields(cms, collectionName)
  if (!collection || !fields) {
    return null
  }
  return <>{children(collection, fields)}</>
}

const createDocument = async (
  cms: TinaCMS,
  collection: { name: string },
  values: any
) => {
  const { relativePath, ...params } = values

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
        params: { [collection.name]: { ...params } },
      },
    }
  )
}

const CollectionCreatePage = () => {
  const { collectionName } = useParams()
  const history = useHistory()

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetDocumentFields cms={cms} collectionName={collectionName}>
          {(collection, fields) => {
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
                await createDocument(cms, collection, values)
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
                    label={collection.label + ' - Create New'}
                    form={form}
                  />
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
