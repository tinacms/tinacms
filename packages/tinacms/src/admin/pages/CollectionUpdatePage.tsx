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

import { Form, FormBuilder, FormStatus } from '@tinacms/toolkit'
import GetCMS from '../components/GetCMS'
import GetCollection from '../components/GetCollection'
import GetDocument from '../components/GetDocument'
import React, { useMemo, useState } from 'react'
import { TinaSchema, resolveForm } from '@tinacms/schema-tools'
import { Link, useParams } from 'react-router-dom'
import { HiChevronRight } from 'react-icons/hi'
import { LocalWarning } from '@tinacms/toolkit'
import { PageWrapper } from '../components/Page'
import { TinaAdminApi } from '../api'
import type { TinaCMS } from '@tinacms/toolkit'
import { transformDocumentIntoMutationRequestPayload } from '../../hooks/use-graphql-forms'
import { useWindowWidth } from '@react-hook/window-size'

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
    const authMessage = `UpdateDocument failed: User is no longer authenticated; please login and try again.`
    cms.alerts.error(authMessage)
    console.error(authMessage)
    return false
  }
}

const CollectionUpdatePage = () => {
  const { collectionName, ...rest } = useParams()
  const { '*': filename } = rest

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetCollection
          cms={cms}
          collectionName={collectionName}
          includeDocuments={false}
        >
          {(collection) => {
            const relativePath = `${filename}.${collection.format}`
            const mutationInfo = {
              includeCollection: true,
              includeTemplate: !!collection.templates,
            }

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
        </GetCollection>
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
  const [formIsPristine, setFormIsPristine] = useState(true)
  const schema: TinaSchema | undefined = cms.api.tina.schema

  // the schema is being passed in from the frontend so we can use that
  const schemaCollection = schema.getCollection(collection.name)

  const template = schema.getTemplateForData({
    collection: schemaCollection,
    data: document._values,
  })
  const formInfo = resolveForm({
    collection: schemaCollection,
    basename: schemaCollection.name,
    schema: schema,
    template,
  })

  const form = useMemo(() => {
    return new Form({
      id: 'update-form',
      label: 'form',
      fields: formInfo.fields as any,
      initialValues: document._values,
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
          console.error(error)
          throw new Error(
            `[${error.name}] UpdateDocument failed: ${error.message}`
          )
        }
      },
    })
  }, [cms, document, relativePath, collection, mutationInfo])

  const navBreakpoint = 1000
  const windowWidth = useWindowWidth()
  const renderNavToggle = windowWidth < navBreakpoint + 1
  const headerPadding = renderNavToggle ? 'px-20' : 'px-6'

  return (
    <PageWrapper>
      <>
        {cms?.api?.tina?.isLocalMode && <LocalWarning />}
        <div
          className={`py-4 border-b border-gray-200 bg-white ${headerPadding}`}
        >
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
