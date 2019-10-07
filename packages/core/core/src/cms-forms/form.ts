import arrayMutators from 'final-form-arrays'
import { FormApi, createForm, Config, Unsubscribe } from 'final-form'

interface FieldSubscription {
  path: string
  field: Field
  unsubscribe: Unsubscribe
}

export class Form<S = any> {
  id: any
  label: string
  fields: Field[]
  finalForm: FormApi<S>
  actions: any[]
  fieldSubscriptions: { [key: string]: FieldSubscription } = {}
  hiddenFields: { [key: string]: FieldSubscription } = {}
  initialValues: any

  constructor({ id, label, fields, actions, ...options }: FormOptions<S>) {
    const initialValues = options.initialValues || ({} as S)
    this.id = id
    this.label = label
    this.fields = fields
    this.finalForm = createForm<S>({
      ...options,
      initialValues,
      async onSubmit(values, form, cb) {
        const response = await options.onSubmit(values, form, cb)
        form.initialize(values)
        return response
      },
      mutators: {
        ...arrayMutators,
        ...options.mutators,
      },
    })

    this.actions = actions || []
    this.initialValues = initialValues
    this.updateFields(this.fields)
  }

  updateFields(fields: Field[]) {
    this.fields = fields
    /**
     * We register fields at creation time so we don't have to relay
     * on `react-final-form` components being rendered.
     */
    this.registerFields(this.fields)
    this.discoverHiddenFields(this.initialValues)
    this.removeDeclaredFieldsFromHiddenLookup()
  }

  private discoverHiddenFields(values: any, prefix?: string) {
    Object.entries(values).map(([name, value]) => {
      const path = prefix ? `${prefix}.${name}` : name

      if (Array.isArray(value)) {
        if (value.find(item => typeof item === 'object')) {
          const prefix = `${path}.INDEX`
          value.forEach(item => {
            this.discoverHiddenFields(item, prefix)
          })
        } else {
          this.hiddenFields[path] = {
            path,
            field: { name: path, component: null },
            unsubscribe: this.finalForm.registerField(path, () => {}, {}),
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        this.discoverHiddenFields(value, path)
      } else {
        // Base Case
        this.hiddenFields[path] = {
          path,
          field: { name: path, component: null },
          unsubscribe: this.finalForm.registerField(path, () => {}, {}),
        }
      }
    })
  }

  private removeDeclaredFieldsFromHiddenLookup() {
    Object.keys(this.fieldSubscriptions).forEach(path => {
      const hiddenField = this.hiddenFields[path]
      if (hiddenField) {
        hiddenField.unsubscribe()
        delete this.hiddenFields[path]
      }
    })
  }

  private registerFields(fields: Field[], pathPrefix?: string) {
    fields.forEach(field => {
      const path = pathPrefix ? `${pathPrefix}.${field.name}` : field.name

      const isGroup = ['group'].includes(field.component as string)
      const isArray = ['group-list', 'blocks'].includes(field.component as string)
      if (isArray) {
        const subfields = field.fields || []
        this.registerFields(subfields, `${path}.INDEX`)
      } else if (isGroup) {
        const subfields = field.fields || []
        this.registerFields(subfields, path)
      } else {
        this.fieldSubscriptions[path] = {
          path,
          field,
          unsubscribe: this.finalForm.registerField(path, () => {}, {}),
        }
      }
    })
  }

  subscribe: FormApi<S>['subscribe'] = (cb, options) => {
    return this.finalForm.subscribe(cb, options)
  }

  submit: FormApi<S>['submit'] = () => {
    return this.finalForm.submit()
  }

  get values() {
    return this.finalForm.getState().values
  }
}

export interface FormOptions<S> extends Config<S> {
  id: any
  label: string
  fields: Field[]
  actions?: any[]
}

export interface Field {
  name: string
  label?: string
  description?: string
  component: React.FC<any> | string | null
  parse?: (value: string, name: string) => any
  format?: (value: string, name: string) => any
  defaultValue?: any
  fields?: Field[]
}
