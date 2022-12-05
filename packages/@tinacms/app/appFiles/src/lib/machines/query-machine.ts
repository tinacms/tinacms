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
import { assign, createMachine, spawn } from 'xstate'
import { Form, TinaCMS, NAMER, GlobalFormPlugin, Client } from 'tinacms'
import type { TinaSchema, SchemaField } from '@tinacms/schema-tools'
import * as G from 'graphql'
import { formify } from '../formify'
import { Data, documentMachine } from './document-machine'
import type { ActorRefFrom } from 'xstate'
import { getIn } from 'final-form'

export type DataType = Record<string, unknown>
type DocumentInfo = {
  ref: ActorRefFrom<typeof documentMachine>
}
type DocumentMap = {
  [documentId: string]: DocumentInfo & {
    /** We don't support nested forms or forms for list queries */
    skipFormRegister: boolean
  }
}

type ContextType = {
  id: null | string
  data: null | DataType
  cms: TinaCMS
  documentNode: G.DocumentNode
  variables: object
  iframe: null | HTMLIFrameElement
  registerSubForms?: boolean
  formifyCallback: (args: any) => Form
  documentMap: DocumentMap
  documents: Data[]
}
export const initialContext: Omit<ContextType, 'cms' | 'formifyCallback'> = {
  id: null,
  data: null,
  variables: {},
  documentMap: {},
  documents: [],
  documentNode: { kind: 'Document', definitions: [] },
  iframe: null,
}
type SetterResponse = { data: DataType }
export const queryMachine = createMachine(
  {
    tsTypes: {} as import('./query-machine.typegen').Typegen0,
    schema: {
      context: {} as ContextType,
      services: {} as {
        initializer: {
          data: SetterResponse & { documents: Data[] }
        }
        setter: {
          data: SetterResponse
        }
        subDocumentResolver: {
          data: {
            id: string
            location: string
          }[]
        }
        onChangeCallback: {
          data: undefined
        }
      },
      events: {} as
        | {
            type: 'IFRAME_MOUNTED'
            value: HTMLIFrameElement
          }
        | {
            type: 'SELECT_DOCUMENT'
            value: string
          }
        | {
            type: 'DOCUMENT_READY'
            value: string
          }
        | {
            type: 'NAVIGATE'
          }
        | {
            type: 'ADD_QUERY'
            value: {
              id: string
              type: 'open' | 'close'
              query: string
              data: object
              variables: object
            }
          }
        | {
            type: 'REMOVE_QUERY'
          }
        | {
            type: 'SUBDOCUMENTS'
            value: { id: string; location: string }[]
          }
        | {
            type: 'FIELD_CHANGE'
          }
        | {
            type: 'EDIT_MODE'
          },
    },
    id: '(machine)',
    type: 'parallel',
    states: {
      pipeline: {
        initial: 'idle',
        states: {
          idle: {
            entry: 'clear',
            on: {
              ADD_QUERY: {
                target: 'initializing',
              },
              SUBDOCUMENTS: {
                target: 'pending',
              },
              IFRAME_MOUNTED: {
                actions: 'setIframe',
              },
            },
          },
          initializing: {
            invoke: {
              src: 'initializer',
              onDone: [
                {
                  actions: 'storeInitialValues',
                  target: 'pending',
                },
              ],
              onError: [
                {
                  actions: 'handleError',
                  target: 'error',
                },
              ],
            },
          },
          waiting: {
            on: {
              DOCUMENT_READY: {
                target: 'pending',
              },
            },
          },
          pending: {
            invoke: {
              src: 'setter',
              onDone: [
                {
                  target: 'ready',
                },
              ],
              onError: [
                {
                  actions: 'handleMissingDocument',
                  target: 'waiting',
                },
              ],
            },
          },
          ready: {
            entry: 'resolveData',
            invoke: {
              src: 'onChangeCallback',
            },
            on: {
              NAVIGATE: {
                target: 'idle',
              },
              REMOVE_QUERY: {
                target: 'idle',
              },
              FIELD_CHANGE: {
                target: 'pending',
              },
            },
          },
          error: {},
        },
      },
    },
  },
  {
    actions: {
      handleError: (_context, event) => console.error(event.data),
      handleMissingDocument: assign((context, event) => {
        if (event.data instanceof QueryError) {
          if (context.documentMap[event.data.id]) {
            // Already exists
            return context
          }
          if (!event.data.id) {
            return context
          }
          const existingData = context.documents.find(
            // FIXME: xstate doesn't know which event this correlates to
            (doc) => doc._internalSys.path === event.data.id
          )
          const doc = {
            ref: spawn(
              documentMachine.withContext({
                id: event.data.id,
                cms: context.cms,
                formifyCallback: context.formifyCallback,
                form: null,
                data: existingData || null,
              })
            ),
          }

          return {
            ...context,
            documentMap: {
              ...context.documentMap,
              [event.data.id]: {
                ...doc,
                skipFormRegister: event.data.skipFormRegister,
              },
            },
          }
        } else {
          console.error(event.data)
          return context
        }
      }),
      clear: assign((context) => {
        context.cms.forms.all().forEach((form) => {
          context.cms.forms.remove(form.id)
        })
        return {
          ...initialContext,
          formifyCallback: context.formifyCallback,
          cms: context.cms,
          // documentMap: context.documentMap, // to preserve docs across pages
          iframe: context.iframe,
        }
      }),
      storeInitialValues: assign((context, event) => {
        return {
          ...context,
          ...event.data,
        }
      }),
      setIframe: assign((context, event) => {
        return {
          ...context,
          iframe: event.value,
        }
      }),
      resolveData: assign((context, event) => {
        if (context.iframe) {
          context.iframe?.contentWindow?.postMessage({
            type: 'updateData',
            id: context.id,
            data: event.data.data,
          })
        }
        return {
          ...context,
          data: event.data.data,
        }
      }),
    },
    services: {
      setter: async (context) => {
        const tinaSchema = context.cms.api.tina.schema as TinaSchema
        const gqlSchema = context.cms.api.tina.gqlSchema
        const missingForms: { id: string; skipFormRegister: boolean }[] = []
        const newData = await G.graphql({
          schema: gqlSchema,
          source: G.print(context.documentNode),
          rootValue: context.data,
          variableValues: context.variables,
          fieldResolver: (source, args, _context, info) => {
            const fieldNode = info.fieldNodes[0]
            const fieldName = fieldNode.alias?.value || fieldNode.name.value
            if (info.fieldNodes.length > 1) {
              // Not sure this happens much https://github.com/graphql/graphql-js/issues/605
              console.error(
                'Unexpected multiple field nodes, is the query optimized?'
              )
            }
            if (isNodeType(info.returnType)) {
              const existingValue = source[fieldName]
              let skipFormRegister = false
              if (!existingValue) {
                return null
              }
              let path: string = ''
              if (typeof existingValue === 'string') {
                // this is a reference value (eg. post.author)
                skipFormRegister = true
                path = existingValue
              } else {
                path = existingValue._internalSys.path
              }
              if (context.documentMap[path]) {
                const documentMachine = context.documentMap[path].ref
                const documentContext = documentMachine.getSnapshot()?.context
                if (!documentContext) {
                  throw new Error(
                    `Document not set up properly for id: ${path}`
                  )
                }
                const { data, form } = documentContext
                const values = form?.values
                if (!data || !form || !values) {
                  throw new Error(
                    `Document not set up properly for id: ${path}`
                  )
                }
                const collectionName = data._internalSys.collection.name
                const extraValues = documentContext.data
                const formVal = resolveFormValue({
                  fields: form.fields,
                  values: values,
                  tinaSchema,
                })
                const template = tinaSchema.getTemplateForData({
                  data: form.values,
                  collection: tinaSchema.getCollection(collectionName),
                })
                return {
                  ...extraValues,
                  ...formVal,
                  _sys: data._internalSys,
                  id: path,
                  __typename: NAMER.dataTypeName(template.namespace),
                }
              } else {
                // TODO: when we support forms in lists, remove this check
                // This checks that we're at least 2 levels deep, meaning top-level
                // queries list page(relativePath: '...') will be registered, but
                // not connection nodes like pageConnection.edges.node
                if (info.path?.prev?.prev) {
                  skipFormRegister = true
                }
                missingForms.push({ id: path, skipFormRegister })
                return null
              }
              missingForms.push({ id: path, skipFormRegister })
              return null
            }
            return source[fieldName]
          },
        })
        if (missingForms.length > 0) {
          // Only run this one at a time
          const missingForm = missingForms[0]
          throw new QueryError(
            `Unable to resolve form for initial document`,
            missingForm.id,
            missingForm.skipFormRegister
          )
        }
        return { data: newData.data }
      },
      initializer: async (context, event) => {
        const tina = context.cms.api.tina as Client
        const schema = await tina.getSchema()
        const documentNode = G.parse(event.value.query)
        const { formifiedQuery } = await formify({
          schema,
          optimizedDocumentNode: documentNode,
        })
        const data = (await context.cms.api.tina.request(
          G.print(formifiedQuery),
          {
            variables: event.value.variables,
          }
        )) as DataType
        const documents: Data[] = []
        // step through every value in the payload to find the documents
        JSON.stringify(data, (key, value) => {
          if (value?._internalValues) {
            documents.push(value)
          }
          return value
        })
        return {
          data,
          documents,
          variables: event.value.variables,
          documentNode: formifiedQuery,
          id: event.value.id,
        }
      },
      onChangeCallback: (context) => (callback, _onReceive) => {
        const schema = context.cms.api.tina.schema as TinaSchema
        console.log(
          'ctx',
          context.documentMap['content/documentation/intro-to-tina.md']
        )
        Object.values(context.documentMap).forEach((documentMachine) => {
          if (!context.registerSubForms) {
            if (documentMachine.skipFormRegister) {
              return
            }
          }
          const documentContext = documentMachine.ref.getSnapshot()?.context
          const collectionName =
            documentContext?.data?._internalSys.collection.name

          const collection = schema.getCollection(collectionName || '')
          if (documentContext?.form) {
            if (collection.ui?.global) {
              context.cms.plugins.add(
                new GlobalFormPlugin(documentContext.form)
              )
            } else {
              context.cms.forms.add(documentContext.form)
            }
          }
        })
        if (context.cms) {
          context.cms.events.subscribe(`forms:fields:onChange`, (event) => {
            // Nested forms from rich-text also trigger this event
            if (Object.keys(context.documentMap).includes(event.formId)) {
              callback({ type: 'FIELD_CHANGE' })
            }
          })
          context.cms.events.subscribe(`forms:reset`, (event) => {
            if (Object.keys(context.documentMap).includes(event.formId)) {
              callback({ type: 'FIELD_CHANGE' })
            }
          })
        }
      },
    },
  }
)
class QueryError extends Error {
  public id: string
  public skipFormRegister: boolean
  constructor(message: string, id: string, skipFormRegister: boolean) {
    super(message) // (1)
    this.name = 'QueryError' // (2)
    this.id = id
    this.skipFormRegister = skipFormRegister
  }
}

