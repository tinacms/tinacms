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

import React, { useMemo, useState } from 'react'
import { Form, FormBuilder, FormStatus } from '@tinacms/toolkit'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { HiChevronRight } from 'react-icons/hi'

import type { TinaCMS } from '@tinacms/toolkit'
import { LocalWarning } from '@tinacms/toolkit'

import GetCMS from '../components/GetCMS'
import GetDocumentFields from '../components/GetDocumentFields'
import GetDocument from '../components/GetDocument'
import { transformDocumentIntoMutationRequestPayload } from '../../hooks/use-graphql-forms'

import { PageWrapper } from '../components/Page'
import { TinaAdminApi } from '../api'

const updateDocument = async (
  cms: TinaCMS,
  relativePath: string,
  collection: { name: string },
  mutationInfo: { includeCollection: boolean; includeTemplate: boolean },
  values: any
) => {
  const api = new TinaAdminApi(cms)
  const { includeCollection, includeTemplate } = mutationInfo
  const params = transformDocumentIntoMutationRequestPayload(values, {
    includeCollection,
    includeTemplate,
  })
  if (await api.isAuthenticated()) {
    await api.updateDocument(collection.name, relativePath, params)
  } else {
    const authMessage = `[Error] UpdateDocument failed: User is no longer authenticated; please login and try again.`
    cms.alerts.error(authMessage, 30 * 1000)
    console.error(authMessage)
    return false
  }
}

const CollectionUpdatePage = () => {
  const { collectionName, filename } = useParams()

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
                {(document) => (
                  <RenderForm
                    cms={cms}
                    document={document}
                    filename={filename}
                    relativePath={relativePath}
                    collection={collection}
                    mutationInfo={mutationInfo}
                  />
                )}
              </GetDocument>
            )
          }}
        </GetDocumentFields>
      )}
    </GetCMS>
  )
}

const RenderForm = ({
  cms,
  document,
  filename,
  relativePath,
  collection,
  mutationInfo,
}) => {
  const navigate = useNavigate()
  const [formIsPristine, setFormIsPristine] = useState(true)

  const form = useMemo(() => {
    return new Form({
      id: 'update-form',
      label: 'form',
      fields: document.form.fields,
      initialValues: document.values,
      onSubmit: async (values) => {
        try {
          await updateDocument(
            cms,
            relativePath,
            collection,
            mutationInfo,
            values
          )
          cms.alerts.success('Document updated!')
        } catch (error) {
          cms.alerts.error(
            `[${error.name}] UpdateDocument failed: ${error.message}`,
            30 * 1000 // 30 seconds
          )
          console.error(error)
        }
      },
    })
  }, [cms, document, relativePath, collection, mutationInfo])

  return (
    <PageWrapper>
      <>
        {cms?.api?.tina?.isLocalMode && <LocalWarning />}
        <div className="py-4 px-20 border-b border-gray-200 bg-white">
          <div className="max-w-form mx-auto">
            <div className="mb-2">
              <span className="block text-sm leading-tight uppercase text-gray-400 mb-1">
                <Link
                  to={`/collections/${collection.name}`}
                  className="inline-block text-current hover:text-blue-400 focus:underline focus:outline-none focus:text-blue-400 font-medium transition-colors duration-150 ease-out"
                >
                  {collection.label ? collection.label : collection.name}
                </Link>
                <HiChevronRight className="inline-block -mt-0.5 opacity-50" />
              </span>
              <span className="text-xl text-gray-700 font-medium leading-tight">
                Edit {`${filename}.${collection.format}`}
              </span>
            </div>
            <FormStatus pristine={formIsPristine} />
          </div>
        </div>
        <FormBuilder form={form} onPristineChange={setFormIsPristine} />
      </>
    </PageWrapper>
  )
}

export default CollectionUpdatePage
