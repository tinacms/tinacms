import React from 'react'
import { Form, FormBuilder } from '@tinacms/toolkit'
import { useParams, useHistory } from 'react-router-dom'

import useGetDocumentFields from '../hooks/useGetDocumentFields'

import GetCMS from '../components/GetCMS'

const GetDocumentFields = ({ cms, collectionName, children }) => {
  const { collection, fields } = useGetDocumentFields(cms, collectionName)
  if (!collection || !fields) {
    return null
  }
  return <>{children(collection, fields)}</>
}

const createDocument = async (cms, collection, values) => {
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
      {(cms) => (
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
                  defaultValue: `${collection.name}-${Date.now()}.${
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
              <div>
                <h3 className="text-2xl">{collection.label}</h3>
                <FormBuilder form={form} />
              </div>
            )
          }}
        </GetDocumentFields>
      )}
    </GetCMS>
  )
}

export default CollectionCreatePage
