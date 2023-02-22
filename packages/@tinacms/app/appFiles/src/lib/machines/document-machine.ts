/**

*/
import { Client, Field, Form, FormOptions, TinaCMS } from 'tinacms'
import { assign, createMachine, sendParent } from 'xstate'
import { resolveForm, Template, TinaFieldEnriched, TinaSchema } from 'tinacms'

export type FieldType = Field & TinaFieldEnriched
export type FormValues = Record<string, unknown>
export type FormType = Form<FormValues, FieldType>

export type DataType = Record<string, unknown>

export type Data = {
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
  form: null | FormType
  cms: TinaCMS
  formifyCallback: (args: any, cms: TinaCMS) => Form
}

export const documentMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgNwBdd0AbXALwKgGIIB7Qs-ANzYGswJNFjyFS5KrQZMEBXpnRUOAbQAMAXUSgADm1iVcHLSAAeiAEwAWSyUsA2VQE4AzAHYArABoQAT0QAORxJHEMdLd1d7d3NXWIBfOO9hHAJiLgMpRnwWMAAnXLZckm0aRQAzQtQhDBSxdMk6LKhZHjYFJXw1TSQQXX0O4zMEKxt7JzcvXwtVd2DQu2d-ZwBGVWX-dwTEkHw2CDhjZNE0iWpGpmM+gyMeoctzbz8EVaDLUNdAtfvIze2j1NIuTA6AgTx0emu+EGiEszlUtlcdncdnMkyey3WtlC-mWjmW7ncTlRCSSNWOpDyBVylwhA1uMLhCKRKLRFlxcxC4UiSJikRJIH+Yhp-UMUPpz38j0Q6y2cSAA */
  createMachine(
    {
      // tsTypes: {} as ,
      schema: {
        context: {} as ContextType,
        services: {} as {
          initializer: {
            data: {
              form: FormType | undefined
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
      id: '(machine)',
      initial: 'initializing',
      states: {
        initializing: {
          invoke: {
            src: 'initializer',
            onDone: [
              {
                actions: ['storeFormAndData', 'notifyParent'],
                target: 'ready',
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
          const tina = context.cms.api.tina as Client
          let node: Data
          if (context.data) {
            node = context.data
          } else {
            const response = await tina.request<{
              node: Data
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
              { variables: { id: context.id } }
            )
            node = response.node
          }
          const schema = context.cms.api.tina.schema as TinaSchema
          if (!schema) {
            throw new Error(`Schema must be provided`)
          }
          const collection = schema.getCollection(
            node._internalSys.collection.name
          )
          let template: Template
          if (collection.templates) {
            template = collection.templates.find((template) => {
              if (typeof template === 'string') {
                throw new Error(`Global templates not supported`)
              }
              return template.name === node._internalSys.template
            }) as Template
          } else {
            template = collection
          }
          if (!template) {
            throw new Error(
              `Unable to find template for node ${node._internalSys.path}`
            )
          }
          const resolvedForm = resolveForm({
            collection,
            basename: node._internalSys.filename,
            schema,
            template,
          })
          const onSubmit = async (payload: Record<string, unknown>) => {
            try {
              const mutationString = `#graphql
              mutation UpdateDocument($collection: String!, $relativePath: String!, $params: DocumentUpdateMutation!) {
                updateDocument(collection: $collection, relativePath: $relativePath, params: $params) {
                  __typename
                }
              }
            `

              await context.cms.api.tina.request(mutationString, {
                variables: {
                  collection: node._internalSys.collection.name,
                  relativePath: node._internalSys.relativePath,
                  params: schema.transformPayload(
                    node._internalSys.collection.name,
                    payload
                  ),
                },
              })
              context.cms.alerts.success('Document saved!')
            } catch (e) {
              context.cms.alerts.error(
                'There was a problem saving your document'
              )
              console.error(e)
            }
          }
          const formConfig = {
            id: context.id,
            label:
              node._internalSys.title || node._internalSys.collection.label,
            initialValues: node._internalValues,
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
          return { form, data: node }
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
  const createForm = (formConfig: FormOptions<any, any>) => {
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
): FormType | undefined => {
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
