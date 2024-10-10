import arrayMutators from 'final-form-arrays'
import setFieldData from 'final-form-set-field-data'
import {
  FormApi,
  createForm,
  Config,
  FormState,
  FORM_ERROR,
  getIn,
} from 'final-form'
import type { FormSubscription } from 'final-form'
import type { Plugin } from '@toolkit/core'
import { Field, AnyField } from './field'

export type { FormApi }

type GlobalOptions = {
  global: true
  icon?: any
  layout?: 'fullscreen' | 'popup'
}

export interface FormOptions<S, F extends Field = AnyField> extends Config<S> {
  id: any
  label: string
  fields?: F[]
  __type?: string
  reset?(): void
  actions?: any[]
  global?: GlobalOptions
  buttons?: {
    save: string
    reset: string
  }
  loadInitialValues?: () => Promise<S>
  onChange?(values: FormState<S>): void
  extraSubscribeValues?: FormSubscription
  queries?: string[]
  crudType?: 'create' | 'update'
  relativePath?: string
}

export class Form<S = any, F extends Field = AnyField> implements Plugin {
  private _reset?(): void

  __type: string
  id: any
  label: string
  fields: F[]
  finalForm: FormApi<S>
  actions: any[]
  buttons: {
    save: string
    reset: string
  }
  queries: string[]
  global: GlobalOptions | null = null
  loading: boolean = false
  relativePath: string
  crudType?: 'create' | 'update'
  beforeSubmit?: (values: S) => Promise<void | S>

  constructor({
    id,
    label,
    fields,
    actions,
    buttons,
    global,
    reset,
    loadInitialValues,
    onChange,
    queries,
    ...options
  }: FormOptions<S, F>) {
    const initialValues = options.initialValues || ({} as S)
    this.__type = options.__type || 'form'
    this.id = id
    this.label = label
    this.global = global
    this.fields = fields || []
    this.onSubmit = options.onSubmit
    this.queries = queries || []
    this.crudType = options.crudType || 'update'
    this.relativePath = options.relativePath || id
    this.finalForm = createForm<S>({
      ...options,
      initialValues,
      onSubmit: this.handleSubmit,
      mutators: {
        ...arrayMutators,
        setFieldData,
        ...options.mutators,
      },
    })

    this._reset = reset
    this.actions = actions || []
    this.buttons = buttons || {
      save: 'Save',
      reset: 'Reset',
    }
    this.updateFields(this.fields)

    if (loadInitialValues) {
      this.loading = true
      loadInitialValues()
        .then((initialValues) => {
          this.updateInitialValues(initialValues)
        })
        .finally(() => {
          this.loading = false
        })
    }

    if (onChange) {
      let firstUpdate = true
      this.subscribe(
        (formState) => {
          if (firstUpdate) {
            firstUpdate = false
          } else {
            onChange(formState)
          }
        },
        { values: true, ...(options?.extraSubscribeValues || {}) }
      )
    }
  }

  /**
   * A unique identifier for Forms.
   *
   * @deprecated use id instead
   */
  get name() {
    return undefined
  }

  /**
   * Returns the current values of the form.
   *
   * if the form is still loading it returns `undefined`.
   */
  get values(): S | undefined {
    if (this.loading) {
      return undefined
    }
    // @ts-ignore
    return this.finalForm.getState().values || this.initialValues
  }

  /**
   * The values the form was initialized with.
   */
  get initialValues() {
    return this.finalForm.getState().initialValues
  }

  get pristine() {
    return this.finalForm.getState().pristine
  }

  get dirty() {
    return this.finalForm.getState().dirty
  }

  get submitting() {
    return this.finalForm.getState().submitting
  }

  get valid() {
    return this.finalForm.getState().valid
  }

  /**
   * Resets the values back to the initial values the form was initialized with.
   * Or empties all the values if the form was not initialized.
   */
  async reset() {
    if (this._reset) {
      await this._reset()
    }
    this.finalForm.reset()
  }

  /**
   * @deprecated Unnecessary indirection
   */
  updateFields(fields: F[]) {
    this.fields = fields
  }

  /**
   * Subscribes to changes to the form. The subscriber will only be called when
   * values specified in subscription change. A form can have many subscribers.
   */
  subscribe: FormApi<S>['subscribe'] = (cb, options) => {
    return this.finalForm.subscribe(cb, options)
  }

  onSubmit: Config<S>['onSubmit']

  private handleSubmit: Config<S>['onSubmit'] = async (values, form, cb) => {
    try {
      const valOverride = await this.beforeSubmit?.(values)

      // Update the values on the frontend to reflect the changes made in the beforeSubmit hook
      if (valOverride) {
        for (const [key, value] of Object.entries(valOverride)) {
          form.change(key as keyof S, value)
        }
      }

      const response = await this.onSubmit(valOverride || values, form, cb)
      form.initialize(values)
      return response
    } catch (error) {
      return { [FORM_ERROR]: error }
    }
  }

