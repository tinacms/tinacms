import arrayMutators from 'final-form-arrays'
import setFieldData from 'final-form-set-field-data'
import { FormApi, createForm, Config, FormState, FORM_ERROR } from 'final-form'
import type { FormSubscription } from 'final-form'
import type { Plugin } from '../core'
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
   * @alias id
   */
  get name() {
    return this.id
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
      const response = await this.onSubmit(values, form, cb)
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

  getFieldGroup({ form, fieldName, values, prefix }): {
    fields: Field[]
    activePath: string[]
  } {
    const previous = { activePath: prefix, fields: form.fields }
    if (!fieldName) {
      return previous
    }
    const [name, ...rest] = fieldName.split('.')
    const field = form.fields.find((field) => field.name === name)
    const value = values[name]
    // When a new form is selected, the fieldName may still
    // be from a previous render
    if (!field) {
      return { fields: form.fields, activePath: prefix }
    }
    if (field.type === 'object') {
      if (field.templates) {
        if (field.list) {
          const [index, ...rest2] = rest
          if (index) {
            const value2 = value[index]
            const template = field.templates[value2._template]
            if (rest2.length) {
              const result = this.getFieldGroup({
                form: template,
                fieldName: rest2.join('.'),
                values: value2,
                prefix: [...prefix, name, index],
              })
              if (result) {
                return result
              }
            }
            return {
              activePath: [...prefix, name, index],
              fields: template.fields.map((field) => {
                return {
                  ...field,
                  name: `${[...prefix, name, index].join('.')}.${field.name}`,
                }
              }),
            }
          } else {
            return previous
          }
        } else {
          return previous
        }
      }
      if (field.fields) {
        if (field.list) {
          const [index, ...rest2] = rest
          if (index) {
            const value2 = value[index]
            if (rest2.length) {
              const result = this.getFieldGroup({
                form: field,
                fieldName: rest2.join('.'),
                values: value2,
                prefix: [...prefix, name, index],
              })
              if (result) {
                return result
              }
            }
            return {
              activePath: [...prefix, name, index],
              fields: field.fields.map((field) => {
                return {
                  ...field,
                  name: `${[...prefix, name, index].join('.')}.${field.name}`,
                }
              }),
            }
          } else {
            return previous
          }
        } else {
          if (rest.length) {
            const result = this.getFieldGroup({
              form: field,
              fieldName: rest.join('.'),
              values: value,
              prefix: [...prefix, name],
            })
            if (result) {
              return result
            }
          }
          return {
            activePath: [...prefix, name],
            fields: field.fields.map((field) => {
              return {
                ...field,
                name: `${[...prefix, name].join('.')}.${field.name}`,
              }
            }),
          }
        }
      }
    } else {
      return previous
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
