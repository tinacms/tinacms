import {
  BillingWarning,
  Form,
  FormBuilder,
  FormStatus,
  wrapFieldsWithMeta,
} from '@tinacms/toolkit'
import { Link, useNavigate, useParams } from 'react-router-dom'
import React, { useMemo, useState } from 'react'
import {
  TinaSchema,
  resolveForm,
  normalizePath,
  Collection,
} from '@tinacms/schema-tools'
import type { Template } from '@tinacms/schema-tools'

import GetCMS from '../components/GetCMS'
import GetCollection from '../components/GetCollection'
import { HiChevronRight } from 'react-icons/hi'
import { LocalWarning } from '@tinacms/toolkit'
import { PageWrapper } from '../components/Page'
import { TinaAdminApi } from '../api'
import type { TinaCMS } from '@tinacms/toolkit'
import { useWindowWidth } from '@react-hook/window-size'
import { FaLock, FaUnlock } from 'react-icons/fa'
import { useCollectionFolder } from './utils'

const createDocument = async (
  cms: TinaCMS,
  collection: Collection,
  template: { name: string },
  mutationInfo: { includeCollection: boolean; includeTemplate: boolean },
  folder: string,
  values: any
) => {
  const api = new TinaAdminApi(cms)
  const { filename, ...leftover } = values

  const relativePath = `${folder ? `${folder}/` : ''}${filename}.${
    collection.format
  }`
  const params = api.schema.transformPayload(collection.name, {
    _collection: collection.name,
    ...(template && { _template: template.name }),
    ...leftover,
  })

  if (await api.isAuthenticated()) {
    await api.createDocument(collection, relativePath, params)
  } else {
    const authMessage = `CreateDocument failed: User is no longer authenticated; please login and try again.`
    cms.alerts.error(authMessage)
    console.error(authMessage)
    return false
  }
}

const CollectionCreatePage = () => {
  const folder = useCollectionFolder()
  const { collectionName, templateName } = useParams()

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetCollection
          cms={cms}
          collectionName={collectionName}
          folder={folder}
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
                folder={folder}
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

export const RenderForm = ({
  cms,
  collection,
  folder,
  templateName,
  mutationInfo,
  customDefaults,
}: {
  cms: TinaCMS
  collection
  folder
  templateName
  mutationInfo
  customDefaults?: any
}) => {
  const navigate = useNavigate()
  const [formIsPristine, setFormIsPristine] = useState(true)
  const schema: TinaSchema | undefined = cms.api.tina.schema

  // the schema is being passed in from the frontend so we can use that
  const schemaCollection = schema.getCollection(collection.name)
  const template: Template<true> = schema.getTemplateForData({
    collection: schemaCollection,
    data: { _template: templateName },
  }) as Template<true>

  const formInfo = resolveForm({
    collection: schemaCollection,
    basename: schemaCollection.name,
    schema: schema,
    template,
  })

  let slugFunction = schemaCollection.ui?.filename?.slugify

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

  const defaultItem =
    customDefaults ||
    // @ts-ignore internal types aren't up to date
    template.ui?.defaultItem ||
    // @ts-ignore
    template?.defaultItem

  const form = useMemo(() => {
    const folderName = folder.fullyQualifiedName ? folder.name : ''
    return new Form({
      crudType: 'create',
      initialValues:
        typeof defaultItem === 'function' ? defaultItem() : defaultItem,
      extraSubscribeValues: { active: true, submitting: true, touched: true },
      onChange: (values) => {
        if (!values?.submitting) {
          // keeps the forms relative path in sync with the filename
          form.relativePath =
            schemaCollection.path +
            folderName +
            `/${values?.values?.filename}.${schemaCollection.format || 'md'}`
        }
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
      id:
        schemaCollection.path +
        folderName +
        `/new-post.${schemaCollection.format || 'md'}`,
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
                    readonly={schemaCollection?.ui?.filename?.readonly}
                    {...input}
                  />
                )
              })
            : 'text',
          disabled: schemaCollection?.ui?.filename?.readonly,
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
            // check if the filename is allowed by the collection.
            if (
              schemaCollection.match?.exclude ||
              schemaCollection.match?.include
            ) {
              const filePath = `${normalizePath(
                schemaCollection.path
              )}/${value}.${schemaCollection.format || 'md'}`
              const match = schema.matchFiles({
                files: [filePath],
                collection: schemaCollection,
              })
              if (match.length === 0) {
                return `The filename "${value}" is not allowed for this collection.`
              }
            }
          },
        },
      ],
      onSubmit: async (values) => {
        try {
          const folderName = folder.fullyQualifiedName ? folder.name : ''
          await createDocument(
            cms,
            collection,
            template,
            mutationInfo,
            folderName,
            values
          )
          cms.alerts.success('Document created!')
          setTimeout(() => {
            navigate(
              `/collections/${collection.name}${
                folder.fullyQualifiedName ? `/${folder.fullyQualifiedName}` : ''
              }`
            )
          }, 10)
        } catch (error) {
          console.error(error)
          const defaultErrorText = 'There was a problem saving your document.'
          if (error.message.includes('already exists')) {
            cms.alerts.error(
              `${defaultErrorText} The "Filename" is alredy used for another document, please modify it.`
            )
          } else {
            cms.alerts.error(defaultErrorText)
          }
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

  React.useEffect(() => {
    cms.dispatch({ type: 'forms:add', value: form })
    cms.dispatch({ type: 'forms:set-active-form-id', value: form.id })
    return () => {
      cms.dispatch({ type: 'forms:remove', value: form.id })
      cms.dispatch({ type: 'forms:set-active-form-id', value: null })
    }
  }, [JSON.stringify(formInfo.fields)])
  if (!cms.state.activeFormId) {
    return null
  }
  const activeForm = cms.state.forms.find(
    ({ tinaForm }) => tinaForm.id === form.id
  )

  return (
    <PageWrapper>
      <>
        {cms?.api?.tina?.isLocalMode ? <LocalWarning /> : <BillingWarning />}
        <div
          className={`py-4 border-b border-gray-200 bg-white ${headerPadding}`}
        >
          <div className="max-w-form mx-auto">
            <div className="mb-2">
              <span className="block text-sm leading-tight uppercase text-gray-400 mb-1">
                <Link
                  to={`/collections/${collection.name}${
                    folder.fullyQualifiedName
                      ? `/${folder.fullyQualifiedName}`
                      : ''
                  }`}
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
        {activeForm && (
          <FormBuilder form={activeForm} onPristineChange={setFormIsPristine} />
        )}
      </>
    </PageWrapper>
  )
}

export default CollectionCreatePage
