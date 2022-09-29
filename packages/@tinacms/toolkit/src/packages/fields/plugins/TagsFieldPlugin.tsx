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
import { InputProps, BaseTextField } from '../components'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { parse } from './textFormat'
import { CloseIcon } from '../../icons'

export const TagsField = wrapFieldsWithMeta<
  { placeholder: string },
  InputProps
>(({ input, field, form, tinaForm }) => {
  const [value, setValue] = React.useState<string>('')
  const addTag = React.useCallback(
    (tag: string) => {
      if (form.getFieldState(field.name)?.value?.includes(tag)) {
        return
      }
      if (!tag.length) {
        return
      }
      form.mutators.insert(field.name, 0, tag)
      setValue('')
    },
    [form, field.name]
  )
  const items = input.value || []
  return (
    <>
      <BaseTextField
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={field.placeholder}
        onKeyPress={(event) => {
          if (event.key === ',' || event.key === 'Enter') {
            event.preventDefault()
            addTag(value)
          }
        }}
      />
      <span className="flex flex-wrap mt-1 -mx-1 mb-0">
        {items.map((tag: string, index: number) => (
          <Tag key={tag} tinaForm={tinaForm} field={field} index={index}>
            {tag}
          </Tag>
        ))}
      </span>
    </>
  )
})

const Tag = ({ tinaForm, field, index, children, ...styleProps }) => {
  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index)
  }, [tinaForm, field, index])
  return (
    <span
      className="rounded-[5px] shadow-[0_2px_3px_rgba(0,0,0,0.12)] bg-white flex items-center font-semibold tracking-[0.01em] leading-none text-gray-700 pl-2.5 m-1 truncate"
      {...styleProps}
    >
      <span
        style={{ maxHeight: 'calc(var(--tina-sidebar-width) - 50px)' }}
        className="text-[15px] flex-shrink overflow-ellipsis overflow-hidden"
      >
        {children}
      </span>
      <button
        className="text-center flex-shrink-0 border-0 bg-transparent p-2 flex items-center justify-center cursor-pointer"
        onClick={removeItem}
      >
        <CloseIcon className="w-4 h-auto" />
      </button>
    </span>
  )
}

export const TagsFieldPlugin = {
  name: 'tags',
  Component: TagsField,
  parse,
}
