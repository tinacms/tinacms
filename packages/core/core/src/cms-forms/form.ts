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

  constructor({ id, label, fields, actions, ...options }: FormOptions<S>) {
    this.id = id
    this.label = label
    this.fields = fields
    this.finalForm = createForm<S>({
      ...options,
      mutators: {
        ...arrayMutators,
        ...options.mutators,
      },
    })
    /**
     * We register fields at creation time so we don't have to relay
     * on `react-final-form` components being rendered.
     */
    this.registerFields(this.fields)
    this.actions = actions || []
  }

  private registerFields(fields: Field[], pathPrefix?: string) {
    fields.forEach(field => {
      let path = pathPrefix ? `${pathPrefix}.${field.name}` : field.name

      let isGroup = ['group'].includes(field.component as string)
      let isArray = ['group-list'].includes(field.component as string)
      if (isArray) {
        let subfields = field.fields || []
        this.registerFields(subfields, `${path}.INDEX`)
      } else if (isGroup) {
        let subfields = field.fields || []
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
