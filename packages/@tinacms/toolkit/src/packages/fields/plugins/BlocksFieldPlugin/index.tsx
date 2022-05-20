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
import { Field, Form } from '../../../forms'
import { FieldsBuilder, useFormPortal } from '../../../form-builder'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { GroupPanel, PanelHeader, PanelBody } from '../GroupFieldPlugin'
import { FieldDescription } from '../wrapFieldWithMeta'
import {
  GroupListHeader,
  GroupListMeta,
  GroupLabel,
  ItemDeleteButton,
  ItemHeader,
  ListPanel,
  DragHandle,
  ItemClickTarget,
  EmptyState,
} from '../GroupListFieldPlugin'
import { useCMS } from '../../../react-core/use-cms'
import { useEvent } from '../../../react-core'
import { FieldHoverEvent, FieldFocusEvent } from '../../field-events'
import { BlockSelector } from './BlockSelector'
import { BlockSelectorBig } from './BlockSelectorBig'
import { BiPencil } from 'react-icons/bi'

export interface BlocksFieldDefinititon extends Field {
  component: 'blocks'
  templates: {
    [key: string]: BlockTemplate
  }
}

export interface BlockTemplate {
  label: string
  defaultItem?: object | (() => object)
  fields?: Field[]
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

interface BlockFieldProps {
  input: any
  meta: any
  field: BlocksFieldDefinititon
  form: any
  tinaForm: Form
}

const Blocks = ({ tinaForm, form, field, input }: BlockFieldProps) => {
  const addItem = React.useCallback(
    (name: string, template: BlockTemplate) => {
      let obj: any = {}
      if (typeof template.defaultItem === 'function') {
        obj = template.defaultItem()
      } else {
        obj = template.defaultItem || {}
      }
      obj._template = name
      form.mutators.insert(field.name, 0, obj)
    },
    [field.name, form.mutators]
  )

  const items = input.value || []

  return (
    <>
      <GroupListHeader>
        <GroupListMeta>
          <GroupLabel>{field.label || field.name}</GroupLabel>
          {field.description && (
            <FieldDescription>{field.description}</FieldDescription>
          )}
        </GroupListMeta>
        {/* @ts-ignore */}
        {!field.visualSelector && (
          <BlockSelector templates={field.templates} addItem={addItem} />
        )}
        {/* @ts-ignore */}
        {field.visualSelector && (
          <BlockSelectorBig
            label={field.label || field.name}
            templates={field.templates}
            addItem={addItem}
          />
        )}
      </GroupListHeader>
      <ListPanel>
        <Droppable droppableId={field.name} type={field.name}>
          {(provider) => (
            <div ref={provider.innerRef} className="edit-page--list-parent">
              {items.length === 0 && <EmptyState />}
              {items.map((block: any, index: any) => {
                const template = field.templates[block._template]

                if (!template) {
                  return (
                    <InvalidBlockListItem
                      // NOTE: Supressing warnings, but not helping with render perf
                      key={index}
                      index={index}
                      field={field}
                      tinaForm={tinaForm}
                    />
                  )
                }

                const itemProps = (item: object) => {
                  if (!template.itemProps) return {}
                  return template.itemProps(item)
                }
                return (
                  <BlockListItem
                    // NOTE: Supressing warnings, but not helping with render perf
                    key={index}
                    block={block}
                    template={template}
                    index={index}
                    field={field}
                    tinaForm={tinaForm}
                    {...itemProps(block)}
                  />
                )
              })}
              {provider.placeholder}
            </div>
          )}
        </Droppable>
      </ListPanel>
    </>
  )
}

interface BlockListItemProps {
  tinaForm: Form
  field: BlocksFieldDefinititon
  index: number
  block: any
  template: BlockTemplate
  label?: string
}

const BlockListItem = ({
  label,
  tinaForm,
  field,
  index,
  template,
  block,
}: BlockListItemProps) => {
  const cms = useCMS()
  const FormPortal = useFormPortal()
  const [isExpanded, setExpanded] = React.useState<boolean>(false)

  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index)
  }, [tinaForm, field, index])

  const { dispatch: setHoveredField } = useEvent<FieldHoverEvent>('field:hover')
  const { dispatch: setFocusedField } = useEvent<FieldFocusEvent>('field:focus')

  return (
    <Draggable
      key={index}
      type={field.name}
      draggableId={`${field.name}.${index}`}
      index={index}
    >
      {(provider, snapshot) => (
        <>
          <ItemHeader provider={provider} isDragging={snapshot.isDragging}>
            <DragHandle isDragging={snapshot.isDragging} />
            <ItemClickTarget
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
              onMouseOver={() =>
                setHoveredField({ fieldName: `${field.name}.${index}` })
              }
              onMouseOut={() => setHoveredField({ fieldName: null })}
            >
              <GroupLabel>{label || template.label}</GroupLabel>
              <BiPencil className="h-5 w-auto fill-current text-gray-200 group-hover:text-inherit transition-colors duration-150 ease-out" />
            </ItemClickTarget>
            <ItemDeleteButton onClick={removeItem} />
          </ItemHeader>
          <FormPortal>
            {({ zIndexShift }) => (
              <Panel
                zIndexShift={zIndexShift}
                isExpanded={isExpanded}
                setExpanded={setExpanded}
                field={field}
                item={block}
                index={index}
                tinaForm={tinaForm}
                label={label || template.label}
                template={template}
              />
            )}
          </FormPortal>
        </>
      )}
    </Draggable>
  )
}

const InvalidBlockListItem = ({
  tinaForm,
  field,
  index,
}: {
  tinaForm: Form
  field: Field
  index: number
}) => {
  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index)
  }, [tinaForm, field, index])

  return (
    <Draggable
      key={index}
      type={field.name}
      draggableId={`${field.name}.${index}`}
      index={index}
    >
      {(provider, snapshot) => (
        <ItemHeader provider={provider} isDragging={snapshot.isDragging}>
          <DragHandle isDragging={snapshot.isDragging} />
          <ItemClickTarget>
            <GroupLabel error>Invalid Block</GroupLabel>
          </ItemClickTarget>
          <ItemDeleteButton onClick={removeItem} />
        </ItemHeader>
      )}
    </Draggable>
  )
}

interface PanelProps {
  setExpanded(next: boolean): void
  isExpanded: boolean
  tinaForm: Form
  index: number
  field: BlocksFieldDefinititon
  item: any
  label: string
  template: BlockTemplate
  zIndexShift: number
}

const Panel = function Panel({
  setExpanded,
  isExpanded,
  tinaForm,
  field,
  index,
  label,
  template,
  zIndexShift,
}: PanelProps) {
  const cms = useCMS()

  const fields: any[] = React.useMemo(() => {
    if (!template.fields) return []

    return template.fields.map((subField: any) => ({
      ...subField,
      name: `${field.name}.${index}.${subField.name}`,
    }))
  }, [field.name, index, template.fields])

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
        {label}
      </PanelHeader>
      <PanelBody id={tinaForm.id}>
        {/* RENDER OPTIMIZATION: Only render fields of expanded fields.  */}
        {isExpanded ? <FieldsBuilder form={tinaForm} fields={fields} /> : null}
      </PanelBody>
    </GroupPanel>
  )
}

export const BlocksField = Blocks

export const BlocksFieldPlugin = {
  name: 'blocks',
  Component: BlocksField,
}
