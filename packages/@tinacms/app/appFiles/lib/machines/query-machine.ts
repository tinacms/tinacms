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
import { DocumentBlueprint } from '../formify/types'
import { Form, GlobalFormPlugin, TinaCMS, TinaField } from 'tinacms'
import { setIn } from 'final-form'
import * as G from 'graphql'
import * as util from './util'
import { formify } from '../formify'
import { spliceLocation } from '../formify/util'
import { documentMachine } from './document-machine'
import type { ActorRefFrom } from 'xstate'
import { NAMER } from '@tinacms/schema-tools'

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
  blueprints: DocumentBlueprint[]
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
export const queryMachine = createMachine(
  {
    tsTypes: {} as import('./query-machine.typegen').Typegen0,
    // Breaks stuff:
    // predictableActionArguments: true,
    schema: {
      context: {} as ContextType,
      services: {} as {
        initializer: {
          data: {
            data: DataType
            blueprints: DocumentBlueprint[]
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
    type: 'parallel',
    states: {
      url: {
        initial: 'idle',
        states: {
          idle: {
            on: {
              SET_URL: { actions: 'setUrl' },
              SET_INPUT_URL: { actions: 'setInputUrl' },
              SET_DISPLAY_URL: { actions: 'setDisplayUrl' },
              UPDATE_URL: { actions: 'updateUrl' },
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
              ADD_QUERY: 'initializing',
              SUBDOCUMENTS: 'pending',
              IFRAME_MOUNTED: {
                actions: 'setIframe',
              },
            },
          },
          initializing: {
            invoke: {
              src: 'initializer',
              onDone: {
                actions: ['storeInitialValues', 'scanForInitialDocuments'],
                target: 'pending',
              },
              onError: {
                target: 'error',
                actions: 'handleError',
              },
            },
          },
          waiting: {
            on: {
              DOCUMENT_READY: 'pending',
            },
          },
          pending: {
            invoke: {
              src: 'setter',
              onDone: 'ready',
              onError: {
                target: 'waiting',
                actions: 'handleMissingDocument',
              },
            },
          },
          ready: {
            entry: 'resolveData',
            invoke: {
              src: 'onChangeCallback',
            },
            on: {
              UPDATE_URL: 'idle',
              REMOVE_QUERY: 'idle',
              SELECT_DOCUMENT: {
                actions: 'selectDocument',
              },
              // TODO: for most _change_ events we could probably
              // optimize this and not go through the pending
              // process, but for now it keeps things simple and totally works
              // to just totally restart the process on each change
              FIELD_CHANGE: {
                target: 'pending',
                // actions: 'rescanForInitialDocuments',
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
          const doc = {
            ref: spawn(
              documentMachine.withContext({
                id: event.data.id,
                locations: [],
                cms: context.cms,
                formifyCallback: context.formifyCallback,
                form: null,
                data: null,
                subDocuments: [],
                allBlueprints: context.blueprints,
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
        Object.values(context.documentMap).forEach((doc) => {
          const form = doc.ref.getSnapshot()?.context?.form
          if (form) {
            context.cms.forms.remove(form.id)
          }
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
          Object.values(context.documentMap).forEach((doc) => {
            const form = doc.ref.getSnapshot()?.context?.form
            if (form) {
              context.cms.forms.remove(form.id)
            }
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
        }
      }),
      scanForInitialDocuments: assign((context, event) => {
        const blueprints = event.data.blueprints.filter(
          (blueprint) => blueprint.isTopLevel
        )
        const newDocuments: DocumentMap = {}
        blueprints.forEach((blueprint) => {
          const values = util.getAllIn(context.data, blueprint.id)

          values?.forEach((value) => {
            const location = spliceLocation(blueprint.id, value.location || [])
            const existing = context.documentMap[value.value.id]
            if (existing) {
              existing.ref.send({ type: 'ADD_LOCATION', value: location })
            } else {
              newDocuments[value.value.id] = {
                ref: spawn(
                  documentMachine.withContext({
                    id: value.value.id,
                    form: null,
                    cms: context.cms,
                    formifyCallback: context.formifyCallback,
                    data: null,
                    locations: [location],
                    subDocuments: [],
                    allBlueprints: context.blueprints,
                  })
                ),
              }
            }
          })
        })
        const nextDocumentMap = { ...context.documentMap, ...newDocuments }
        return {
          ...context,
          documentMap: nextDocumentMap,
        }
      }),
    },
    services: {
      setter: async (context) => {
        let newData = {}
        const initialBlueprints = context.blueprints.filter(
          (blueprint) => blueprint.isTopLevel
        )
        initialBlueprints.forEach((blueprint) => {
          const values = util.getAllInBlueprint(context.data, blueprint.id)

          values?.forEach((value) => {
            const location = spliceLocation(blueprint.id, value.location || [])
            if (!value.value) {
              return
            }
            const doc = context.documentMap[value.value._internalSys.path]
            const docContext = doc.ref.getSnapshot()?.context
            const form = docContext?.form
            if (!form) {
              throw new QueryError(
                `Unable to resolve form for initial document`,
                value.value._internalSys.path
              )
            }

            /**
             * This section can be removed when we support forms for list
             * and nested items.
             */
            if (blueprint.path.some((item) => item.list)) {
              // do nothing
            } else {
              if (form.global) {
                context.cms.plugins.add(
                  new GlobalFormPlugin(
                    form,
                    form.global?.icon,
                    form.global?.layout
                  )
                )
              } else {
                context.cms.forms.add(form)
              }
            }

            if (docContext.data) {
              const nextData: Record<string, unknown> = setData({
                id: docContext.id,
                data: { ...docContext.data, ...form.values },
                // @ts-ignore form.fields is Field
                fields: form.fields,
                namespace: [docContext.data._internalSys.collection.name],
                path: [],
                blueprint,
                context,
              })
              newData = setIn(newData, location, nextData)
            }
          })
        })
        return { data: newData }
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
        const data = await context.cms.api.tina.request<DataType>(
          G.print(formifiedQuery),
          {
            variables: event.value.variables,
          }
        )
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
function isScalar(value) {
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

const excludedValues = ['_internalValues', '_collection', '_template']
const excludedTinaFieldValues = [
  '_sys',
  '_internalSys',
  '_internalValues',
  '_values',
  '_collection',
  '_template',
]

const setData = ({
  id,
  data,
  path,
  fields,
  namespace,
  blueprint,
  context,
}: {
  id: string
  data: Record<string, unknown>
  path: (string | number)[]
  fields: TinaField[]
  namespace: string[]
  blueprint: DocumentBlueprint
  context: ContextFrom<typeof queryMachine>
}) => {
  const nextData: Record<string, unknown> = {}
  nextData['__typename'] = NAMER.dataTypeName(namespace)
  nextData['_tinaField'] = {
    id,
    keys: Object.keys(data)
      .filter((key) => !excludedTinaFieldValues.includes(key))
      .map((item) => [...path, item].join('.')),
  }
  Object.entries(data).forEach(([key, value]) => {
    const field = fields.find((field) => field.name === key)
    const nextPath = [...path, key]
    if (!value) {
      nextData[key] = null
    }
    // This is a property not controlled by the form, so it
    // cannot change. Eg. _sys
    if (!field) {
      if (!excludedValues.includes(key)) {
        nextData[key] = value
      }
      return
    }
    if (Array.isArray(value)) {
      if (field) {
        if (!field.list) {
          throw new Error(
            `Expected field for array value to be have property list: true`
          )
        } else {
          if (field.type === 'object') {
            if (field.templates) {
              nextData[key] = value.map((item, index) => {
                const template = Object.values(field.templates).find(
                  (template) => {
                    // @ts-ignore FIXME: template is transformed to an
                    // object that the `blocks` field plugin expects
                    return template.key === item._template
                  }
                )
                if (!template) {
                  throw new Error(
                    `Unable to find template for field ${field.name}`
                  )
                }
                return setData({
                  id,
                  data: item,
                  path: [...nextPath, index],
                  // @ts-ignore form.fields is Field
                  fields: template.fields,
                  namespace: template.namespace,
                  blueprint,
                  context,
                })
              })
            } else {
              if (typeof field?.fields === 'string') {
                throw new Error('Global templates not supported')
              }
              nextData[key] = value.map((item, index) =>
                setData({
                  id,
                  data: item,
                  path: [...nextPath, index],
                  // @ts-ignore form.fields is Field
                  fields: field.fields,
                  namespace: field.namespace,
                  blueprint,
                  context,
                })
              )
            }
          } else {
            nextData[key] = value
          }
        }
      } else {
        nextData[key] = value.map((item, index) =>
          isScalar(item)
            ? item
            : setData({
                id,
                data: item,
                path: [...nextPath, index],
                namespace: field.namespace,
                fields: [],
                blueprint,
                context,
              })
        )
      }
    } else {
      const fieldBlueprintPath = `${blueprint.id}.${nextPath
        .map((item) => (isNaN(Number(item)) ? item : '[]'))
        .join('.')}`

      const childBlueprint = context.blueprints.find(
        ({ id }) => id === fieldBlueprintPath
      )
      const blueprintField = blueprint.fields.find(
        ({ id }) => id === fieldBlueprintPath
      )
      // If the query isn't requesting this data, don't populate it
      if (!blueprintField && !childBlueprint) {
        return
      }
      if (isScalar(value)) {
        // This value is a reference (eg. "content/authors/pedro.md")
        if (childBlueprint) {
          if (typeof value === 'string') {
            if (!value) {
              nextData[key] = null
              return
            }
            const doc = context.documentMap[value]
            const docContext = doc?.ref?.getSnapshot()?.context
            const form = docContext?.form
            if (!form) {
              throw new QueryError(`Unable to resolve form for document`, value)
            }
            nextData[key] = {
              id: docContext.id,
              ...setData({
                id: docContext.id,
                data: { ...docContext.data, ...form.values },
                // @ts-ignore form.fields is Field
                fields: form.fields,
                namespace: [],
                path: [],
                blueprint: childBlueprint,
                context,
              }),
            }
          } else {
            // The reference value is null
            nextData[key] = null
          }
        } else {
          // This is a reference that's not formified.
          // That is - we don't generate form for it because the query didn't ask us to
          if (field && field.type === 'reference') {
            if (value) {
              nextData[key] = { id: value }
            } else {
              nextData[key] = null
            }
          } else {
            nextData[key] = value
          }
        }
      } else {
        // TODO: when rich-text is {json: {}, embeds: {}[]} we'll need to resolve the embeds
        if (field.type === 'rich-text') {
          nextData[key] = value
          return
        }
        if (field.type !== 'object') {
          throw new Error(
            `Expected field for object values to be of type "object", but got ${field.type}`
          )
        }
        if (field?.templates) {
          throw new Error(`Unexpected path ${field.name}`)
        } else {
          if (typeof field?.fields === 'string') {
            throw new Error('Global templates not supported')
          }
          const nextValue = value as Record<string, unknown>
          const nextDataResult = setData({
            id,
            data: nextValue,
            path: nextPath,
            namespace: field.namespace,
            fields: field.fields,
            blueprint,
            context,
          })
          // Don't populate an empty key {someValue: {}}
          if (Object.keys(nextDataResult).length > 0) {
            nextData[key] = nextDataResult
          } else {
            nextData[key] = null
          }
        }
      }
    }
  })
  return nextData
}
