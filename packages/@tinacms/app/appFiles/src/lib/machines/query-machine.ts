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
import { assign, ContextFrom, createMachine, spawn } from 'xstate'
import {
  Form,
  TinaCMS,
  NAMER,
  Template,
  TinaFieldEnriched,
  TinaCollection,
  TinaSchema,
  GlobalFormPlugin,
} from 'tinacms'
import * as G from 'graphql'
import { formify } from '../formify'
import { documentMachine, FieldType, FormValues } from './document-machine'
import type { ActorRefFrom } from 'xstate'
import { Blueprint2 } from '../formify'

export type DataType = Record<string, unknown>
type DocumentInfo = {
  ref: ActorRefFrom<typeof documentMachine>
}
type DocumentMap = {
  [documentId: string]: DocumentInfo
}

type ContextType = {
  id: null | string
  data: null | DataType
  cms: TinaCMS
  selectedDocument: string | null
  url: string
  inputURL: null | string
  displayURL: null | string
  iframe: null | HTMLIFrameElement
  iframeWidth: string
  formifyCallback: (args: any) => Form
  documentMap: DocumentMap
  blueprints: Blueprint2[]
  documentsToResolve: { id: string; location: string }[]
}
export const initialContext: ContextType = {
  id: null,
  data: null,
  selectedDocument: null,
  blueprints: [],
  // @ts-ignore
  cms: null,
  url: '/',
  iframeWidth: '200px',
  inputURL: null,
  displayURL: null,
  documentMap: {},
  // @ts-ignore
  formifyCallback: null,
  iframe: null,
  documentsToResolve: [],
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
              blueprints: Blueprint2[]
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
              type: 'SET_URL'
              value: string
            }
          | {
              type: 'SET_INPUT_URL'
              value: string
            }
          | {
              type: 'SET_DISPLAY_URL'
              value: string
            }
          | {
              type: 'UPDATE_URL'
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
            },
      },
      id: '(machine)',
      type: 'parallel',
      states: {
        url: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                SET_URL: {
                  actions: 'setUrl',
                },
                SET_INPUT_URL: {
                  actions: 'setInputUrl',
                },
                SET_DISPLAY_URL: {
                  actions: 'setDisplayUrl',
                },
                UPDATE_URL: {
                  actions: 'updateUrl',
                },
              },
            },
          },
        },
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
                UPDATE_URL: {
                  target: 'idle',
                },
                REMOVE_QUERY: {
                  target: 'idle',
                },
                SELECT_DOCUMENT: {
                  actions: 'selectDocument',
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
          count = count + 1
          if (count > 50) {
            throw new Error('infinite loop')
          }
          if (event.data instanceof QueryError) {
            if (context.documentMap[event.data.id]) {
              // Already exists
              return context
            }
            if (!event.data.id) {
              return context
            }
            const doc = {
              ref: spawn(
                documentMachine.withContext({
                  id: event.data.id,
                  cms: context.cms,
                  formifyCallback: context.formifyCallback,
                  form: null,
                  data: null,
                })
              ),
            }

            return {
              ...context,
              documentMap: {
                ...context.documentMap,
                [event.data.id]: doc,
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
            url: context.url,
          }
        }),
        setUrl: assign((context, event) => {
          return {
            ...context,
            url: event.value,
          }
        }),
        setDisplayUrl: assign((context, event) => {
          localStorage.setItem('tina-url', event.value)
          return {
            ...context,
            displayURL: event.value,
          }
        }),
        setInputUrl: assign((context, event) => {
          return {
            ...context,
            inputURL: event.value.startsWith('/')
              ? event.value
              : `/${event.value}`,
          }
        }),
        updateUrl: assign((context) => {
          if (context.inputURL) {
            context.cms.forms.all().forEach((form) => {
              context.cms.forms.remove(form.id)
            })
            return {
              ...context,
              selectedDocument: initialContext.selectedDocument,
              documentMap: initialContext.documentMap,
              blueprints: initialContext.blueprints,
              data: initialContext.data,
              inputURL: null,
              displayURL: context.inputURL,
              url: context.inputURL,
            }
          } else {
            return context
          }
        }),
        storeInitialValues: assign((context, event) => {
          return {
            ...context,
            ...event.data,
          }
        }),
        selectDocument: assign((context, event) => {
          return {
            ...context,
            selectedDocument: event.value,
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
          const walk = (obj: Record<string, unknown>, path: string[] = []) => {
            const accum: Record<string, unknown> = {}
            if (isScalar(obj)) {
              return obj
            }
            Object.entries(obj).map(([key, value]) => {
              if (Array.isArray(value)) {
                accum[key] = value.map((item) => walk(item, [...path, key]))
              } else {
                const blueprint = context.blueprints.find(
                  (bp) => bp.path?.join('.') === [...path, key].join('.')
                )
                if (blueprint) {
                  accum[key] = setData(value, blueprint, context)
                } else {
                  accum[key] = walk(value, [...path, key])
                }
              }
            })
            return accum
          }
          const accum = walk(context.data)
          const schema = context.cms.api.tina.schema as TinaSchema
          Object.values(context.documentMap).forEach((documentMachine) => {
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
          return { data: accum }
          // return { data: context.data }
        },
        initializer: async (context, event) => {
          const schema = await context.cms.api.tina.getSchema()
          const documentNode = G.parse(event.value.query)
          const optimizedQuery = await context.cms.api.tina.getOptimizedQuery(
            documentNode
          )
          if (!optimizedQuery) {
            throw new Error(`Unable to optimize query`)
          }
          const { blueprints, formifiedQuery } = await formify({
            schema,
            optimizedDocumentNode: optimizedQuery,
          })
          const data = (await context.cms.api.tina.request(
            G.print(formifiedQuery),
            {
              variables: event.value.variables,
            }
          )) as DataType
          return { data, blueprints, id: event.value.id }
        },
        onChangeCallback: (context) => (callback, _onReceive) => {
          if (context.cms) {
            context.cms.events.subscribe(`forms:fields:onChange`, () => {
              callback({ type: 'FIELD_CHANGE' })
            })
            context.cms.events.subscribe(`forms:reset`, () => {
              callback({ type: 'FIELD_CHANGE' })
            })
          }
        },
      },
    }
  )
class QueryError extends Error {
  public id: string
  constructor(message: string, id: string) {
    super(message) // (1)
    this.name = 'QueryError' // (2)
    this.id = id
  }
}
let count = 0

// https://github.com/oleics/node-is-scalar/blob/master/index.js
const withSymbol = typeof Symbol !== 'undefined'
function isScalar(value: unknown) {
  const type = typeof value
  if (type === 'string') return true
  if (type === 'number') return true
  if (type === 'boolean') return true
  if (withSymbol === true && type === 'symbol') return true

  if (value == null) return true
  if (withSymbol === true && value instanceof Symbol) return true
  if (value instanceof String) return true
  if (value instanceof Number) return true
  if (value instanceof Boolean) return true

  return false
}

const setData = (
  data: { [key: string]: unknown },
  blueprint: Blueprint2,
  context: ContextFrom<typeof queryMachine>
) => {
  if (data?._internalSys) {
    const id = data._internalSys?.path
    const doc = context.documentMap[id]
    const docContext = doc?.ref?.getSnapshot()?.context
    const form = docContext?.form
    if (!form) {
      throw new QueryError(`Unable to resolve form for initial document`, id)
    }
    const _internalSys = docContext.data?._internalSys
    if (!_internalSys) {
      throw new Error(`No system information found for document ${id}`)
    }

    const fields = form.fields
    const result = resolveForm({
      id,
      fields,
      sys: _internalSys,
      values: form.values,
      fieldsToInclude: blueprint.fields,
      context,
    })
    return { ...docContext.data, ...result }
  } else {
    // this isn't a node
  }
  return data
}

const resolveForm = ({
  id,
  fields,
  sys,
  values,
  fieldsToInclude,
  context,
}: {
  id: string
  fields: FieldType[]
  sys: Record<string, unknown>
  values: FormValues | undefined
  fieldsToInclude: Blueprint2['fields']
  context: ContextFrom<typeof queryMachine>
}) => {
  const accum: Record<string, unknown> = {}
  if (!values) {
    return accum
  }

  fieldsToInclude?.forEach((fieldToInclude) => {
    const field = fields.find((field) => fieldToInclude.name === field.name)
    if (!field) {
      if (fieldToInclude.name === 'id') {
        accum[fieldToInclude.alias] = id
      } else if (fieldToInclude.name === '_sys') {
        if (fieldToInclude.alias !== '_internalSys') {
          const sysAccum: Record<string, unknown> = {}
          // TODO: loop through these and actually use their alias values
          fieldToInclude.fields?.forEach((field) => {
            sysAccum[field.alias] = sys[field.name]
          })
          accum[fieldToInclude.alias] = sysAccum
        }
      } else if (fieldToInclude.name === '__typename') {
        // field namespaces are one level deeper than what we need, so grab the first
        // one and remove the last string on the namespace
        accum[fieldToInclude.alias] = NAMER.dataTypeName(
          fields[0].namespace.slice(0, fields[0].namespace.length - 1)
        )
      } else if (fieldToInclude.name === '_values') {
        if (fieldToInclude.alias !== '_internalValues') {
          accum[fieldToInclude.alias] = values
        }
      } else {
      }
    } else {
      const result = resolveField({
        id,
        field,
        sys,
        value: values[field.name],
        fieldsToInclude: fieldsToInclude.find(({ name }) => name === field.name)
          ?.fields,
        context,
      })
      if (result) {
        accum[fieldToInclude.alias] = result
      }
    }
  })

  return accum
}
const resolveField = ({
  id,
  field,
  sys,
  value,
  fieldsToInclude,
  context,
}: {
  id: string
  field: TinaFieldEnriched
  sys: Record<string, unknown>
  value: unknown
  fieldsToInclude: Blueprint2['fields']
  context: ContextFrom<typeof queryMachine>
}) => {
  switch (field.type) {
    case 'reference':
      if (!value) {
        return
      }
      if (typeof value === 'string') {
        const doc = context.documentMap[value]
        const docContext = doc?.ref?.getSnapshot()?.context
        const form = docContext?.form
        if (!form) {
          throw new QueryError(`Unable to resolve form for document`, value)
        }
        const _internalSys = docContext.data?._internalSys
        if (!_internalSys) {
          throw new Error(`No system information found for document ${id}`)
        }
        return resolveForm({
          id: value,
          fields: form.fields,
          sys: _internalSys,
          values: form.values,
          fieldsToInclude,
          context,
        })
      }
      throw new Error(`Unexpected value for type "reference"`)
    case 'object':
      if (field.fields) {
        if (typeof field.fields === 'string') {
          throw new Error('Global templates not supported')
        }
        field.fields
        if (field.list) {
          if (Array.isArray(value)) {
            return value.map((item) => {
              if (typeof field.fields === 'string') {
                throw new Error('Global templates not supported')
              }
              return resolveForm({
                id,
                fields: field.fields,
                sys,
                values: item,
                fieldsToInclude,
                context,
              })
            })
          }
        } else {
          return resolveForm({
            id,
            fields: field.fields,
            sys,
            values: value,
            fieldsToInclude,
            context,
          })
        }
      }
      if (field.templates) {
        if (field.list) {
          if (!value) {
            return
          }
          if (!Array.isArray(value)) {
            return
          }
          return value.map((item) => {
            let t: Template<true>
            Object.entries(field.templates).forEach(([name, template]) => {
              if (name === item._template) {
                if (typeof template === 'string') {
                  throw new Error('Global templates not supported')
                }
                t = template
              }
            })
            return {
              _template: item._template,
              ...resolveForm({
                id,
                fields: t.fields,
                sys,
                values: item,
                fieldsToInclude,
                context,
              }),
            }
          })
        } else {
          // not supported yet
        }
      }
    default:
      return value
  }
}
