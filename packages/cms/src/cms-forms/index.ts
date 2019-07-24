import * as React from 'react'

class Subscribeable {
  protected __subscribers: Function[] = []

  subscribe(listener: Function) {
    console.log(this.__subscribers)
    this.__subscribers.push(listener)
  }

  unsubscribe(listener: Function) {
    let index = this.__subscribers.indexOf(listener)
    this.__subscribers.splice(index)
  }

  protected notifiySubscribers() {
    this.__subscribers.forEach(cb => cb())
  }
}

export class FormManager extends Subscribeable {
  private __forms: { [key: string]: Form } = {}
  private __fields: any = {}

  createForm(options: FormOptions) {
    this.__forms[options.name] = new Form(options)
    this.notifiySubscribers()
  }

  findForm(name: string): Form | null {
    return this.__forms[name]
  }

  addFieldPlugin(plugin: FieldPlugin) {
    this.__fields[plugin.name] = plugin
    this.notifiySubscribers()
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
