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

import * as React from 'react'
import { Field, Form } from '@tinacms/core'
import styled, { css } from 'styled-components'
import { FieldsBuilder } from '@tinacms/form-builder'
import {
  color,
  font,
  radius,
  IconButton,
} from '@tinacms/styles'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import {
  AddIcon,
  DragIcon,
  ReorderIcon,
  TrashIcon,
  LeftArrowIcon,
} from '@tinacms/icons'
import { GroupPanel, PanelHeader, PanelBody } from './GroupFieldPlugin'

interface GroupFieldDefinititon extends Field {
  component: 'group'
  fields: Field[]
  defaultItem?: object | (() => object)
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
    /**
     * The label to be display on the list item.
     */
    label?: string
  }
}

interface GroupProps {
  input: any
  meta: any
  field: GroupFieldDefinititon
  form: any
  tinaForm: Form
}

const Group = function Group({
  tinaForm,
  form,
  field,
  input,
}: GroupProps) {
  const addItem = React.useCallback(() => {
    let obj = {}
    if (typeof field.defaultItem === 'function') {
      obj = field.defaultItem()
    } else {
      obj = field.defaultItem || {}
    }
    form.mutators.insert(field.name, 0, obj)
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
      <GroupListHeader>
        <GroupLabel>{field.label || field.name}</GroupLabel>
        <IconButton onClick={addItem} primary small>
          <AddIcon />
        </IconButton>
      </GroupListHeader>
      <GroupListPanel>
        <ItemList>
          <Droppable droppableId={field.name} type={field.name}>
            {(provider) => (
              <div ref={provider.innerRef}>
                {items.length === 0 && <EmptyState />}
                {items.map((item: any, index: any) => (
                  <Item
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
      </GroupListPanel>
    </>
  )
}

const EmptyState = () => <EmptyList>There's no items</EmptyList>

interface ItemProps {
  tinaForm: Form
  field: GroupFieldDefinititon
  index: number
  item: any
  label?: string
}

const Item = ({ tinaForm, field, index, item, label, ...p }: ItemProps) => {
  const [isExpanded, setExpanded] = React.useState<boolean>(false)
  const removeItem = React.useCallback(() => {
    tinaForm.finalForm.mutators.remove(field.name, index)
  }, [tinaForm, field, index])
  const title = label || (field.label || field.name) + ' Item'
  return (
    <Draggable
      type={field.name}
      draggableId={`${field.name}.${index}`}
      index={index}
    >
      {(provider, snapshot) => (
        <>
          <ItemHeader
            ref={provider.innerRef}
            isDragging={snapshot.isDragging}
            {...provider.draggableProps}
            {...provider.dragHandleProps}
            {...p}
          >
            <DragHandle />
            <ItemClickTarget onClick={() => setExpanded(true)}>
              <GroupLabel>{title}</GroupLabel>
            </ItemClickTarget>
            <DeleteButton onClick={removeItem}>
              <TrashIcon />
            </DeleteButton>
          </ItemHeader>
          <Panel
            isExpanded={isExpanded}
            setExpanded={setExpanded}
            field={field}
            index={index}
            tinaForm={tinaForm}
            itemTitle={title}
          />
        </>
      )}
    </Draggable>
  )
}

const ItemClickTarget = styled.div`
  flex: 1 1 0;
  min-width: 0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
`

const GroupLabel = styled.span`
  margin: 0;
  font-size: ${font.size(2)};
  font-weight: 500;
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: inherit;
  transition: all 85ms ease-out;
  text-align: left;
`

const GroupListHeader = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  ${GroupLabel} {
    font-size: ${font.size(3)};
  }
`

const GroupListPanel = styled.div`
  max-height: initial;
  position: relative;
  height: auto;
  margin-bottom: 1.5rem;
  border-radius: ${radius('small')};
  background-color: ${color.grey(2)};
`

const EmptyList = styled.div`
  text-align: center;
  border-radius: ${radius('small')};
  background-color: ${color.grey(2)};
  color: ${color.grey(4)};
  line-height: 1.35;
  padding: 0.75rem 0;
  font-size: ${font.size(2)};
  font-weight: 500;
`

const ItemList = styled.div``

const ItemHeader = styled.div<{ isDragging: boolean }>`
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  background-color: white;
  border: 1px solid ${color.grey(2)};
  margin: 0 0 -1px 0;
  overflow: visible;
  line-height: 1.35;
  padding: 0;
  font-size: ${font.size(2)};
  font-weight: 500;

  ${GroupLabel} {
    color: #282828;
    align-self: center;
    max-width: 100%;
  }

  svg {
    fill: ${color.grey(3)};
    width: 1.25rem;
    height: auto;
    transition: fill 85ms ease-out;
  }

  &:hover {
    svg {
      fill: ${color.grey(8)};
    }
    ${GroupLabel} {
      color: #0084ff;
    }
  }

  &:first-child {
    border-radius: 0.25rem 0.25rem 0 0;
  }

  &:nth-last-child(2) {
    border-radius: 0 0 0.25rem 0.25rem;
    &:first-child {
      border-radius: ${radius('small')};
    }
  }

  ${p =>
    p.isDragging &&
    css`
      border-radius: ${radius('small')};
      box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);

      svg {
        fill: ${color.grey(8)};
      }
      ${GroupLabel} {
        color: #0084ff;
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
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0.75rem 0.5rem;
  margin: 0;
  transition: all 85ms ease-out;
  svg {
    transition: all 85ms ease-out;
  }
  &:hover {
    background-color: #f6f6f9;
  }
`

const DragHandle = styled(function DragHandle({ ...styleProps }) {
  return (
    <div {...styleProps}>
      <DragIcon />
      <ReorderIcon />
    </div>
  )
})`
  margin: 0;
  flex: 0 0 auto;
  width: 2rem;
  position: relative;
  fill: inherit;
  padding: 0.75rem 0;
  transition: all 85ms ease-out;
  &:hover {
    background-color: #f6f6f9;
    cursor: grab;
  }
  svg {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 1.25rem;
    height: 1.25rem;
    transform: translate3d(-50%, -50%, 0);
    transition: all 85ms ease-out;
  }
  svg:last-child {
    opacity: 0;
  }
  *:hover > & {
    svg:first-child {
      opacity: 0;
    }
    svg:last-child {
      opacity: 1;
    }
  }
`

interface PanelProps {
  setExpanded(next: boolean): void
  isExpanded: boolean
  tinaForm: Form
  index: number
  field: GroupFieldDefinititon
  itemTitle: string
}

const Panel = function Panel({
  setExpanded,
  isExpanded,
  tinaForm,
  field,
  index,
  itemTitle,
}: PanelProps) {
  const fields: any[] = React.useMemo(() => {
    return field.fields.map((subField: any) => ({
      ...subField,
      name: `${field.name}.${index}.${subField.name}`,
    }))
  }, [field.fields, field.name, index])

  return (
    <GroupPanel isExpanded={isExpanded}>
      <PanelHeader onClick={() => setExpanded(false)}>
        <LeftArrowIcon />
        <GroupLabel>{itemTitle}</GroupLabel>
      </PanelHeader>
      <PanelBody>
        {isExpanded ? <FieldsBuilder form={tinaForm} fields={fields} /> : null}
      </PanelBody>
    </GroupPanel>
  )
}

interface GroupFieldProps {
  field: Field
}

export default {
  name: 'group-list',
  Component: Group,
}
