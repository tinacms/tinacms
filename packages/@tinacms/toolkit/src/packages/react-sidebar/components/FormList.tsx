import * as React from 'react'
import { Form } from '../../forms'
import { BiChevronRight } from 'react-icons/bi'
import { Transition } from '@headlessui/react'
import { useCMS } from '../../../react-tinacms'
import { FormListItem, useFormList } from '../../../components/FormListProvider'

const Item = ({
  item,
  depth,
  setActiveFormId,
}: {
  item: Extract<FormListItem, { type: 'document' }>
  depth: number
  setActiveFormId: (id: string) => void
}) => {
  const depths = ['pl-6', 'pl-10', 'pl-14']
  return (
    <button
      onClick={() => setActiveFormId(item.form.id)}
      className={`${
        depths[depth] || 'pl-12'
      } pr-6 py-2 w-full h-full bg-transparent border-none text-lg text-gray-700 group hover:bg-gray-50 transition-all ease-out duration-150 flex items-center justify-between gap-2`}
    >
      <div className="flex flex-col gap-1 items-start">
        <div className="group-hover:text-blue-500 text-sm text-gray-500 font-bold">
          {item.form.label}
        </div>
        <div className="group-hover:text-blue-500 text-xs text-gray-500 flex gap-2">
          {item.form.id}
        </div>
      </div>
      <div className="flex gap-2">
        <BiChevronRight className="opacity-70 w-5 h-auto fill-current" />
      </div>
    </button>
  )
}
export interface FormsListProps {
  formList: FormListItem[]
  setActiveFormId(id: string): void
  isEditing: Boolean
  hidden?: boolean
}

const FormListItem = ({
  item,
  depth,
  setActiveFormId,
}: {
  item: Extract<FormListItem, { type: 'document' }>
  depth: number
  setActiveFormId: (id: string) => void
}) => {
  return (
    <div className={`divide-y divide-gray-200`}>
      <Item setActiveFormId={setActiveFormId} item={item} depth={depth} />
      {item.subItems && (
        <ul className="divide-y divide-gray-200">
          {item.subItems?.map((subItem) => {
            if (subItem.type === 'document') {
              return (
                <li key={subItem.form.id}>
                  <Item
                    setActiveFormId={setActiveFormId}
                    depth={depth + 1}
                    item={subItem}
                  />
                </li>
              )
            }
          })}
        </ul>
      )}
    </div>
  )
}

export const FormList = ({
  hidden = false,
  formList,
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
        <li className={`divide-y divide-gray-200`}>
          {formList.map((item, index) => {
            if (item.type === 'list') {
              return (
                <div
                  key={item.label}
                  className={`relative group text-left w-full bg-white py-2 border-t shadow-sm
   border-gray-100 px-6 -mt-px`}
                >
                  <span
                    className={
                      'text-xs tracking-wide font-medium text-gray-700 uppercase'
                    }
                  >
                    {item.label}
                  </span>
                </div>
              )
            }
            return (
              <FormListItem
                setActiveFormId={setActiveFormId}
                key={item.form.id}
                item={item}
                depth={0}
              />
            )
          })}
        </li>
      </ul>
    </Transition>
  )
}
