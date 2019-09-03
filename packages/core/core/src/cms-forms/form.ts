import { FormApi, createForm, Config } from 'final-form'

export class Form<S = any> {
  name: string
  fields: Field[]
  finalForm: FormApi<S>

  constructor({ name, fields, ...options }: FormOptions<S>) {
    this.name = name
    this.fields = fields
    this.finalForm = createForm<S>(options)
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
}

export interface Field {
  name: string
  label?: string
  component: React.FC<any> | string
}
