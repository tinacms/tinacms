import React from 'react'
import * as G from 'graphql'
import { getIn } from 'final-form'
import { z, ZodError } from 'zod'
// @ts-expect-error
import schemaJson from 'SCHEMA_IMPORT'
import { expandQuery, isNodeType } from './expand-query'
import {
  Form,
  TinaCMS,
  NAMER,
  TinaSchema,
  useCMS,
  resolveField,
  Collection,
  Template,
  TinaField,
  Client,
  FormOptions,
  GlobalFormPlugin,
} from 'tinacms'
import { createForm, createGlobalForm, FormifyCallback } from './build-form'
import type {
  PostMessage,
  Payload,
  SystemInfo,
  Document,
  ResolvedDocument,
} from './types'

const sysSchema = z.object({
  breadcrumbs: z.array(z.string()),
  basename: z.string(),
  filename: z.string(),
  path: z.string(),
  extension: z.string(),
  relativePath: z.string(),
  title: z.string().optional().nullable(),
  template: z.string(),
  collection: z.object({
    name: z.string(),
    slug: z.string(),
    label: z.string(),
    path: z.string(),
    format: z.string().optional().nullable(),
    matches: z.string().optional().nullable(),
  }),
})

const documentSchema: z.ZodType<ResolvedDocument> = z.object({
  _internalValues: z.record(z.unknown()),
  _internalSys: sysSchema,
})

const astNode = schemaJson as G.DocumentNode
const astNodeWithMeta: G.DocumentNode = {
  ...astNode,
  definitions: astNode.definitions.map((def) => {
    if (def.kind === 'ObjectTypeDefinition') {
      return {
        ...def,
        fields: [
          ...(def.fields || []),
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: '_tina_metadata',
            },
            arguments: [],
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: {
                  kind: 'Name',
                  value: 'JSON',
                },
              },
            },
          },
        ],
      }
    }
    return def
  }),
}
const schema = G.buildASTSchema(astNode)
const schemaForResolver = G.buildASTSchema(astNodeWithMeta)

