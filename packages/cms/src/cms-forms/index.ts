import * as React from 'react'
import { createForm, FormApi, Config } from 'final-form'

export class Subscribeable {
  protected __subscribers: Function[] = []

  subscribe(listener: Function) {
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

  createForm = <S>(options: FormOptions<S>): Form<S> => {
    let form = new Form<S>(options)
    this.__forms[options.name] = form
    this.notifiySubscribers()
    return form
  }

  findForm(name: string): Form | null {
    return this.__forms[name]
  }

  removeForm = (name: string) => {
    delete this.__forms[name]
    this.notifiySubscribers()
  }

  all() {
    return Object.keys(this.__forms).map(name => this.__forms[name])
  }

  addFieldPlugin(plugin: FieldPlugin) {
    this.__fields[plugin.name] = plugin
    this.notifiySubscribers()
  }

  getFieldPlugin(name: string): FieldPlugin | null {
    return this.__fields[name]
  }
}

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
  component: React.FC<any> | string
}

export interface FieldPlugin {
  name: string
  Component: React.FC<any>
}