  /**
   * Submits the form if there are currently no validation errors. It may
   * return undefined or a Promise depending on the nature of the onSubmit
   * configuration value given to the form when it was created.
   */
  submit: FormApi<S>['submit'] = () => {
    return this.finalForm.submit()
  }

  /**
   * Changes the value of the given field.
   *
   * @param name
   * @param value
   */
  change(name: keyof S, value?: any) {
    return this.finalForm.change(name, value)
  }

  get mutators() {
    return this.finalForm.mutators
  }

  addQuery(queryId: string) {
    this.queries = [...this.queries.filter((id) => id !== queryId), queryId]
  }
  removeQuery(queryId: string) {
    this.queries = this.queries.filter((id) => id !== queryId)
  }

  /**
   * Updates multiple fields in the form.
   *
   * The updates are batched so that it only triggers one `onChange` event.
   *
   * In order to prevent disruptions to the user's editing experience this
   * function will _not_ update the value of any field that is currently
   * being edited.
   *
   * @param values
   */
  updateValues(values: S) {
    this.finalForm.batch(() => {
      const activePath = this.finalForm.getState().active

      if (!activePath) {
        updateEverything<S>(this.finalForm, values)
      } else {
        updateSelectively<S>(this.finalForm, values)
      }
    })
  }

  /**
   * Replaces the initialValues of the form without deleting the current values.
   *
   * This function is helpful when the initialValues are loaded asynchronously.
   *
   * @param initialValues
   */
  updateInitialValues(initialValues: S) {
    this.finalForm.batch(() => {
      const values = this.values || ({} as S)
      this.finalForm.initialize(initialValues)
      const activePath = this.finalForm.getState().active

      if (!activePath) {
        updateEverything<S>(this.finalForm, values)
      } else {
        updateSelectively<S>(this.finalForm, values)
      }
    })
  }

