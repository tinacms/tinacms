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
import { FieldsBuilder, useFormPortal } from '../../form-builder'
import { IconButton } from '../../styles'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { AddIcon, DragIcon, ReorderIcon, TrashIcon } from '../../icons'
import { GroupPanel, PanelHeader, PanelBody } from './GroupFieldPlugin'
import { FieldDescription } from './wrapFieldWithMeta'
import { useEvent } from '../../react-core/use-cms-event'
import { FieldHoverEvent, FieldFocusEvent } from '../field-events'
import { useCMS } from '../../react-core/use-cms'
import { BiPencil } from 'react-icons/bi'

interface GroupFieldDefinititon extends Field {
  component: 'group'
  fields: Field[]
  defaultItem?: object | (() => object)
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
            <FieldDescription className="whitespace-nowrap text-ellipsis overflow-hidden">
              {field.description}
            </FieldDescription>
          )}
        </GroupListMeta>
        <IconButton onClick={addItem} variant="primary" size="small">
          <AddIcon className="w-5/6 h-auto" />
        </IconButton>
      </GroupListHeader>
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

export const EmptyState = () => <EmptyList>There are no items</EmptyList>

interface ItemProps {
  tinaForm: Form
  field: GroupFieldDefinititon
  index: number
  item: any
  label?: string
}

const Item = ({ tinaForm, field, index, item, label, ...p }: ItemProps) => {
  const cms = useCMS()
  const FormPortal = useFormPortal()
  const [isExpanded, setExpanded] = React.useState<boolean>(false)
  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index)
  }, [tinaForm, field, index])
  const title = label || (field.label || field.name) + ' Item'

  const { dispatch: setHoveredField } = useEvent<FieldHoverEvent>('field:hover')
  const { dispatch: setFocusedField } = useEvent<FieldFocusEvent>('field:focus')
  return (
    <Draggable
      type={field.name}
      draggableId={`${field.name}.${index}`}
      index={index}
    >
      {(provider, snapshot) => (
        <>
          <ItemHeader
            provider={provider}
            isDragging={snapshot.isDragging}
            {...p}
          >
            <DragHandle isDragging={snapshot.isDragging} />
            <ItemClickTarget
              onMouseOver={() =>
                setHoveredField({ fieldName: `${field.name}.${index}` })
              }
              onMouseOut={() => setHoveredField({ fieldName: null })}
              onClick={() => {
                const state = tinaForm.finalForm.getState()
                if (state.invalid === true) {
                  // @ts-ignore
                  cms.alerts.error('Cannot navigate away from an invalid form.')
                  return
                }

                setExpanded(true)
                setFocusedField({ fieldName: `${field.name}.${index}` })
              }}
            >
              <GroupLabel>{title}</GroupLabel>
              <BiPencil className="h-5 w-auto fill-current text-gray-200 group-hover:text-inherit transition-colors duration-150 ease-out" />
            </ItemClickTarget>
            <ItemDeleteButton onClick={removeItem} />
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

export const ItemClickTarget = ({ children, ...props }) => {
  return (
    <div
      className="group text-gray-400 hover:text-blue-600 flex-1 min-w-0 relative flex justify-between items-center p-2"
      {...props}
    >
      {children}
    </div>
  )
}

export const GroupLabel = ({
  error,
  children,
}: {
  children?: any
  error?: boolean
}) => {
  return (
    <span
      className={`m-0 text-xs font-semibold flex-1 text-ellipsis overflow-hidden transition-all ease-out duration-100 text-left ${
        error ? `text-red-500` : `text-gray-600 group-hover:text-inherit`
      }`}
    >
      {children}
    </span>
  )
}

export const GroupListHeader = ({ children }: { children?: any }) => {
  return (
    <span className="relative flex w-full justify-between items-center mb-2">
      {children}
    </span>
  )
}

export const GroupListMeta = ({ children }: { children?: any }) => {
  return (
    <div className="leading-none w-full flex-1 flex justify-between items-center gap-2">
      {children}
    </div>
  )
}

export const ListPanel = ({ children }) => {
  return (
    <div className="relative mb-6 rounded-md bg-gray-100 shadow">
      {children}
    </div>
  )
}

export const EmptyList = ({ children }) => {
  return (
    <div className="text-center rounded bg-gray-100 text-gray-400 p-3 text-sm italic font-regular">
      {children}
    </div>
  )
}

export const ItemHeader = ({
  isDragging,
  children,
  provider,
  ...props
}: {
  isDragging: boolean
  children: any | any[]
  provider: any
}) => {
  return (
    <div
      className={`relative group cursor-pointer flex justify-between items-stretch bg-white border border-gray-100 -mb-px overflow-visible p-0 text-sm font-normal ${
        isDragging
          ? `rounded shadow text-blue-600`
          : `text-gray-600 first:rounded-t last:rounded-b`
      }`}
      ref={provider.innerRef}
      {...provider.draggableProps}
      {...provider.dragHandleProps}
      {...props}
    >
      {children}
    </div>
  )
}

export const ItemDeleteButton = ({ onClick }) => {
  return (
    <button
      className="w-8 px-1 py-2.5 flex items-center justify-center hover:bg-gray-50 text-gray-200 hover:text-red-500"
      onClick={onClick}
    >
      <TrashIcon className="fill-current transition-colors ease-out duration-100" />
    </button>
  )
}

export const DragHandle = ({ isDragging }: { isDragging: boolean }) => {
  return (
    <div
      className={`relative w-8 px-1 py-2.5 flex items-center justify-center hover:bg-gray-50 group cursor-[grab] ${
        isDragging ? `text-blue-500` : `text-gray-200 hover:text-gray-600`
      }`}
    >
      {isDragging ? (
        <ReorderIcon className="fill-current w-7 h-auto" />
      ) : (
        <>
          <DragIcon className="fill-current w-7 h-auto group-hover:opacity-0 transition-opacity duration-150 ease-out" />
          <ReorderIcon className="fill-current w-7 h-auto absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out" />
        </>
      )}
    </div>
  )
}

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
  const cms = useCMS()
  const fields: any[] = React.useMemo(() => {
    return field.fields.map((subField: any) => ({
      ...subField,
      name: `${field.name}.${index}.${subField.name}`,
    }))
  }, [field.fields, field.name, index])

  return (
    <GroupPanel isExpanded={isExpanded} style={{ zIndex: zIndexShift + 1000 }}>
      <PanelHeader
        onClick={() => {
          const state = tinaForm.finalForm.getState()
          if (state.invalid === true) {
            // @ts-ignore
            cms.alerts.error('Cannot navigate away from an invalid form.')
            return
          }

          setExpanded(false)
        }}
      >
        {itemTitle}
      </PanelHeader>
      <PanelBody id={tinaForm.id}>
        {isExpanded ? <FieldsBuilder form={tinaForm} fields={fields} /> : null}
      </PanelBody>
    </GroupPanel>
  )
}

interface GroupFieldProps {
  field: Field
}

export const GroupListField = Group

export const GroupListFieldPlugin = {
  name: 'group-list',
  Component: GroupListField,
}