const isNodeType = (type: G.GraphQLOutputType) => {
  const namedType = G.getNamedType(type)
  if (G.isInterfaceType(namedType)) {
    if (namedType.name === 'Node') {
      return true
    }
  }
  if (G.isUnionType(namedType)) {
    const types = namedType.getTypes()
    if (
      types.every((type) => {
        return type.getInterfaces().some((intfc) => intfc.name === 'Node')
      })
    ) {
      return true
    }
  }
  if (G.isObjectType(namedType)) {
    if (namedType.getInterfaces().some((intfc) => intfc.name === 'Node')) {
      return true
    }
  }
}

const resolveFormValue = <T extends Record<string, unknown>>({
  fields,
  values,
  tinaSchema,
}: {
  fields: SchemaField[]
  values: T
  tinaSchema: TinaSchema
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
      tinaSchema,
    })
  })
  return accum as T & { __typename?: string }
}
const resolveFieldValue = ({
  field,
  value,
  tinaSchema,
}: {
  field: SchemaField
  value: unknown
  tinaSchema: TinaSchema
}) => {
  switch (field.type) {
    case 'object': {
      if (field.templates) {
        if (field.list) {
          if (Array.isArray(value)) {
            return value.map((item) => {
              const template = field.templates[item._template]
              if (typeof template === 'string') {
                throw new Error('Global templates not supported')
              }
              return {
                __typename: NAMER.dataTypeName(template.namespace),
                ...resolveFormValue({
                  fields: template.fields,
                  values: item,
                  tinaSchema,
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
          return value.map((item) => {
            return {
              __typename: NAMER.dataTypeName(field.namespace),
              ...resolveFormValue({
                fields: templateFields,
                values: item,
                tinaSchema,
              }),
            }
          })
        }
      } else {
        return {
          __typename: NAMER.dataTypeName(field.namespace),
          ...resolveFormValue({
            fields: templateFields,
            values: value as any,
            tinaSchema,
          }),
        }
      }
    }
    default: {
      return value
    }
  }
}
