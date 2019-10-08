/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import { Subscribable } from '../subscribable'
import { Form, FormOptions } from './form'

export class FormManager extends Subscribable {
  private __forms: { [key: string]: Form } = {}

  createForm = <S>(options: FormOptions<S>): Form<S> => {
    const form = new Form<S>(options)
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
