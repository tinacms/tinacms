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
import styled, { css } from 'styled-components'
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
  /**
   * An optional function which generates `props` for
   * this items's `li`.
   */
  itemProps?: (item: object) => {
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
        <ListMeta>
          <Label>{field.label || field.name}</Label>
          {field.description && (
            <FieldDescription className="whitespace-nowrap text-ellipsis overflow-hidden">
              {field.description}
            </FieldDescription>
          )}
        </ListMeta>
        <IconButton onClick={addItem} variant="primary" size="small">
          <AddIcon className="w-5/6 h-auto" />
        </IconButton>
      </ListHeader>
      <ListPanel>
        <ItemList>
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
        </ItemList>
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
      // @ts-ignore FIXME: this is needed for the new event system, so we know what type to record when we get a change
      type: field.type,
      // @ts-ignore FIXME: this is needed for the new event system, so we know what type to record when we get a change
      list: field.list,
      // @ts-ignore FIXME: this is needed for the new event system, so we know what type to record when we get a change
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

const Label = styled.span<{ error?: boolean }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  font-size: var(--tina-font-size-1);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.35;
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--tina-color-grey-8);
  transition: all 85ms ease-out;
  text-align: left;

  ${(props) =>
    props.error &&
    css`
      color: var(--tina-color-error) !important;
    `};
`

const ListHeader = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const ListMeta = styled.div`
  line-height: 1;
`

const ListPanel = styled.div`
  max-height: initial;
  position: relative;
  height: auto;
  margin-bottom: 24px;
  border-radius: var(--tina-radius-small);
  background-color: var(--tina-color-grey-2);
`

const EmptyList = styled.div`
  text-align: center;
  border-radius: var(--tina-radius-small);
  background-color: var(--tina-color-grey-2);
  color: var(--tina-color-grey-4);
  line-height: 1.35;
  padding: 12px 0;
  font-size: var(--tina-font-size-2);
  font-weight: var(--tina-font-weight-regular);
`

const ItemList = styled.div``

export const ListField = List

export const ListFieldPlugin = {
  name: 'list',
  Component: ListField,
}
