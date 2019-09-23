import * as React from 'react'
import { Subscribable } from '../subscribable'
import { Form, Field, FormOptions } from './form'

export class FormManager extends Subscribable {
  private __forms: { [key: string]: Form } = {}
  private __fields: any = {}

  createForm = <S>(options: FormOptions<S>): Form<S> => {
    let form = new Form<S>(options)
    this.__forms[options.id] = form
    this.notifiySubscribers()
    return form
  }

  findForm(id: string): Form | null {
    return this.__forms[id]
  }

  removeForm = (id: string) => {
    delete this.__forms[id]
    this.notifiySubscribers()
  }

  all() {
    return Object.keys(this.__forms).map(id => this.__forms[id])
  }
}

// TODO: Move out of here.
export interface FieldPlugin {
  __type: 'field'
  name: string
  Component: React.FC<any>
  type?: string
  validate?(
    value: any,
    allValues: any,
    meta: any,
    field: Field
  ): string | object | undefined
  parse?: (value: string, name: string) => any
}
