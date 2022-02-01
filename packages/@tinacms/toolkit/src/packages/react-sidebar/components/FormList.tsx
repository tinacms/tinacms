/**

Copyright 2021 Forestry.io Holdings, Inc.

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

import * as React from 'react'
import { Form } from '../../forms'
import { BiPencil } from 'react-icons/bi'

export interface FormsListProps {
  forms: Form[]
  setActiveFormId(id: string): void
  isEditing: Boolean
}

export const FormList = ({ forms, setActiveFormId }: FormsListProps) => {
  return (
    <ul className="pt-16">
      {forms.sort(byId).map((form, index) => (
        <li key={form.id} className={`relative px-6 py-2`}>
          <button
            onClick={() => setActiveFormId(form.id)}
            className="w-full h-full bg-transparent border-none text-lg text-gray-700 hover:text-blue-500 transition-all ease-out duration-150 flex items-center gap-2 p-1 m-0"
          >
            <BiPencil className="opacity-70 w-5 h-auto fill-current" />
            {form.label}
          </button>
          {index !== forms.length - 1 && (
            <hr className="absolute bottom-0 left-0 border-t border-gray-100 w-full" />
          )}
        </li>
      ))}
    </ul>
  )
}

const byId = (b: Form, a: Form) => {
  if (a.id < b.id) {
    return -1
  }
  if (a.id > b.id) {
    return 1
  }
  return 0
}
