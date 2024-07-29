import { BillingWarning, Form, FormBuilder, FormStatus } from '@tinacms/toolkit'
import GetCMS from '../components/GetCMS'
import GetCollection from '../components/GetCollection'
import GetDocument from '../components/GetDocument'
import React, { useMemo, useState } from 'react'
import { TinaSchema, resolveForm, Collection } from '@tinacms/schema-tools'
import { Link, useParams } from 'react-router-dom'
import { LocalWarning } from '@tinacms/toolkit'
import { PageWrapper } from '../components/Page'
import { TinaAdminApi } from '../api'
import type { Field, TinaCMS } from '@tinacms/toolkit'
import { useCollectionFolder } from './utils'
import { ErrorDialog } from '../components/ErrorDialog'

const updateDocument = async (
  cms: TinaCMS,
  relativePath: string,
  collection: Collection,
  mutationInfo: { includeCollection: boolean; includeTemplate: boolean },
  values: any
) => {
  const api = new TinaAdminApi(cms)
  const params = api.schema.transformPayload(collection.name, values)
  if (await api.isAuthenticated()) {
    await api.updateDocument(collection, relativePath, params)
  } else {
    const authMessage = `UpdateDocument failed: User is no longer authenticated; please login and try again.`
    cms.alerts.error(authMessage)
    console.error(authMessage)
    return false
  }
}

const CollectionUpdatePage = () => {
  const { collectionName, ...rest } = useParams()
  const folder = useCollectionFolder()
  const { '*': filename } = rest // TODO can just use the folder.name instead

  const resolvedFile = folder.fullyQualifiedName ? folder.name : filename
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
            const relativePath = `${resolvedFile}.${collection.format}`
            const mutationInfo = {
              includeCollection: true,
              includeTemplate: !!collection.templates,
            }

            return (
              <PageWrapper>
                <GetDocument
                  cms={cms}
                  collectionName={collection.name}
                  relativePath={relativePath}
                >
                  {(document) => (
                    <RenderForm
                      cms={cms}
                      document={document}
                      filename={resolvedFile}
                      relativePath={relativePath}
                      collection={collection}
                      mutationInfo={mutationInfo}
                    />
                  )}
                </GetDocument>
              </PageWrapper>
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
}: {
  cms: TinaCMS
  document
  filename
  relativePath
  collection
  mutationInfo
}) => {
  const [formIsPristine, setFormIsPristine] = useState(true)
  const schema: TinaSchema | undefined = cms.api.tina.schema
  const parentFolder = relativePath.split('/').slice(0, -1).join('/')

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
    let uidField: Field | undefined
    if (collection.singleFile) {
      uidField = collection.fields.find((field) => !!field.uid)
      if (!uidField) {
        throw new Error(
          `Collection ${collection.name} is configured as single file, but does not have a field with uid set.`
        )
      }
    }
    return new Form({
      // id is the full document path
      id: `${schemaCollection.path}/${relativePath}`,
      label: 'form',
      fields: formInfo.fields.filter(
        (field) => field.name != uidField?.name
      ) as any,
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
          cms.alerts.error(() =>
            ErrorDialog({
              title: 'There was a problem saving your document',
              message: 'Tina caught an error while updating the page',
              error,
            })
          )
          console.error(error)
          throw new Error(
            `[${error.name}] UpdateDocument failed: ${error.message}`
          )
        }
      },
    })
  }, [cms, document, relativePath, collection, mutationInfo])

  React.useEffect(() => {
    cms.dispatch({ type: 'forms:add', value: form })
    cms.dispatch({ type: 'forms:set-active-form-id', value: form.id })
    return () => {
      cms.dispatch({ type: 'forms:remove', value: form.id })
      cms.dispatch({ type: 'forms:set-active-form-id', value: null })
    }
  }, [JSON.stringify(document._values)])
  if (!cms.state.activeFormId) {
    return null
  }
  const activeForm = cms.state.forms.find(
    ({ tinaForm }) => tinaForm.id === form.id
  )

  return (
    <>
      {cms?.api?.tina?.isLocalMode ? <LocalWarning /> : <BillingWarning />}
      <div
        className={`pt-10 xl:pt-3 pb-10 xl:pb-4 px-20 xl:px-12 border-b border-gray-200 bg-white w-full grow-0 shrink basis-0 flex justify-center`}
      >
        <div className="w-full flex gap-1.5 justify-between items-center">
          <Link
            to={`/collections/${collection.name}/~${parentFolder}`}
            className="flex-0 text-blue-500 hover:text-blue-400 hover:underline underline decoration-blue-200 hover:decoration-blue-400 text-sm leading-tight whitespace-nowrap truncate transition-all duration-150 ease-out"
          >
            {collection.label ? collection.label : collection.name}
          </Link>
          <span className="opacity-30 text-sm leading-tight whitespace-nowrap flex-0">
            /
          </span>
          <span className="flex-1 w-full text-sm leading-tight whitespace-nowrap truncate">
            {`${filename}.${collection.format}`}
          </span>
          <FormStatus pristine={formIsPristine} />
        </div>
      </div>
      {activeForm && (
        <FormBuilder form={activeForm} onPristineChange={setFormIsPristine} />
      )}
    </>
  )
}

export default CollectionUpdatePage
