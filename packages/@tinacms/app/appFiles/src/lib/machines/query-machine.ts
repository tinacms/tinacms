/**

*/
import { assign, createMachine, spawn } from 'xstate'
import {
  Form,
  TinaCMS,
  NAMER,
  TinaFieldEnriched,
  TinaCollection,
  TinaSchema,
  GlobalFormPlugin,
  Client,
} from 'tinacms'
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
export const queryMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgFcAnAGxNwirAGIBlAUQBUB9AVQCUAZRKAAOAe1i4ALrlH4hIAB6IAjAAYALCXXqAnACZVAVmUAOAGxmAzMp1mANCACeidXpMkdnnSZvLDh1X11AF9ghzQsPEJSSho6BhYOTgBJADkABW4uPkEkEDEJaVl5JQQAdh0SMtVqvTqassN1M0MHZwRLdWUPLx8dPwCg0PCMHAJicmpaeiY2LgARZOZ0-gBBAE0eAXkCqRk5PNKyvRJVM-OL8+U2xD0mns8+gcC9ELCQCLHoybiZxm50vNVuxWFtciJxHtiodECZKqoLOpVMpjiYTGUyp0bghlGYyg9vL5-C83iNIuNSMJcMIwFRxtMEqt5vNOABFbisXjrHaQooHUBHPSWEiGSw6VSWUWYvRWHTYsro07nSzIpE+CrDD6jKITKk0umEBmzbgAIXmAHkAMLcACyrFS7GYPMK+xKiGOwtF4sllmlsuxOlcIquJlUJm04pMms+Osp1Np9PiTGSADFeKs7ZwbebuA7WPNnVD+YpEKKzCKFWG0dZkSZWk5YRKlWdDMc8f5SVryd89QnDQQ9ug6QAvAhQRgQWRgWj4ABuogA1tOYxSSL2DdOB9Ih7hR-goAgCPPMOg+QBtVQAXULfLdOLU+Neej8yksNdM9faCs0l3FrleorRtqq7rom+CDiOY6MGAFAUKIFBrlQp4AGbwagJArj28YbjOEG7mOh5zqIJ7nleN6ujC941CQT4vm+agftiZg6Piv4aHU6iAe8mG6th9IAO7oHs+6MBa1p2g6nC8KwTLcnkuy3pRygPjRrh0e+dbYspujNmcf4cU0QHdrx+r0jS+AQFBk79kRS4YcBWGmYa5mWfuhHHqe+wXte8m8hRAoqKYmiSn4Mr0bWn4qJYipeJ4gSto0zRGV8Jl9tOLlQTBcEIcISGSKhFDoTxcZOelYAWQRR7EZ5sjeeR0IBVRj5qcY4WMQ2OIIicbH-pxnbFWufGGhQYDoBAjj-ICwKgjk9XFqUlh4iQnS+kiOgJU09gdfo5YXCqyhqiiOjJbGg2lSQI1jRN0nZgAaqC7KcnJEIug1JYdEtK1lGtG3NNi6LuBc6gmHUophmUJ0gUN06XeNiT8KwloLFatr2uwc13sphgijYooJcpdRmCYWnKeWsXiutGKbZDjlpRdo1wymySsPwLKWgAEqsqQAOKsBjlGLfiX0-VTf0dcoMruIYoTvPgogQHA8gDbERr841ynuDK63WHclyWNihgGASTzEvoNMTLEavvcDumXBcB0Btj5PxaLZh6ObJV00mVulE02Nu7oROSs+XR6P9626a2MqNIZ3EOalOFbrgO57lAPuIH+VQ+M+0UaZF5SGLt5xR+2sdkilns4YJwlp75r3zRn3inDovoaAq6LSiTb4kCYb4qvoBh4sdcfGZXZnla5tcvUWmO+t0am99WDGaeL1juAqraGCDRg2O7I8V2ddOw+00+KY1GJaQY7jO5TiVmB7h84Vl8Hpzic9aM+i+98v+dlGoBIU1+vffep1QKEFfqKJidxdKmDDBGBEHtX6vFtnbM4DsOpCgAeTXowDQhAA */
  createMachine(
    {
      tsTypes: {} as import('./query-machine.typegen').Typegen0,
      schema: {
        context: {} as ContextType,
        services: {} as {
          initializer: {
            data: {
              data: DataType
            }
          }
          setter: {
            data: { data: DataType }
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
              value: string
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
              let value = source[fieldName]
              if (!value) {
                aliases.forEach((alias) => {
                  const aliasValue = source[alias]
                  if (aliasValue) {
                    value = aliasValue
                  }
                })
              }
              /**
               * Formify adds `_internalSys` and `_internalValues` to the query
               * and a user's query might also include `_values` or `_sys`, but
               * it may not contain all of the info we need, so the actual
               * source of truth for these values is our alias ones, which are
               * also guaranteed to include all of the values another `_sys` query
               * might include
               */
              if (fieldName === '_sys') {
                return source._internalSys
              }
              if (fieldName === '_values') {
                return source._internalValues
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
              }
              return value
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
          // Populate __meta__ property for use
          // in active field indicator utility
          const META_KEY = '__meta__'
          function* traverse(o) {
            const memory = new Set()
            function* innerTraversal(o, path = []) {
              if (memory.has(o)) {
                // we've seen this object before don't iterate it
                return
              }
              // add the new object to our memory.
              memory.add(o)
              for (let i of Object.keys(o)) {
                const itemPath = path.concat(i)
                yield [i, o[i], itemPath, o]
                if (o[i] !== null && typeof o[i] == 'object') {
                  if (
                    [
                      '_internalSys',
                      '_internalValues',
                      '_sys',
                      META_KEY,
                    ].includes(i)
                  ) {
                    //going one step down in the object tree!!
                    yield* innerTraversal(o[i], itemPath)
                  }
                }
              }
            }
            yield* innerTraversal(o)
          }
          const nodePaths = []
          for (let [key, value, path, parent] of traverse(newData.data)) {
            if (value?._internalSys) {
              nodePaths.push(path)
              const fields = {}
              const parents = nodePaths.filter((nodePath) => {
                return path.join('.').startsWith(nodePath.join('.'))
              })

              const nearestParent = parents.reduce(function (a, b) {
                return a.length < b.length ? a : b
              })
              Object.keys(value).map((key) => {
                if (
                  [
                    '__typename',
                    '_internalSys',
                    '_internalValues',
                    '_sys',
                  ].includes(key)
                ) {
                  return false
                }
                fields[key] = [
                  ...path.slice(nearestParent.length + 1),
                  key,
                ].join('.')
              })
              value[META_KEY] = {
                id: value?._internalSys.path,
                name: path.slice(nearestParent.length).join('.'),
                fields,
              }
            } else if (
              typeof value === 'object' &&
              !Array.isArray(value) &&
              value !== null
            ) {
              if (key !== META_KEY) {
                const parents = nodePaths.filter((nodePath) => {
                  return path.join('.').startsWith(nodePath.join('.'))
                })
                if (parents.length) {
                  const nearestParent = parents.reduce(function (a, b) {
                    return a.length < b.length ? a : b
                  })
                  const parent = getIn(newData.data, nearestParent.join('.'))
                  const id = parent._internalSys.path
                  const fields = {}
                  Object.keys(value).map((key) => {
                    if (
                      [
                        '__typename',
                        '_internalSys',
                        '_internalValues',
                        '_sys',
                      ].includes(key)
                    ) {
                      return false
                    }

                    fields[key] = [
                      ...path.slice(nearestParent.length),
                      key,
                    ].join('.')
                  })
                  value[META_KEY] = {
                    id,
                    name: path.slice(nearestParent.length).join('.'),
                    fields,
                  }
                }
              }
            }
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
          Object.values(context.documentMap).forEach((documentMachine) => {
            if (!context.registerSubForms) {
              if (documentMachine.skipFormRegister) {
                return
              }
            }
            const documentContext = documentMachine.ref.getSnapshot()?.context
            const collectionName =
              documentContext?.data?._internalSys.collection.name

            const collection = schema.getCollection(
              collectionName || ''
            ) as TinaCollection
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
  fields: TinaFieldEnriched[]
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
  field: TinaFieldEnriched
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
