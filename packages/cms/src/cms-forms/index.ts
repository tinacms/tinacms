import * as React from 'react'
import { Subscribable } from '../subscribable'
import { Form, FormOptions } from './form'

export class FormManager extends Subscribable {
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

export interface FieldPlugin {
  name: string
  Component: React.FC<any>
}
