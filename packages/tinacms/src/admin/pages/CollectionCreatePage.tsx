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

import React, { useState, useMemo } from 'react'
import { Form, FormBuilder, FormStatus } from '@tinacms/toolkit'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { HiChevronRight } from 'react-icons/hi'

import type { TinaCMS } from '@tinacms/toolkit'
import { LocalWarning } from '@tinacms/toolkit'

import { TinaAdminApi } from '../api'
import GetCMS from '../components/GetCMS'
import GetDocumentFields from '../components/GetDocumentFields'

import { PageWrapper } from '../components/Page'
import { transformDocumentIntoMutationRequestPayload } from '../../hooks/use-graphql-forms'

const createDocument = async (
  cms: TinaCMS,
  collection: { name: string; format: string },
  template: { name: string },
  mutationInfo: { includeCollection: boolean; includeTemplate: boolean },
  values: any
) => {
  const api = new TinaAdminApi(cms)
  const { filename, ...leftover } = values
  const { includeCollection, includeTemplate } = mutationInfo

  const relativePath = `${filename}.${collection.format}`
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
  await api.createDocument(collection.name, relativePath, params)
}

const CollectionCreatePage = () => {
  const { collectionName, templateName } = useParams()

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetDocumentFields
          cms={cms}
          collectionName={collectionName}
          templateName={templateName}
        >
          {({ collection, template, fields, mutationInfo }) => (
            <RenderForm
              cms={cms}
              collection={collection}
              template={template}
              fields={fields}
              mutationInfo={mutationInfo}
            />
          )}
        </GetDocumentFields>
      )}
    </GetCMS>
  )
}

const RenderForm = ({ cms, collection, template, fields, mutationInfo }) => {
  const navigate = useNavigate()
  const [formIsPristine, setFormIsPristine] = useState(true)

  const form = useMemo(() => {
    return new Form({
      id: 'create-form',
      label: 'form',
      fields: [
        {
          name: 'filename',
          label: 'Filename',
          component: 'text',
          description: `A unique filename for the content.  Example: My_Document`,
          placeholder: `My_Document`,
          validate: (value, allValues, meta) => {
            if (!value) {
              if (meta.dirty) {
                return 'Required'
              }
              return true
            }

            const isValid = /^[_a-zA-Z][-,_a-zA-Z0-9]*$/.test(value)
            if (value && !isValid) {
              return 'Must begin with a-z, A-Z, or _ and contain only a-z, A-Z, 0-9, - or _'
            }
          },
        },
        ...fields,
      ],
      onSubmit: async (values) => {
        try {
          await createDocument(cms, collection, template, mutationInfo, values)
          cms.alerts.success('Document created!')
          navigate(`/collections/${collection.name}`)
        } catch (error) {
          cms.alerts.error(
            `[${error.name}] CreateDocument failed: ${error.message}`,
            30 * 1000 // 30 seconds
          )
          console.error(error)
        }
      },
    })
  }, [cms, collection, template, fields, mutationInfo])

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
                Create New
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

export default CollectionCreatePage
