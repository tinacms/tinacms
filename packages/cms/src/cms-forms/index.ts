import * as React from 'react'

export class FormManager {
  private __forms: any = {}
  private __fields: any = {}

  createForm(options: FormOptions) {
    this.__forms[options.name] = new Form(options)
  }

  addFieldPlugin(plugin: FieldPlugin) {
    this.__fields[plugin.name] = plugin
  }

  getFieldPlugin(name: string): FieldPlugin | null {
    return this.__fields[name]
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
  component: React.FC<any> | string
}

export interface FieldPlugin {
  name: string
  Component: React.FC<any>
}
