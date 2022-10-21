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

import {
  BaseTextField,
  Form,
  FormBuilder,
  FormStatus,
  wrapFieldsWithMeta,
} from '@tinacms/toolkit'
import { Link, useNavigate, useParams } from 'react-router-dom'
import React, { useMemo, useState } from 'react'
import { TinaSchema, resolveForm } from '@tinacms/schema-tools'
import type { GlobalTemplate } from '@tinacms/schema-tools'

import GetCMS from '../components/GetCMS'
import GetCollection from '../components/GetCollection'
import { HiChevronRight } from 'react-icons/hi'
import { LocalWarning } from '@tinacms/toolkit'
import { PageWrapper } from '../components/Page'
import { TinaAdminApi } from '../api'
import usePrompt from '../../hooks/use-prompt'
import type { TinaCMS } from '@tinacms/toolkit'
import { transformDocumentIntoMutationRequestPayload } from '../../hooks/use-graphql-forms'
import { useWindowWidth } from '@react-hook/window-size'
import { FaLock, FaUnlock } from 'react-icons/fa'

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

  if (await api.isAuthenticated()) {
    await api.createDocument(collection.name, relativePath, params)
  } else {
    const authMessage = `CreateDocument failed: User is no longer authenticated; please login and try again.`
    cms.alerts.error(authMessage)
    console.error(authMessage)
    return false
  }
}

const CollectionCreatePage = () => {
  const { collectionName, templateName } = useParams()

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetCollection
          cms={cms}
          collectionName={collectionName}
          includeDocuments={false}
        >
          {(collection) => {
            const mutationInfo = {
              includeCollection: true,
              includeTemplate: !!collection.templates,
            }

            return (
              <RenderForm
                cms={cms}
                collection={collection}
                templateName={templateName}
                mutationInfo={mutationInfo}
              />
            )
          }}
        </GetCollection>
      )}
    </GetCMS>
  )
}

const FilenameInput = (props) => {
  const [filenameTouched, setFilenameTouched] = React.useState(false)

  return (
    <div
      className="group relative block cursor-pointer"
      onClick={() => {
        setFilenameTouched(true)
      }}
    >
      <input
        type="text"
        className={`shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base pr-3 truncate py-2 w-full border transition-all ease-out duration-150 focus:text-gray-900 rounded-md ${
          props.readonly || !filenameTouched
            ? 'bg-gray-50 text-gray-300  border-gray-150 pointer-events-none pl-8 group-hover:bg-white group-hover:text-gray-600  group-hover:border-gray-200'
            : 'bg-white text-gray-600  border-gray-200 pl-3'
        }`}
        {...props}
        disabled={props.readonly || !filenameTouched}
      />
      <FaLock
        className={`text-gray-400 absolute top-1/2 left-2 -translate-y-1/2 pointer-events-none h-5 w-auto transition-opacity duration-150 ease-out ${
          !filenameTouched && !props.readonly
            ? 'opacity-20 group-hover:opacity-0 group-active:opacity-0'
            : 'opacity-0'
        }`}
      />
      <FaUnlock
        className={`text-blue-500 absolute top-1/2 left-2 -translate-y-1/2 pointer-events-none h-5 w-auto transition-opacity duration-150 ease-out ${
          !filenameTouched && !props.readonly
            ? 'opacity-0 group-hover:opacity-80 group-active:opacity-80'
            : 'opacity-0'
        }`}
      />
    </div>
  )
}

const RenderForm = ({ cms, collection, templateName, mutationInfo }) => {
  const navigate = useNavigate()
  const [formIsPristine, setFormIsPristine] = useState(true)
  const schema: TinaSchema | undefined = cms.api.tina.schema

  // the schema is being passed in from the frontend so we can use that
  const schemaCollection = schema.getCollection(collection.name)
  const template: GlobalTemplate<true> = schema.getTemplateForData({
    collection: schemaCollection,
    data: { _template: templateName },
  }) as GlobalTemplate<true>

  const formInfo = resolveForm({
    collection: schemaCollection,
    basename: schemaCollection.name,
    schema: schema,
    template,
  })

  let slugFunction = template?.ui?.filename?.slugify

  if (!slugFunction) {
    const titleField = template?.fields.find(
      (x) => x.required && x.type === 'string' && x.isTitle
    )?.name
    // If the collection does not a slugify function and is has a title field, use the default slugify function
    if (titleField) {
      // default slugify function strips out all non-alphanumeric characters
      slugFunction = (values: unknown) =>
        values[titleField]?.replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, '')
    }
  }

  const form = useMemo(() => {
    return new Form({
      initialValues:
        typeof schemaCollection?.defaultItem === 'function'
          ? schemaCollection.defaultItem()
          : schemaCollection?.defaultItem,
      extraSubscribeValues: { active: true, submitting: true, touched: true },
      onChange: (values) => {
        if (
          slugFunction &&
          values?.active !== 'filename' &&
          !values?.submitting &&
          !values.touched?.filename
        ) {
          const value = slugFunction(values?.values)
          form.finalForm.change('filename', value)
        }
      },
      id: 'create-form',
      label: 'form',
      fields: [
        ...(formInfo.fields as any),
        {
          name: 'filename',
          label: 'Filename',
          component: slugFunction
            ? wrapFieldsWithMeta(({ field, input, meta }) => {
                return (
                  <FilenameInput
                    readonly={template?.ui?.filename?.readonly}
                    {...input}
                  />
                )
              })
            : 'text',
          disabled: template?.ui?.filename?.readonly,
          description: (
            <span>
              A unique filename for the content.
              <br />
              Examples: <code>My_Document</code>, <code>My_Document.en</code>,{' '}
              <code>sub-folder/My_Document</code>
            </span>
          ),
          placeholder: `My_Document`,
          validate: (value, allValues, meta) => {
            if (!value) {
              if (meta.dirty) {
                return 'Required'
              }
              return true
            }

            const isValid = /^[_a-zA-Z0-9][\.\-_\/a-zA-Z0-9]*$/.test(value)
            if (value && !isValid) {
              return 'Must begin with a-z, A-Z, 0-9, or _ and contain only a-z, A-Z, 0-9, -, _, ., or /.'
            }
          },
        },
      ],
      onSubmit: async (values) => {
        try {
          await createDocument(cms, collection, template, mutationInfo, values)
          cms.alerts.success('Document created!')
          navigate(`/collections/${collection.name}`)
        } catch (error) {
          console.error(error)

          throw new Error(
            `[${error.name}] CreateDocument failed: ${error.message}`
          )
        }
      },
    })
  }, [cms, collection, mutationInfo])

  const navBreakpoint = 1000
  const windowWidth = useWindowWidth()
  const renderNavToggle = windowWidth < navBreakpoint + 1
  const headerPadding = renderNavToggle ? 'px-20' : 'px-6'

  usePrompt('Changes you made may not be saved.', !formIsPristine)

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
