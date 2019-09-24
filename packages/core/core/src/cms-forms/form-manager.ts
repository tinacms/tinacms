import { Subscribable } from '../subscribable'
import { Form, FormOptions } from './form'

export class FormManager extends Subscribable {
  private __forms: { [key: string]: Form } = {}

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
