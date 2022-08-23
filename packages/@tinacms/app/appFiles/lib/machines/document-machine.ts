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
import { Client, Form, FormOptions, TinaCMS } from 'tinacms'
import { GlobalFormPlugin } from 'tinacms'
import { assign, createMachine } from 'xstate'
import { resolveForm, Templateable } from '@tinacms/schema-tools'
import { sendParent } from 'xstate/lib/actions'
import * as util from './util'
import * as G from 'graphql'
import type { DocumentBlueprint } from '../formify/types'
import { SelectionNode } from 'graphql'

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
  cms: TinaCMS
  formifyCallback: (args: any) => Form
  locations: string[]
  subDocuments: string[]
  allBlueprints: DocumentBlueprint[]
}

export const documentMachine = createMachine(
  {
    tsTypes: {} as import('./document-machine.typegen').Typegen0,
    // predictableActionArguments: true,
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
        // context.cms.forms.add(event.data.form)
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
        const tina = context.cms.api.tina as Client
        const response = await tina.request<{
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
        const schema = context.cms.api.tina.schema
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
        const onSubmit = async (payload) => {
          try {
            const mutationString = `#graphql
              mutation UpdateDocument($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
                updateDocument(collection: $collection, relativePath: $relativePath, params: $params) {
                  __typename
                }
              }
            `

            await context.cms.api.tina.request(mutationString, {
              variables: {
                collection: response.node._internalSys.collection.name,
                relativePath: response.node._internalSys.relativePath,
                params: schema.transformPayload(
                  response.node._internalSys.collection.name,
                  payload
                ),
              },
            })
            context.cms.alerts.success('Document saved!')
          } catch (e) {
            context.cms.alerts.error('There was a problem saving your document')
            console.error(e)
          }
        }
        const formConfig = {
          id: context.id,
          label:
            response.node._internalSys.title ||
            response.node._internalSys.collection.label,
          initialValues: response.node._internalValues,
          fields: resolvedForm.fields,
          onSubmit,
        }
        const formifyCallback = context.formifyCallback
        const form = buildForm(
          formConfig,
          context.cms,
          (args) => {
            if (formifyCallback) {
              return formifyCallback(args, context.cms)
            } else {
              return args.createForm(args.formConfig)
            }
          },
          true,
          onSubmit
        )
        return { form, data: response.node }
      },
    },
  }
)

type FormCreator = (formConfig: FormOptions<any>) => Form
interface GlobalFormOptions {
  icon?: any
  layout: 'fullscreen' | 'popup'
}
type GlobalFormCreator = (
  formConfig: FormOptions<any>,
  options?: GlobalFormOptions
) => Form
interface GlobalFormOptions {
  icon?: any
  layout: 'fullscreen' | 'popup'
}
export interface FormifyArgs {
  formConfig: FormOptions<any>
  createForm: FormCreator
  createGlobalForm: FormCreator
  skip?: () => void
}

export type formifyCallback = (args: FormifyArgs, cms: TinaCMS) => Form | void
export type onSubmitArgs = {
  /**
   * @deprecated queryString is actually a mutation string, use `mutationString` instead
   */
  queryString: string
  mutationString: string
  variables: object
}

export const generateFormCreators = (cms: TinaCMS, showInSidebar?: boolean) => {
  const createForm = (formConfig) => {
    return new Form(formConfig)
  }
  const createGlobalForm: GlobalFormCreator = (
    formConfig,
    options?: { icon?: any; layout: 'fullscreen' | 'popup' }
  ) => {
    const form = new Form({
      ...formConfig,
      global: { global: true, ...options },
    })
    return form
  }
  return { createForm, createGlobalForm }
}

export const buildForm = (
  formConfig: any,
  cms: TinaCMS,
  formify: formifyCallback,
  showInSidebar: boolean = false,
  onSubmit?: (args: any) => void
): Form | undefined => {
  const { createForm, createGlobalForm } = generateFormCreators(
    cms,
    showInSidebar
  )
  const SKIPPED = 'SKIPPED'
  let form
  let skipped
  const skip = () => {
    skipped = SKIPPED
  }
  if (skipped) return

  if (formify) {
    form = formify(
      {
        formConfig,
        createForm,
        createGlobalForm,
        skip,
      },
      cms
    )
  } else {
    form = createForm(formConfig)
  }

  if (!(form instanceof Form)) {
    if (skipped === SKIPPED) {
      return
    }
    throw new Error('formify must return a form or skip()')
  }

  return form
}
