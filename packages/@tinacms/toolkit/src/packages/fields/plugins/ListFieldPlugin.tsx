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
import { Field, Form } from '../../forms'
import { FieldsBuilder } from '../../form-builder'
import { IconButton } from '../../styles'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { AddIcon } from '../../icons'
import { FieldDescription } from './wrapFieldWithMeta'
import {
  DragHandle,
  ItemClickTarget,
  ItemDeleteButton,
  ItemHeader,
} from './GroupListFieldPlugin'

type DefaultItem = string | number | (() => string | number)

interface ListFieldDefinititon extends Field {
  component: 'list'
  defaultItem?: DefaultItem
  field: {
    component: 'text' | 'textarea' | 'number' | 'select'
  }

  type?: string
  list?: boolean
  parentTypename?: string
  /**
   * An optional function which generates `props` for
   * this items's `li`.
   */
  itemProps?: (_item: object) => {
    /**
     * The `key` property used to optimize the rendering of lists.
     *
     * If rendering is causing problems, use `defaultItem` to
     * generate a unique key for the item.
     *
     * Reference:
     * * https://reactjs.org/docs/lists-and-keys.html
     */
    key?: string
  }
}

interface ListProps {
  input: any
  meta: any
  field: ListFieldDefinititon
  form: any
  tinaForm: Form
}

const List = ({ tinaForm, form, field, input }: ListProps) => {
  const addItem = React.useCallback(() => {
    let newItem: DefaultItem = ''
    if (typeof field.defaultItem === 'function') {
      newItem = field.defaultItem()
    } else if (typeof field.defaultItem !== 'undefined') {
      newItem = field.defaultItem
    }
    form.mutators.insert(field.name, 0, newItem)
  }, [form, field])

  const items = input.value || []
  const itemProps = React.useCallback(
    (item: object) => {
      if (!field.itemProps) return {}
      return field.itemProps(item)
    },
    [field.itemProps]
  )

  return (
    <>
      <ListHeader>
        <div className="leading-none">
          <Label>{field.label || field.name}</Label>
          {field.description && (
            <FieldDescription className="whitespace-nowrap text-ellipsis overflow-hidden">
              {field.description}
            </FieldDescription>
          )}
        </div>
        <IconButton onClick={addItem} variant="primary" size="small">
          <AddIcon className="w-5/6 h-auto" />
        </IconButton>
      </ListHeader>
      <ListPanel>
        <div>
          <Droppable droppableId={field.name} type={field.name}>
            {(provider) => (
              <div ref={provider.innerRef}>
                {items.length === 0 && <EmptyState />}
                {items.map((item: any, index: any) => (
                  <Item
                    // NOTE: Supressing warnings, but not helping with render perf
                    key={index}
                    tinaForm={tinaForm}
                    field={field}
                    item={item}
                    index={index}
                    {...itemProps(item)}
                  />
                ))}
                {provider.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </ListPanel>
    </>
  )
}

const EmptyState = () => <EmptyList>There are no items</EmptyList>

interface ItemProps {
  tinaForm: Form
  field: ListFieldDefinititon
  index: number
  item: any
  label?: string
}

const Item = ({ tinaForm, field, index, item, label, ...p }: ItemProps) => {
  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index)
  }, [tinaForm, field, index])
  const fields = [
    {
      type: field.type,
      list: field.list,
      parentTypename: field.parentTypename,
      ...field.field,
      label: 'Value',
      name: field.name + '.' + index,
    },
  ]

  return (
    <Draggable
      type={field.name}
      draggableId={`${field.name}.${index}`}
      index={index}
    >
      {(provider, snapshot) => (
        <ItemHeader provider={provider} isDragging={snapshot.isDragging} {...p}>
          <DragHandle isDragging={snapshot.isDragging} />
          <ItemClickTarget>
            <FieldsBuilder padding={false} form={tinaForm} fields={fields} />
          </ItemClickTarget>
          <ItemDeleteButton onClick={removeItem} />
        </ItemHeader>
      )}
    </Draggable>
  )
}
const Label = ({ error = false, className = '', ...props }) => (
  <span
    className={`truncate m-0 text-[13px] font-bold tracking-[0.01em] leading-[1.35] flex-grow flex-shrink flex-auto transition-all duration-100 ease-out text-left ${
      error ? 'text-orange-500' : 'text-gray-700'
    } ${className}`}
    {...props}
  />
)

const ListHeader = ({ className = '', ...props }) => (
  <div
    className={`relative flex w-full justify-between items-center mb-2 ${className}`}
    {...props}
  />
)

const ListPanel = ({ className = '', ...props }) => (
  <div
    className={`max-h-[initial] relative h-auto mb-6 rounded-[5px] bg-gray-100 ${className}`}
    {...props}
  />
)

const EmptyList = ({ className = '', ...props }) => (
  <div
    className={`text-center rounded-[5px] bg-gray-100 text-gray-300 leading-[1.35] py-3 text-[15px] font-normal ${className}`}
    {...props}
  />
)

export const ListField = List

export const ListFieldPlugin = {
  name: 'list',
  Component: ListField,
}
