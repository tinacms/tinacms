export class FormManager {
  private __forms: any = {}
  createForm(options: FormOptions) {
    this.__forms[options.name] = new Form(options)
  }
}

export class Form {
  name: string
  initialValues: string
  fields: Field[]
  onSubmit: () => Promise<object | null> | object | null

  constructor(options: FormOptions) {
    this.name = options.name
    this.initialValues = options.initialValues
    this.fields = options.fields
    this.onSubmit = options.onSubmit
  }
}

export interface FormOptions {
  name: string
  initialValues: string
  fields: Field[]
  onSubmit(): Promise<object | null> | object | null
}

export interface Field {
  name: string
  component: any
}
