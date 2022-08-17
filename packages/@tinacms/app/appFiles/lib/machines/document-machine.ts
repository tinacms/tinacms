import { Form } from 'tinacms'
import { assign, createMachine } from 'xstate'
import { resolveForm, Templateable } from '@tinacms/schema-tools'
import { sendParent } from 'xstate/lib/actions'
import * as util from './util'
import * as G from 'graphql'
import type { DocumentBlueprint } from '../formify/types'
import { SelectionNode } from 'graphql'
import { cms, client } from './query-machine'

// export const client = new LocalClient({ schema: tinaSchema })
// export const cms = new TinaCMS({ apis: { tina: client } })

export type DataType = Record<string, unknown>

type Data = {
  _internalValues: object
  _internalSys: {
    breadcrumbs: string[]
    basename: string
    filename: string
    path: string
    extension: string
    relativePath: string
    title?: string
    template: string
    collection: {
      name: string
      slug: string
      label: string
      path: string
      format: string
      matches?: string
      templates?: object
      fields?: object
      __typename: string
    }
  }
}

type ContextType = {
  id: string
  data: null | Data
  form: null | Form
  locations: string[]
  subDocuments: string[]
  allBlueprints: DocumentBlueprint[]
}

export const documentMachine = createMachine(
  {
    tsTypes: {} as import('./document-machine.typegen').Typegen0,
    schema: {
      context: {} as ContextType,
      services: {} as {
        initializer: {
          data: {
            form: Form
            data: Data
          }
        }
        scanner: {
          data: {
            data: object
          }
        }
      },
      events: {} as
        | {
            type: 'ADD_LOCATION'
            value: string
          }
        | {
            type: 'INIT'
          }
        | {
            type: 'SCAN'
          }
        | {
            type: 'RESCAN'
          },
    },
    initial: 'initializing',
    states: {
      initializing: {
        invoke: {
          src: 'initializer',
          onDone: {
            actions: ['storeFormAndData', 'notifyParent'],
            target: 'ready',
          },
          onError: {
            target: 'error',
            actions: 'handleError',
          },
        },
      },
      ready: {},
      error: {},
    },
  },
  {
    actions: {
      notifyParent: sendParent((context) => {
        return {
          type: 'DOCUMENT_READY',
          value: context.id,
        }
      }),
      handleError: (_context, event) => {
        console.error(event.data)
      },
      storeFormAndData: assign((context, event) => {
        cms.forms.add(event.data.form)
        return { ...context, form: event.data.form, data: event.data.data }
      }),
    },
    services: {
      initializer: async (context) => {
        const selections: SelectionNode[] = []
        context.locations.forEach((location) => {
          const blueprint = util.getBlueprintFromLocation(
            location,
            context.allBlueprints
          )
          // TODO: probably makes more sense to combine
          // the selections if possible so we don't get conflicting
          // return types
          selections.push(blueprint.selection)
        })
        const response = await client.request<{
          node: Data
        }>(
          `query GetNode($id: String!) {
        node(id: $id) {
          ${selections.map((selection) => G.print(selection)).join('\n')}
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
          { variables: { id: context.id } }
        )
        const schema = client.schema
        if (!schema) {
          throw new Error(`Schema must be provided`)
        }
        const collection = schema.getCollection(
          response.node._internalSys.collection.name
        )
        let template: Templateable
        if (collection.templates) {
          template = collection.templates.find((template) => {
            if (typeof template === 'string') {
              throw new Error(`Global templates not supported`)
            }
            return template.name === response.node._internalSys.template
          }) as Templateable
        } else {
          template = collection
        }
        if (!template) {
          throw new Error(
            `Unable to find template for node ${response.node._internalSys.path}`
          )
        }
        const resolvedForm = resolveForm({
          collection,
          basename: response.node._internalSys.filename,
          schema,
          template,
        })
        const form = new Form({
          id: context.id,
          label:
            response.node._internalSys.title ||
            response.node._internalSys.filename,
          initialValues: response.node._internalValues,
          fields: resolvedForm.fields,
          onSubmit: async (payload) => {
            try {
              const mutationString = `#graphql
                mutation UpdateDocument($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
                  updateDocument(collection: $collection, relativePath: $relativePath, params: $params) {
                    __typename
                  }
                }
              `

              await cms.api.tina.request(mutationString, {
                variables: {
                  collection: response.node._internalSys.collection.name,
                  relativePath: response.node._internalSys.relativePath,
                  params: schema.transformPayload(
                    response.node._internalSys.collection.name,
                    payload
                  ),
                },
              })
              cms.alerts.success('Document saved!')
            } catch (e) {
              cms.alerts.error('There was a problem saving your document')
              console.error(e)
            }
          },
        })
        return { form, data: response.node }
      },
    },
  }
)
