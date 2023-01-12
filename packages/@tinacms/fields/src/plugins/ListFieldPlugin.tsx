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
import { Field, Form } from '@einsteinindustries/tinacms-forms'
import styled, { css } from 'styled-components'
import {
  FieldsBuilder,
  FieldsGroup,
} from '@einsteinindustries/tinacms-form-builder'
import { IconButton } from '@einsteinindustries/tinacms-styles'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import {
  AddIcon,
  ReorderIcon,
  TrashIcon,
} from '@einsteinindustries/tinacms-icons'
import { FieldDescription, FieldWrapper } from './wrapFieldWithMeta'

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
  itemProps?: (
    item: object
  ) => {
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
            <FieldDescription>{field.description}</FieldDescription>
          )}
        </ListMeta>
        <IconButton onClick={addItem} primary small>
          <AddIcon />
        </IconButton>
      </ListHeader>
      <ListPanel>
        <ItemList>
          <Droppable droppableId={field.name} type={field.name}>
            {provider => (
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
        <>
          <ListItem
            ref={provider.innerRef}
            isDragging={snapshot.isDragging}
            {...provider.draggableProps}
            {...provider.dragHandleProps}
            {...p}
          >
            <ItemField>
              <FieldsBuilder form={tinaForm} fields={fields} />
            </ItemField>
            <ItemActions>
              <DragHandle />
              <DeleteButton onClick={removeItem}>
                <TrashIcon />
              </DeleteButton>
            </ItemActions>
          </ListItem>
        </>
      )}
    </Draggable>
  )
}

const ItemField = styled.div`
  flex: 1;
  display: flex;
  align-items: center;

  label {
    display: none;
  }
`

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-height: 84px;
`

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

  ${props =>
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
  ${FieldDescription} {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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

const ListItem = styled.div<{ isDragging: boolean }>`
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  background-color: white;
  border: 1px solid var(--tina-color-grey-2);
  margin: 0 0 -1px 0;
  overflow: visible;
  line-height: 1.35;
  padding: 0;
  font-size: var(--tina-font-size-2);
  font-weight: var(--tina-font-weight-regular);

  ${Label} {
    color: var(--tina-color-grey-8);
    align-self: center;
    max-width: 100%;
  }

  ${FieldsGroup} {
    padding: var(--tina-padding-small) calc(var(--tina-padding-small) / 2)
      var(--tina-padding-small) var(--tina-padding-small);
    display: flex;
    align-items: center;
  }

  ${FieldWrapper} {
    margin: 0;
    flex: 1;
  }

  svg {
    fill: var(--tina-color-grey-4);
    transition: fill 85ms ease-out;
  }

  &:hover {
    svg {
      fill: var(--tina-color-grey-8);
    }
    ${Label} {
      color: var(--tina-color-primary);
    }
  }

  &:first-child {
    border-radius: 4px 4px 0 0;
  }

  &:nth-last-child(2) {
    border-radius: 0 0 4px 4px;
    &:first-child {
      border-radius: var(--tina-radius-small);
    }
  }

  ${p =>
    p.isDragging &&
    css<any>`
      border-radius: var(--tina-radius-small);
      box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);

      svg {
        fill: var(--tina-color-grey-8);
      }
      ${Label} {
        color: var(--tina-color-primary);
      }

      ${DragHandle} {
        svg:first-child {
          opacity: 0;
        }
        svg:last-child {
          opacity: 1;
        }
      }
    `};
`

const DeleteButton = styled.button`
  text-align: center;
  flex: 1 0 auto;
  border: 0;
  background: transparent;
  cursor: pointer;
  width: 38px;
  height: 36px;
  padding: 0 4px 5px 0;
  margin: 0;
  transition: all 85ms ease-out;
  svg {
    width: 24px;
    height: 24px;
    transition: all 85ms ease-out;
  }
  &:hover {
    background-color: var(--tina-color-grey-1);
  }
`

const DragHandle = styled(function DragHandle({ ...styleProps }) {
  return (
    <div {...styleProps}>
      <ReorderIcon />
    </div>
  )
})`
  margin: 0;
  flex: 1 0 auto;
  width: 38px;
  height: 36px;
  padding: 5px 4px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  fill: inherit;
  transition: all 85ms ease-out;
  &:hover {
    background-color: var(--tina-color-grey-1);
    cursor: grab;
  }
  svg {
    width: 24px;
    height: 24px;
    transition: all 85ms ease-out;
  }
`

export const ListFieldPlugin = {
  name: 'list',
  Component: List,
}
