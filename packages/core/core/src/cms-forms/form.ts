import { FormApi, createForm, Config } from 'final-form'

export class Form<S = any> {
  name: string
  fields: Field[]
  finalForm: FormApi<S>
  actions: any[]

  constructor({ name, fields, actions, ...options }: FormOptions<S>) {
    this.name = name
    this.fields = fields
    this.finalForm = createForm<S>(options)
    this.actions = actions || []
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
  name: string
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