  /**
   * Based on field's name this function will
   * return an array of fields for the give form along
   * with the path that it was found at top nearest
   * object-like group
   *
   * So if you have a field named blocks.3.title
   * It will return the fields from the 3rd "block"
   * along with the path it was found at
   * fields: [{type: 'string', name: 'title'}, ... other fields]
   * activePath: ['blocks', '3']
   */
  getActiveField(fieldName: string | null): {
    label?: string
    name?: string
    fields: Field[]
  } {
    if (!fieldName) {
      return this
    }
    const result = this.getFieldGroup({
      formOrObjectField: this,
      values: this.finalForm.getState().values,
      namePathIndex: 0,
      namePath: fieldName.split('.'),
    })
    return result
  }
  private getFieldGroup({
    formOrObjectField,
    values = {},
    namePathIndex,
    namePath,
  }: {
    formOrObjectField: any // Awkwardness due to differences in TinaField and Field types
    values: FormState<any, any>['values']
    namePathIndex: number
    namePath: string[]
  }) {
    const name = namePath[namePathIndex]
    const field = formOrObjectField.fields.find((field) => field.name === name)
    const value = values[name]
    const isLastItem = namePathIndex === namePath.length - 1
    if (!field) {
      return {
        ...formOrObjectField,
        fields: formOrObjectField.fields.map((field) => {
          return {
            ...field,
            name: [...namePath, field.name].join('.'),
          }
        }),
      }
    } else {
      if (field.type === 'object') {
        if (field.templates) {
          if (field.list) {
            if (isLastItem) {
              return formOrObjectField
            } else {
              const namePathIndexForListItem = namePathIndex + 1
              const index = namePath[namePathIndexForListItem]
              const listItemValue = value[index]
              const template = field.templates[listItemValue._template]
              const templateName = [
                ...namePath.slice(0, namePathIndexForListItem),
                index,
              ].join('.')
              const isLastItem =
                namePathIndexForListItem === namePath.length - 1
              if (!isLastItem) {
                return this.getFieldGroup({
                  formOrObjectField: template,
                  values: listItemValue,
                  namePath,
                  namePathIndex: namePathIndex + 2,
                })
              }
              if (!template) {
                console.error({ field, value })
                throw new Error(
                  `Expected template value for field ${field.name}`
                )
              }
              return {
                ...template,
                name: templateName,
                fields: template.fields.map((field) => {
                  return {
                    ...field,
                    name: [templateName, field.name].join('.'),
                  }
                }),
              }
            }
          } else {
            // TODO
          }
        } else {
          if (field.list) {
            const namePathIndexForListItem = namePathIndex + 1
            const index = namePath[namePathIndexForListItem]
            const listItemValue = value[index]
            const fieldName = [
              ...namePath.slice(0, namePathIndexForListItem),
              index,
            ].join('.')
            const isLastItem = namePathIndexForListItem === namePath.length - 1
            if (!isLastItem) {
              if (field.fields) {
                return this.getFieldGroup({
                  formOrObjectField: field,
                  values: listItemValue,
                  namePath,
                  namePathIndex: namePathIndex + 2,
                })
              }
            }
            return {
              ...field,
              name: fieldName,
              fields: field.fields.map((field) => {
                return {
                  ...field,
                  name: [fieldName, field.name].join('.'),
                }
              }),
            }
          } else {
            const fieldName = [...namePath.slice(0, namePathIndex + 1)].join(
              '.'
            )
            const isLastItem = namePathIndex === namePath.length - 1
            if (!isLastItem) {
              return this.getFieldGroup({
                formOrObjectField: field,
                values: value,
                namePath,
                namePathIndex: namePathIndex + 1,
              })
            }
            return {
              ...field,
              name: fieldName,
              fields: field.fields.map((field) => {
                return {
                  ...field,
                  name: [fieldName, field.name].join('.'),
                }
              }),
            }
          }
        }
      } else if (field.type === 'rich-text') {
        if (isLastItem) {
          return {
            ...formOrObjectField,
            fields: formOrObjectField.fields.map((field) => {
              return {
                ...field,
                name: [...namePath.slice(0, namePathIndex), field.name].join(
                  '.'
                ),
              }
            }),
          }
        } else {
          const childrenIndex = namePath.findIndex(
            (value) => value === 'children'
          )
          // Find the props for the next item, ignoring parent 'props'
          const propsIndex =
            namePath
              .slice(childrenIndex)
              .findIndex((value) => value === 'props') + childrenIndex
          const itemName = namePath.slice(childrenIndex, propsIndex).join('.')
          const item = getIn(value, itemName)
          const props = item.props
          const templateString = item.name
          const currentPathIndex = namePathIndex + Math.max(propsIndex, 3)
          const isLastItem = currentPathIndex + 1 === namePath.length
          const template = field.templates.find(
            (t) => t.name === templateString
          )
          const templateName = namePath.slice(0, currentPathIndex + 2).join('.')
          if (item?.type === 'img') {
            const imageName = namePath.slice(0, currentPathIndex + 2).join('.')
            return {
              ...formOrObjectField,
              // name: [formOrObjectField.name, 'img'].join('.'),
              name: [imageName].join('.'),
              fields: [
                {
                  type: 'image',
                  // label: 'URL',
                  name: [templateName, 'url'].join('.'),
                  component: 'image',
                },
                {
                  type: 'string',
                  label: 'Alt',
                  name: [templateName.replace(/\.props$/, ''), 'alt'].join('.'),
                  component: 'text',
                },
                {
                  type: 'string',
                  label: 'Caption',
                  name: [templateName.replace(/\.props$/, ''), 'caption'].join(
                    '.'
                  ),
                  component: 'text',
                },
              ],
            }
          }
          if (!isLastItem) {
            // The `propsIndex` is set to 0 when the namePath does NOT include 'props'
            // e.g. when navigating from a rich-text template back to the parent field
            if (currentPathIndex === namePath.length || propsIndex === 0) {
              return {
                ...formOrObjectField,
                name: namePath.slice(0, namePathIndex).join('.'),
                fields: formOrObjectField.fields.map((field) => {
                  return {
                    ...field,
                    name: [
                      ...namePath.slice(0, namePathIndex),
                      field.name,
                    ].join('.'),
                  }
                }),
              }
            }

            return this.getFieldGroup({
              formOrObjectField: template,
              values: props,
              namePath,
              namePathIndex:
                namePathIndex + Math.max(4, childrenIndex + propsIndex),
            })
          }
          if (!template) {
            throw new Error(`Expected template value for field ${item.name}`)
          }
          return {
            ...template,
            name: templateName,
            fields: template.fields.map((field) => {
              return {
                ...field,
                name: [templateName, field.name].join('.'),
              }
            }),
          }
        }
      } else {
        const fieldName = [...namePath.slice(0, namePathIndex)].join('.')
        if (!fieldName) {
          return formOrObjectField
        }
        return {
          ...formOrObjectField,
          name: fieldName,
          fields: formOrObjectField.fields.map((field) => {
            return {
              ...field,
              name: [fieldName, field.name].join('.'),
            }
          }),
        }
      }
    }
  }
}

function updateEverything<S>(form: FormApi<any>, values: S) {
  Object.entries(values).forEach(([path, value]) => {
    form.change(path, value)
  })
}

function updateSelectively<S>(form: FormApi<any>, values: S, prefix?: string) {
  const activePath = form.getState().active!

  Object.entries(values).forEach(([name, value]) => {
    const path = prefix ? `${prefix}.${name}` : name

    if (typeof value === 'object') {
      if (typeof activePath === 'string' && activePath.startsWith(path)) {
        updateSelectively(form, value, path)
      } else {
        form.change(path, value)
      }
    } else if (path !== activePath) {
      form.change(path, value)
    }
  })
}