export const useGraphQLReducer = (
  iframe: React.MutableRefObject<HTMLIFrameElement>,
  url: string
) => {
  const cms = useCMS()
  const tinaSchema = cms.api.tina.schema as TinaSchema
  const [payloads, setPayloads] = React.useState<Payload[]>([])
  const [documentsToResolve, setDocumentsToResolve] = React.useState<string[]>(
    []
  )
  const [resolvedDocuments, setResolvedDocuments] = React.useState<
    ResolvedDocument[]
  >([])
  const [operationIndex, setOperationIndex] = React.useState(0)

  React.useEffect(() => {
    const run = async () => {
      return Promise.all(
        documentsToResolve.map(async (documentId) => {
          return await getDocument(documentId, cms.api.tina)
        })
      )
    }
    if (documentsToResolve.length) {
      run().then((docs) => {
        setResolvedDocuments((resolvedDocs) => [...resolvedDocs, ...docs])
        setDocumentsToResolve([])
        setOperationIndex((i) => i + 1)
      })
    }
  }, [documentsToResolve.join('.')])

  /**
   * Note: since React runs effects twice in development this will run twice for a given query
   * which results in duplicate network requests in quick succession
   */
  React.useEffect(() => {
    const run = async () => {
      return Promise.all(
        payloads.map(async (payload) => {
          // This payload has already been expanded, skip it.
          if (payload.expandedQuery) {
            return payload
          } else {
            const expandedPayload = await expandPayload(payload, cms)
            processPayload(expandedPayload)
            return expandedPayload
          }
        })
      )
    }
    if (payloads.length) {
      run().then((updatedPayloads) => {
        setPayloads(updatedPayloads)
      })
    }
  }, [payloads.map(({ id }) => id).join('.'), cms])

  const processPayload = React.useCallback(
    (payload: Payload) => {
      const { expandedQueryForResolver, variables, expandedData } = payload
      if (!expandedQueryForResolver || !expandedData) {
        throw new Error(`Unable to process payload which has not been expanded`)
      }

      const result = G.graphqlSync({
        schema: schemaForResolver,
        source: expandedQueryForResolver,
        variableValues: variables,
        rootValue: expandedData,
        fieldResolver: (source, args, context, info) => {
          const fieldName = info.fieldName
          /**
           * Since the `source` for this resolver is the query that
           * ran before passing it into `useTina`, we need to take aliases
           * into consideration, so if an alias is provided we try to
           * see if that has the value we're looking for. This isn't a perfect
           * solution as the `value` gets overwritten depending on the alias
           * query.
           */
          const aliases: string[] = []
          info.fieldNodes.forEach((fieldNode) => {
            if (fieldNode.alias) {
              aliases.push(fieldNode.alias.value)
            }
          })
          let value = source[fieldName] as unknown
          if (!value) {
            aliases.forEach((alias) => {
              const aliasValue = source[alias]
              if (aliasValue) {
                value = aliasValue
              }
            })
          }
          if (fieldName === '_sys') {
            return source._internalSys
          }
          if (fieldName === '_values') {
            return source._internalValues
          }
          if (info.fieldName === '_tina_metadata') {
            if (value) {
              return value
            }
            // TODO: ensure all fields that have _tina_metadata
            // actually need it
            return {
              id: null,
              fields: [],
            }
          }
          if (isNodeType(info.returnType)) {
            if (!value) {
              return
            }
            let resolvedDocument: ResolvedDocument
            // This is a reference from another form
            if (typeof value === 'string') {
              const valueFromSetup = getIn(
                expandedData,
                G.responsePathAsArray(info.path).join('.')
              )
              const maybeResolvedDocument = resolvedDocuments.find(
                (doc) => doc._internalSys.path === value
              )
              // If we already have this document, use it.
              if (maybeResolvedDocument) {
                resolvedDocument = maybeResolvedDocument
              } else if (valueFromSetup) {
                // Else, even though in this context the value is a string because it's
                // resolved from a parent form, if the reference hasn't changed
                // from when we ran the setup query, we can avoid a data fetch
                // here and just grab it from the response
                const maybeResolvedDocument =
                  documentSchema.parse(valueFromSetup)
                if (maybeResolvedDocument._internalSys.path === value) {
                  resolvedDocument = maybeResolvedDocument
                } else {
                  throw new NoFormError(`No form found`, value)
                }
              } else {
                throw new NoFormError(`No form found`, value)
              }
            } else {
              resolvedDocument = documentSchema.parse(value)
            }
            const id = resolvedDocument._internalSys.path
            let existingForm = cms.forms.find(id)
            if (!existingForm) {
              cms.plugins
                .getType('screen')
                .all()
                .forEach((plugin) => {
                  // @ts-ignore
                  if (plugin?.form && plugin.form?.id === id) {
                    // @ts-ignore
                    existingForm = plugin.form
                  }
                })
            }
            if (!existingForm) {
              const { form, template } = buildForm({
                resolvedDocument,
                tinaSchema,
                payloadId: payload.id,
                cms,
              })
              form.subscribe(
                () => {
                  setOperationIndex((i) => i + 1)
                },
                { values: true }
              )
              return resolveDocument(resolvedDocument, template, form)
            } else {
              existingForm.addQuery(payload.id)
              const { template } = getTemplateForDocument(
                resolvedDocument,
                tinaSchema
              )
              existingForm.addQuery(payload.id)
              return resolveDocument(resolvedDocument, template, existingForm)
            }
          }
          return value
        },
      })
      if (result.errors) {
        result.errors.forEach((error) => {
          if (
            error instanceof G.GraphQLError &&
            error.originalError instanceof NoFormError
          ) {
            const id = error.originalError.id
            setDocumentsToResolve((docs) => [
              ...docs.filter((doc) => doc !== id),
              id,
            ])
          } else {
            console.log(error)
            // throw new Error(
            //   `Error processing value change, please contact support`
            // )
          }
        })
      } else {
        iframe.current?.contentWindow?.postMessage({
          type: 'updateData',
          id: payload.id,
          data: result.data,
        })

        // This can be improved, for now we just need something to test with
        const elements =
          iframe.current?.contentWindow?.document.querySelectorAll<HTMLElement>(
            `[data-tinafield]`
          )
        if (elements) {
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i]
            el.onclick = () => {
              const tinafield = el.getAttribute('data-tinafield')
              cms.events.dispatch({
                type: 'field:selected',
                value: tinafield,
              })
            }
          }
        }
      }
    },
    [resolvedDocuments.map((doc) => doc._internalSys.path).join('.')]
  )

  const notifyEditMode = React.useCallback(
    (event: MessageEvent<PostMessage>) => {
      if (event?.data?.type === 'isEditMode') {
        iframe?.current?.contentWindow?.postMessage({
          type: 'tina:editMode',
        })
      }
    },
    []
  )
  const handleOpenClose = React.useCallback(
    (event: MessageEvent<PostMessage>) => {
      if (event.data.type === 'close') {
        const payloadSchema = z.object({ id: z.string() })
        const { id } = payloadSchema.parse(event.data)
        setPayloads((previous) =>
          previous.filter((payload) => payload.id !== id)
        )
        cms.forms.all().map((form) => {
          form.removeQuery(id)
        })
        cms.removeOrphanedForms()
      }
      if (event.data.type === 'open') {
        const payloadSchema = z.object({
          id: z.string(),
          query: z.string(),
          variables: z.record(z.unknown()),
          data: z.record(z.unknown()),
        })
        const payload = payloadSchema.parse(event.data)
        setPayloads((payloads) => [
          ...payloads.filter(({ id }) => id !== payload.id),
          payload,
        ])
      }
    },
    [cms]
  )

  React.useEffect(() => {
    payloads.forEach((payload) => {
      if (payload.expandedData) {
        processPayload(payload)
      }
    })
  }, [operationIndex])

  React.useEffect(() => {
    return () => {
      setPayloads([])
      cms.removeAllForms()
    }
  }, [url])

  React.useEffect(() => {
    if (iframe) {
      window.addEventListener('message', handleOpenClose)
      window.addEventListener('message', notifyEditMode)
    }

    return () => {
      window.removeEventListener('message', handleOpenClose)
      window.removeEventListener('message', notifyEditMode)
      cms.removeAllForms()
    }
  }, [iframe.current])
}

