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
import styled from 'styled-components'
import { CloseIcon } from '../../icons'

export const TagsField = wrapFieldsWithMeta<
  { placeholder: string },
  InputProps
  // @ts-ignore
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
      <TagGrid>
        {items.map((tag: string, index: number) => (
          <Tag key={tag} tinaForm={tinaForm} field={field} index={index}>
            {tag}
          </Tag>
        ))}
      </TagGrid>
    </>
  )
})

const TagGrid = styled.span`
  display: flex;
  flex-wrap: wrap;
  margin: 4px -4px 0 -4px;
`

const Tag = styled(({ tinaForm, field, index, children, ...styleProps }) => {
  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index)
  }, [tinaForm, field, index])
  return (
    <span {...styleProps}>
      <span>{children}</span>
      <button
        className="text-center flex-shrink-0 border-0 bg-transparent p-2 flex items-center justify-center cursor-pointer"
        onClick={removeItem}
      >
        <CloseIcon className="w-4 h-auto" />
      </button>
    </span>
  )
})`
  border-radius: var(--tina-radius-small);
  box-shadow: var(--tina-shadow-small);
  background-color: var(--tina-color-grey-0);
  border: 1px solid var(--tina-color-grey-2);
  display: flex;
  align-items: center;
  font-size: var(--tina-font-size-2);
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  line-height: 1;
  color: var(--tina-color-grey-8);
  padding: 0 0 0 10px;
  margin: 4px;
  text-overflow: ellipsis;
  overflow: hidden;

  span {
    max-width: calc(var(--tina-sidebar-width) - 50px);
    flex-shrink: 1;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`
export const TagsFieldPlugin = {
  name: 'tags',
  Component: TagsField,
  parse,
}
