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
  useFormPortal,
} from '@einsteinindustries/tinacms-form-builder'
import { IconButton } from '@einsteinindustries/tinacms-styles'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import {
  AddIcon,
  DragIcon,
  DuplicateIcon,
  ReorderIcon,
  TrashIcon,
  LeftArrowIcon,
} from '@einsteinindustries/tinacms-icons'
import { GroupPanel, PanelHeader, PanelBody } from './GroupFieldPlugin'
import { FieldDescription } from './wrapFieldWithMeta'

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
  canCopy?: boolean
}

interface GroupProps {
  input: any
  meta: any
  field: GroupFieldDefinititon
  form: any
  tinaForm: Form
}

const Group = ({ tinaForm, form, field, input }: GroupProps) => {
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
        <GroupListMeta>
          <GroupLabel>{field.label || field.name}</GroupLabel>
          {field.description && (
            <FieldDescription>{field.description}</FieldDescription>
          )}
        </GroupListMeta>
        <IconButton onClick={addItem} primary small>
          <AddIcon />
        </IconButton>
      </GroupListHeader>
      <GroupListPanel>
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
      </GroupListPanel>
    </>
  )
}

const EmptyState = () => <EmptyList>There are no items</EmptyList>

interface ItemProps {
  tinaForm: Form
  field: GroupFieldDefinititon
  index: number
  item: any
  label?: string
}

const Item = ({ tinaForm, field, index, item, label, ...p }: ItemProps) => {
  const FormPortal = useFormPortal()
  const [isExpanded, setExpanded] = React.useState<boolean>(false)

  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index)
  }, [tinaForm, field, index])

  const duplicateItem = React.useCallback(() => {
    const deepCopy = JSON.parse(JSON.stringify(item))
    const newItem = {
      ...deepCopy,
      name: item.name ? `${item.name} (copy)` : undefined,
    }
    tinaForm.mutators.insert(field.name, index + 1, newItem)
  }, [tinaForm, field, index, item])

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
            {field.canCopy && (
              <DuplicateButton onClick={duplicateItem}>
                <DuplicateIcon />
              </DuplicateButton>
            )}
            <DeleteButton onClick={removeItem}>
              <TrashIcon />
            </DeleteButton>
          </ItemHeader>
          <FormPortal>
            {({ zIndexShift }) => (
              <Panel
                isExpanded={isExpanded}
                setExpanded={setExpanded}
                field={field}
                index={index}
                tinaForm={tinaForm}
                itemTitle={title}
                zIndexShift={zIndexShift}
              />
            )}
          </FormPortal>
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
  padding: 8px;
`

export const GroupLabel = styled.span<{ error?: boolean }>`
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

export const GroupListHeader = styled.div`
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

export const GroupListMeta = styled.div`
  line-height: 1;
`

const GroupListPanel = styled.div`
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

const ItemHeader = styled.div<{ isDragging: boolean }>`
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

  ${GroupLabel} {
    color: var(--tina-color-grey-8);
    align-self: center;
    max-width: 100%;
  }

  svg {
    fill: var(--tina-color-grey-3);
    width: 20px;
    height: auto;
    transition: fill 85ms ease-out;
  }

  &:hover {
    svg {
      fill: var(--tina-color-grey-8);
    }
    ${GroupLabel} {
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
      ${GroupLabel} {
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
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 12px 8px;
  margin: 0;
  transition: all 85ms ease-out;
  svg {
    transition: all 85ms ease-out;
  }
  &:hover {
    background-color: var(--tina-color-grey-1);
  }
`

const DuplicateButton = styled.button`
  text-align: center;
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 12px 8px;
  margin: 0;
  transition: all 85ms ease-out;
  svg {
    transition: all 85ms ease-out;
  }
  &:hover {
    background-color: var(--tina-color-grey-1);
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
  width: 32px;
  position: relative;
  fill: inherit;
  padding: 12px 0;
  transition: all 85ms ease-out;
  &:hover {
    background-color: var(--tina-color-grey-1);
    cursor: grab;
  }
  svg {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 20px;
    height: 20px;
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
  zIndexShift: number
}

const Panel = function Panel({
  setExpanded,
  isExpanded,
  tinaForm,
  field,
  index,
  itemTitle,
  zIndexShift,
}: PanelProps) {
  const fields: any[] = React.useMemo(() => {
    return field.fields.map((subField: any) => ({
      ...subField,
      name: `${field.name}.${index}.${subField.name}`,
    }))
  }, [field.fields, field.name, index])

  return (
    <GroupPanel isExpanded={isExpanded} style={{ zIndex: zIndexShift + 1000 }}>
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

export const GroupListFieldPlugin = {
  name: 'group-list',
  Component: Group,
}