const onSubmit = async (
  collection: Collection<true>,
  relativePath: string,
  payload: Record<string, unknown>,
  cms: TinaCMS
) => {
  const tinaSchema = cms.api.tina.schema
  try {
    const mutationString = `#graphql
      mutation UpdateDocument($collection: String!, $relativePath: String!, $params: DocumentUpdateMutation!) {
        updateDocument(collection: $collection, relativePath: $relativePath, params: $params) {
          __typename
        }
      }
    `

    await cms.api.tina.request(mutationString, {
      variables: {
        collection: collection.name,
        relativePath: relativePath,
        params: tinaSchema.transformPayload(collection.name, payload),
      },
    })
    cms.alerts.success('Document saved!')
  } catch (e) {
    cms.alerts.error('There was a problem saving your document')
    console.error(e)
  }
}

type Path = (string | number)[]

const resolveDocument = (
  doc: ResolvedDocument,
  template: Template<true>,
  form: Form
): ResolvedDocument => {
  // @ts-ignore AnyField and TinaField don't mix
  const fields = form.fields as TinaField<true>[]
  const id = doc._internalSys.path
  const path: Path = []
  const formValues = resolveFormValue({
    fields: fields,
    values: form.values,
    path,
    id,
  })
  const metadataFields: Record<string, string> = {}
  Object.keys(formValues).forEach((key) => {
    metadataFields[key] = [...path, key].join('.')
  })

  return {
    ...formValues,
    id,
    sys: doc._internalSys,
    values: form.values,
    _tina_metadata: {
      id: doc._internalSys.path,
      fields: metadataFields,
    },
    _internalSys: doc._internalSys,
    _internalValues: doc._internalValues,
    __typename: NAMER.dataTypeName(template.namespace),
  }
}

const resolveFormValue = <T extends Record<string, unknown>>({
  fields,
  values,
  path,
  id,
}: // tinaSchema,
{
  fields: TinaField<true>[]
  values: T
  path: Path
  id: string
  // tinaSchema: TinaSchema
}): T & { __typename?: string } => {
  const accum: Record<string, unknown> = {}
  fields.forEach((field) => {
    const v = values[field.name]
    if (typeof v === 'undefined') {
      return
    }
    if (v === null) {
      return
    }
    accum[field.name] = resolveFieldValue({
      field,
      value: v,
      path,
      id,
    })
  })
  return accum as T & { __typename?: string }
}
const resolveFieldValue = ({
  field,
  value,
  path,
  id,
}: {
  field: TinaField<true>
  value: unknown
  path: Path
  id: string
}) => {
  switch (field.type) {
    case 'object': {
      if (field.templates) {
        if (field.list) {
          if (Array.isArray(value)) {
            return value.map((item, index) => {
              const template = field.templates[item._template]
              if (typeof template === 'string') {
                throw new Error('Global templates not supported')
              }
              const nextPath = [...path, field.name, index]
              const metadataFields: Record<string, string> = {}
              template.fields.forEach((field) => {
                metadataFields[field.name] = [...nextPath, field.name].join('.')
              })
              return {
                __typename: NAMER.dataTypeName(template.namespace),
                _tina_metadata: {
                  id,
                  fields: metadataFields,
                },
                ...resolveFormValue({
                  fields: template.fields,
                  values: item,
                  path: nextPath,
                  id,
                }),
              }
            })
          }
        } else {
          // not implemented
        }
      }

      const templateFields = field.fields
      if (typeof templateFields === 'string') {
        throw new Error('Global templates not supported')
      }
      if (!templateFields) {
        throw new Error(`Expected to find sub-fields on field ${field.name}`)
      }
      if (field.list) {
        if (Array.isArray(value)) {
          return value.map((item, index) => {
            const nextPath = [...path, field.name, index]
            const metadataFields: Record<string, string> = {}
            templateFields.forEach((field) => {
              metadataFields[field.name] = [...nextPath, field.name].join('.')
            })
            return {
              __typename: NAMER.dataTypeName(field.namespace),
              _tina_metadata: {
                id,
                fields: metadataFields,
              },
              ...resolveFormValue({
                fields: templateFields,
                values: item,
                path,
                id,
              }),
            }
          })
        }
      } else {
        const nextPath = [...path, field.name]
        const metadataFields: Record<string, string> = {}
        templateFields.forEach((field) => {
          metadataFields[field.name] = [...nextPath, field.name].join('.')
        })
        return {
          __typename: NAMER.dataTypeName(field.namespace),
          _tina_metadata: {
            id,
            fields: metadataFields,
          },
          ...resolveFormValue({
            fields: templateFields,
            values: value as any,
            path,
            id,
          }),
        }
      }
    }
    default: {
      return value
    }
  }
}

