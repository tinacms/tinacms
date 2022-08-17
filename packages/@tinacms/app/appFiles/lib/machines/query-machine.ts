import { assign, ContextFrom, createMachine, spawn } from 'xstate'
import { DocumentBlueprint, OnChangeEvent } from '../formify/types'
import { TinaCMS, LocalClient, TinaField } from 'tinacms'
import { setIn } from 'final-form'
import * as G from 'graphql'
import * as util from './util'
// @ts-expect-error
import config from 'TINA_IMPORT'
import { formify } from '../formify'
import { spliceLocation } from '../formify/util'
import { documentMachine } from './document-machine'
import type { ActorRefFrom } from 'xstate'
import { NAMER } from '@tinacms/schema-tools'

type TreeItem = any

export const client = new LocalClient({ schema: config.schema })
export const cms = new TinaCMS({
  apis: { tina: client },
  enabled: true,
  sidebar: {
    position: 'displace',
  },
})

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
  tree: TreeItem[]
  selectedDocument: string | null
  url: string
  iframe: null | HTMLIFrameElement
  documentMap: DocumentMap
  blueprints: DocumentBlueprint[]
  documentsToResolve: { id: string; location: string }[]
}
const initialContext: ContextType = {
  id: null,
  data: null,
  selectedDocument: null,
  tree: [],
  blueprints: [],
  url: '/',
  documentMap: {},
  iframe: null,
  documentsToResolve: [],
}
export const queryMachine = createMachine(
  {
    tsTypes: {} as import('./query-machine.typegen').Typegen0,
    context: initialContext,
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
          data: { data: DataType; tree: TreeItem[] }
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
            value: OnChangeEvent
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
      clear: assign((context) => ({
        ...initialContext,
        documentMap: context.documentMap,
        iframe: context.iframe,
        url: context.url,
      })),
      setUrl: assign((context, event) => {
        return {
          ...context,
          url: event.value,
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
          tree: event.data.tree,
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
      setter: async (context, event) => {
        let newData = {}
        const initialBlueprints = context.blueprints.filter(
          (blueprint) => blueprint.isTopLevel
        )
        const tree: TreeItem[] = []
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
            const treeChildren = []
            const nextData: Record<string, unknown> = setData({
              id: docContext.id,
              data: { ...docContext.data, ...form.values },
              // @ts-ignore form.fields is Field
              fields: form.fields,
              namespace: [docContext.data._internalSys.collection.name],
              treeChildren,
              path: [],
              blueprint,
              context,
            })
            tree.push({ id: docContext.id, path: '', children: treeChildren })
            newData = setIn(newData, location, nextData)
          })
        })
        return { data: newData, tree }
      },
      initializer: async (_context, event) => {
        const schema = await client?.getSchema()
        const documentNode = G.parse(event.value.query)
        const optimizedQuery = await client?.getOptimizedQuery(documentNode)
        if (!optimizedQuery) {
          throw new Error(`Unable to optimize query`)
        }
        const { blueprints, formifiedQuery } = await formify({
          schema,
          optimizedDocumentNode: optimizedQuery,
        })
        const data = await client.request<DataType>(G.print(formifiedQuery), {
          variables: event.value.variables,
        })
        return { data, blueprints, id: event.value.id }
      },
      onChangeCallback: () => (callback, _onReceive) => {
        if (cms) {
          cms.events.subscribe(
            `forms:fields:onChange`,
            (event: OnChangeEvent) => {
              callback({ type: 'FIELD_CHANGE', value: event })
            }
          )
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
  treeChildren,
  blueprint,
  context,
}: {
  id: string
  data: Record<string, unknown>
  path: (string | number)[]
  fields: TinaField[]
  namespace: string[]
  treeChildren: TreeItem[]
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
                  treeChildren,
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
                  treeChildren,
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
                treeChildren,
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
            const doc = context.documentMap[value]
            const docContext = doc?.ref?.getSnapshot()?.context
            const form = docContext?.form
            if (!form) {
              throw new QueryError(`Unable to resolve form for document`, value)
            }
            const nextTreeChildren = []
            nextData[key] = setData({
              id: docContext.id,
              data: { ...docContext.data, ...form.values },
              // @ts-ignore form.fields is Field
              fields: form.fields,
              treeChildren: nextTreeChildren,
              namespace: [],
              path: [],
              blueprint: childBlueprint,
              context,
            })
            treeChildren.push({
              id: docContext.id,
              path: '',
              children: nextTreeChildren,
            })
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
            treeChildren,
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
