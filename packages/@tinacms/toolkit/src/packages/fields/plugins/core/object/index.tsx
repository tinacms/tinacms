import React from 'react'
import { getPath, TinaFieldProps } from '../../../../form-builder'
import { DragHandle, Wrap } from '../../..'
import { AddIcon, TrashIcon } from '../../../../icons'
import { IconButton } from '../../../../styles'
import { BiPencil } from 'react-icons/bi'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { BlockSelector } from './blockSelector'
import {
  ObjectFieldWithFields,
  ObjectFieldWithTemplates,
  Template,
} from '@tinacms/schema-tools'

export const Object = (props: TinaFieldProps) => {
  if (props.field?.ui?.component) {
    if (typeof props.field.ui.component === 'string') {
    } else {
      const Component = props.field?.ui?.component
      return <Component {...props} />
    }
  }
  if (props.field.list) {
    if (props.field.type === 'object') {
      if (props.field.templates) {
        const field = props.field as ObjectFieldWithTemplates
        return <ObjectTemplateList {...props} field={field} />
      } else {
        const field = props.field as ObjectFieldWithFields
        return <ObjectFieldList {...props} field={field} />
      }
    }
  }
  return (
    <div className="pt-1 mb-5">
      <button
        onClick={() => {}}
        className="group px-4 py-3 bg-white hover:bg-gray-50 shadow focus:shadow-outline focus:border-blue-500 w-full border border-gray-100 hover:border-gray-200 text-gray-500 hover:text-blue-400 focus:text-blue-500 rounded-md flex justify-between items-center gap-2"
      >
        <span className="text-left text-base font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1">
          Ok Go
        </span>{' '}
        <BiPencil className="h-6 w-auto transition-opacity duration-150 ease-out opacity-80 group-hover:opacity-90" />
      </button>
    </div>
  )
}

const ObjectFieldList = (
  props: TinaFieldProps & { field: ObjectFieldWithFields }
) => {
  // if(props.field.fields && props.field.list) {
  const addItem = React.useCallback(() => {
    let obj = {}
    if (typeof props.field.ui?.defaultItem === 'function') {
      obj = props.field.ui.defaultItem()
    } else {
      obj = props.field.ui.defaultItem || {}
    }
    props.tinaForm.finalForm.mutators.insert(props.field.name, 0, obj)
  }, [props.form, props.field])
  if (props.field.type !== 'object') {
    throw new Error(`Expected field to be of type 'object'`)
  }
  if (!Array.isArray(props.input.value)) {
    return null
  }
  return (
    <Wrap
      {...props}
      actionSlot={
        <IconButton onClick={addItem} variant="primary" size="small">
          <AddIcon className="w-5/6 h-auto" />
        </IconButton>
      }
    >
      <div className="relative mb-6 rounded-md bg-gray-100 shadow">
        <Droppable droppableId={props.field.name} type={props.field.name}>
          {(provider) => (
            <div ref={provider.innerRef}>
              {props.input.value?.map((item, index) => {
                return (
                  <Item
                    key={index}
                    {...props}
                    template={props.field}
                    item={item}
                    index={index}
                  />
                )
              })}
            </div>
          )}
        </Droppable>
      </div>
    </Wrap>
  )
}
const ObjectTemplateList = (
  props: TinaFieldProps & { field: ObjectFieldWithTemplates }
) => {
  const addItem = React.useCallback(
    (template: Template) => {
      let obj: { _template?: string } = {}
      if (typeof template.ui?.defaultItem === 'function') {
        obj = template.ui?.defaultItem()
      } else {
        obj = template.ui?.defaultItem || {}
      }
      obj._template = template.name
      props.tinaForm.finalForm.mutators.insert(props.field.name, 0, obj)
    },
    [props.tinaForm, props.field]
  )
  if (props.field.type !== 'object') {
    throw new Error(`Expected field to be of type 'object'`)
  }

  if (!Array.isArray(props.input.value)) {
    return null
  }
  return (
    <Wrap
      {...props}
      actionSlot={
        <BlockSelector templates={props.field.templates} addItem={addItem} />
      }
    >
      <div className="relative mb-6 rounded-md bg-gray-100 shadow">
        <Droppable droppableId={props.field.name} type={props.field.name}>
          {(provider) => (
            <div ref={provider.innerRef}>
              {props.input.value?.map((item, index) => {
                const template = props.field.templates.find(
                  (template) => item._template === template.name
                )
                if (!template) {
                  throw new Error(
                    `Unable to find template for value ${item._template}`
                  )
                }
                return (
                  <Item
                    key={index}
                    {...props}
                    template={template}
                    item={item}
                    index={index}
                  />
                )
              })}
            </div>
          )}
        </Droppable>
      </div>
    </Wrap>
  )
}

const Item = (
  props: TinaFieldProps & { template: Template; item: object; index: number }
) => {
  let label
  const title = label || (props.template.label || props.field.name) + ' Item'
  const path = getPath(props.state.depth)
  const prefix = path ? `${path}.` : ''
  return (
    <Draggable
      type={props.field.name}
      draggableId={`${props.field.name}.${props.index}`}
      index={props.index}
    >
      {(provider, snapshot) => (
        <div
          className={`relative group cursor-pointer flex justify-between items-stretch bg-white border border-gray-100 -mb-px overflow-visible p-0 text-sm font-normal ${
            snapshot.isDragging
              ? `rounded shadow text-blue-600`
              : `text-gray-600 first:rounded-t last:rounded-b`
          }`}
          ref={provider.innerRef}
          {...provider.draggableProps}
          {...provider.dragHandleProps}
        >
          <DragHandle isDragging={snapshot.isDragging} />
          <button
            // onClick={() => props.setActiveFields(props.template.fields)}
            onClick={() =>
              props.setActiveFields(
                `${prefix}${props.field.name}.${props.index}`
              )
            }
            className="group text-gray-400 hover:text-blue-600 flex-1 min-w-0 relative flex justify-between items-center p-2"
          >
            <span
              className={`m-0 text-xs font-semibold flex-1 text-ellipsis overflow-hidden transition-all ease-out duration-100 text-left ${
                false
                  ? `text-red-500`
                  : `text-gray-600 group-hover:text-inherit`
              }`}
            >
              {title}
            </span>
            <BiPencil className="h-5 w-auto fill-current text-gray-200 group-hover:text-inherit transition-colors duration-150 ease-out" />
          </button>
          <button
            className="w-8 px-1 py-2.5 flex items-center justify-center hover:bg-gray-50 text-gray-200 hover:text-red-500"
            onClick={() => {}}
          >
            <TrashIcon className="fill-current transition-colors ease-out duration-100" />
          </button>
        </div>
      )}
    </Draggable>
  )
}
