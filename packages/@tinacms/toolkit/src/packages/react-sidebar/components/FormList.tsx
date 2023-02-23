/**



*/

import * as React from 'react'
import { Form } from '../../forms'
import { BiPencil } from 'react-icons/bi'
import { Transition } from '@headlessui/react'

export interface FormsListProps {
  forms: Form[]
  setActiveFormId(id: string): void
  isEditing: Boolean
  hidden?: boolean
}

export const FormList = ({
  hidden = false,
  forms,
  setActiveFormId,
}: FormsListProps) => {
  return (
    <Transition
      appear={true}
      show={!hidden}
      enter="transition-all ease-out duration-150"
      enterFrom="opacity-0 -translate-x-1/2"
      enterTo="opacity-100"
      leave="transition-all ease-out duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0 -translate-x-1/2"
    >
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
    </Transition>
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
