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
    this.finalForm = createForm<S>(options)
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

      // @ts-ignore
      let subfields = field.fields
      if (subfields) {
        // This will work for groups. But not for group-lists or blocks.
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
  component: React.FC<any> | string
  parse?: (value: string, name: string) => any
  format?: (value: string, name: string) => any
}
