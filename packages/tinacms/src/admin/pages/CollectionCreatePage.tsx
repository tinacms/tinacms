import React, { FC } from 'react'
import { Form, FormBuilder } from '@tinacms/toolkit'
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
  children: FC<any>
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
              <>
                <h3 className="text-xl mb-6">
                  <Link
                    className="opacity-80 hover:opacity-100 transition-opacity ease-out"
                    to={`/admin/collections/${collection.name}`}
                  >
                    {collection.label}
                  </Link>{' '}
                  - Create New
                </h3>
                <FormBuilder form={form} />
              </>
            )
          }}
        </GetDocumentFields>
      )}
    </GetCMS>
  )
}

export default CollectionCreatePage
