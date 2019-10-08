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
import { padding, color } from '@tinacms/styles'
import { Droppable, DropResult, Draggable } from 'react-beautiful-dnd'
import { Button } from '../../components/Button'
import {
  AddIcon,
  DragIcon,
  ReorderIcon,
  RightArrowIcon,
  TrashIcon,
  LeftArrowIcon,
} from '@tinacms/icons'
import { GroupPanel, PanelHeader, PanelBody } from './GroupFieldPlugin'

interface GroupFieldDefinititon extends Field {
  component: 'group'
  defaultItem: object
  key: string
  fields: Field[]
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
  meta,
  ...styleProps
}: GroupProps) {
  const addItem = React.useCallback(() => {
    const obj = field.defaultItem || {}
    form.mutators.insert(field.name, 0, obj)
  }, [form, field])

  const items = input.value || []

  return (
    <>
      <GroupListHeader>
        <GroupLabel>{field.label || field.name}</GroupLabel>
        <GroupHeaderButton onClick={addItem}>
          <AddIcon />
        </GroupHeaderButton>
      </GroupListHeader>
      <GroupListPanel>
        <ItemList>
          <Droppable droppableId={field.name} type={field.name}>
            {(provider, snapshot) => (
              <div ref={provider.innerRef}>
                {items.length === 0 && <EmptyState />}
                {items.map((item: any, index: any) => (
                  <Item
                    tinaForm={tinaForm}
                    field={field}
                    item={item}
                    index={index}
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
}

const Item = ({ tinaForm, field, index, item, ...p }: ItemProps) => {
  const [isExpanded, setExpanded] = React.useState<boolean>(false)
  const removeItem = React.useCallback(() => {
    tinaForm.finalForm.mutators.remove(field.name, index)
  }, [tinaForm, field, index])
  const title = item.alt ? item.alt : (field.label || field.name) + ' Item'
  return (
    <Draggable
      key={index}
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
  font-size: 0.85rem;
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
    font-size: 1rem;
  }
`

const GroupListPanel = styled.div`
  max-height: initial;
  position: relative;
  height: auto;
  margin-bottom: 1.5rem;
  border-radius: 0.3rem;
  background-color: #edecf3;
`

const GroupHeaderButton = styled(Button)`
  border-radius: 1.5rem;
  padding: 0;
  width: 1.75rem;
  height: 1.75rem;
  margin: -0.1rem 0 0 0;
  position: relative;
  fill: white;
  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    width: 1.5rem;
    height: 1.5rem;
  }
`

const EmptyList = styled.div`
  text-align: center;
  border-radius: 0.3rem;
  background-color: #edecf3;
  color: #b2adbe;
  line-height: 1.35;
  padding: 0.75rem 0;
  font-size: 0.85rem;
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
  border: 1px solid #edecf3;
  margin: 0 0 -1px 0;
  overflow: visible;
  line-height: 1.35;
  padding: 0;
  font-size: 0.85rem;
  font-weight: 500;

  ${GroupLabel} {
    color: #282828;
    align-self: center;
    max-width: 100%;
  }

  svg {
    fill: #e1ddec;
    width: 1.25rem;
    height: auto;
    transition: fill 85ms ease-out;
  }

  &:hover {
    svg {
      fill: #433e52;
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
      border-radius: 0.3rem;
    }
  }

  ${p =>
    p.isDragging &&
    css`
      border-radius: 0.3rem;
      box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);

      svg {
        fill: #433e52;
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
        <FieldsBuilder form={tinaForm} fields={fields} />
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