const getDocument = async (id: string, tina: Client) => {
  const response = await tina.request<{
    node: { _internalSys: SystemInfo; _internalValues: Record<string, unknown> }
  }>(
    `query GetNode($id: String!) {
node(id: $id) {
...on Document {
  _internalValues: _values
_internalSys: _sys {
  breadcrumbs
  basename
  filename
  path
  extension
  relativePath
  title
  template
  collection {
    name
    slug
    label
    path
    format
    matches
    templates
    fields
    __typename
  }
  __typename
}
}
}
}`,
    { variables: { id: id } }
  )
  return response.node
}

const expandPayload = async (payload: Payload, cms: TinaCMS) => {
  const { query, variables } = payload
  const documentNode = G.parse(query)
  const expandedDocumentNode = expandQuery({ schema, documentNode })
  const expandedQuery = G.print(expandedDocumentNode)
  const expandedData = await cms.api.tina.request(expandedQuery, {
    variables,
  })

  const expandedDocumentNodeForResolver = expandQuery({
    schema: schemaForResolver,
    documentNode,
  })
  const expandedQueryForResolver = G.print(expandedDocumentNodeForResolver)
  return { ...payload, expandQuery, expandedData, expandedQueryForResolver }
}

/**
 * When we resolve the graphql data we check for these errors,
 * if we find one we enqueue the document to be generated, and then
 * process it once we have that document
 */
class NoFormError extends Error {
  id: string
  constructor(msg: string, id: string) {
    super(msg)
    this.id = id
    Object.setPrototypeOf(this, NoFormError.prototype)
  }
}

const getTemplateForDocument = (
  resolvedDocument: ResolvedDocument,
  tinaSchema: TinaSchema
) => {
  const id = resolvedDocument._internalSys.path
  const collection = tinaSchema.getCollectionByFullPath(id)
  if (!collection) {
    throw new Error(`Unable to determine collection for path ${id}`)
  }

  const template = tinaSchema.getTemplateForData({
    data: resolvedDocument._internalValues,
    collection,
  })
  return { template, collection }
}

const buildForm = ({
  resolvedDocument,
  tinaSchema,
  payloadId,
  cms,
}: {
  resolvedDocument: ResolvedDocument
  tinaSchema: TinaSchema
  payloadId: string
  cms: TinaCMS
}) => {
  const { template, collection } = getTemplateForDocument(
    resolvedDocument,
    tinaSchema
  )
  const id = resolvedDocument._internalSys.path
  let form: Form | undefined
  let shouldRegisterForm = true
  const formConfig: FormOptions<any> = {
    id,
    initialValues: resolvedDocument._internalValues,
    fields: template.fields.map((field) => resolveField(field, tinaSchema)),
    onSubmit: (payload) =>
      onSubmit(
        collection,
        resolvedDocument._internalSys.relativePath,
        payload,
        cms
      ),
    label: collection.label || collection.name,
  }
  if (tinaSchema.config.config?.formifyCallback) {
    const callback = tinaSchema.config.config
      ?.formifyCallback as FormifyCallback
    form =
      callback(
        {
          createForm: createForm,
          createGlobalForm: createGlobalForm,
          skip: () => {},
          formConfig,
        },
        cms
      ) || undefined
    if (!form) {
      // If the form isn't created from formify, we still
      // need it, just don't show it to the user.
      shouldRegisterForm = false
      form = new Form(formConfig)
    }
  } else {
    if (collection.ui?.global) {
      form = createGlobalForm(formConfig)
    } else {
      form = createForm(formConfig)
    }
  }
  if (form) {
    if (shouldRegisterForm) {
      form.subscribe(() => {}, { values: true })
      if (collection.ui?.global) {
        cms.plugins.add(new GlobalFormPlugin(form))
      } else {
        cms.forms.add(form)
      }
    }
  }
  if (!form) {
    throw new Error(`No form registered for ${id}.`)
  }
  return { template, form }
}
