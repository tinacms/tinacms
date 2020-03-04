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
import { Field, Form } from '@tinacms/forms'
import styled, { css } from 'styled-components'
import { FieldsBuilder } from '@tinacms/form-builder'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import {
  AddIcon,
  DragIcon,
  ReorderIcon,
  TrashIcon,
  LeftArrowIcon,
} from '@tinacms/icons'
import { GroupPanel, PanelHeader, PanelBody } from './GroupFieldPlugin'
import { Dismissible } from 'react-dismissible'
import {
  padding,
  color,
  radius,
  font,
  IconButton,
  shadow,
} from '@tinacms/styles'
import { useFormPortal } from '../../components/form/FormPortal'

export interface BlocksFieldDefinititon extends Field {
  component: 'blocks'
  templates: {
    [key: string]: BlockTemplate
  }
}

export interface BlockTemplate {
  type: string
  label: string
  defaultItem?: object | (() => object)
  key: string
  fields: Field[]
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

interface BlockFieldProps {
  input: any
  meta: any
  field: BlocksFieldDefinititon
  form: any
  tinaForm: Form
}

const Blocks = function({ tinaForm, form, field, input }: BlockFieldProps) {
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

  const [visible, setVisible] = React.useState(false)
  return (
    <>
      <GroupListHeader>
        <GroupLabel>{field.label || field.name}</GroupLabel>
        <IconButton
          onClick={() => setVisible(true)}
          open={visible}
          primary
          small
        >
          <AddIcon />
        </IconButton>
        <BlockMenu open={visible}>
          <Dismissible
            click
            escape
            onDismiss={() => setVisible(false)}
            disabled={!visible}
          >
            <BlockMenuList>
              {Object.entries(field.templates).map(([name, template]) => (
                <BlockOption
                  key={name}
                  onClick={() => {
                    addItem(name, template)
                    setVisible(false)
                  }}
                >
                  {template.label}
                </BlockOption>
              ))}
            </BlockMenuList>
          </Dismissible>
        </BlockMenu>
      </GroupListHeader>
      <GroupListPanel>
        <ItemList>
          <Droppable droppableId={field.name} type={field.name}>
            {provider => (
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
        </ItemList>
      </GroupListPanel>
    </>
  )
}

const EmptyState = () => <EmptyList>There are no items</EmptyList>

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
  const FormPortal = useFormPortal()
  const [isExpanded, setExpanded] = React.useState<boolean>(false)

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
        <>
          <ItemHeader
            ref={provider.innerRef}
            isDragging={snapshot.isDragging}
            {...provider.draggableProps}
            {...provider.dragHandleProps}
          >
            <DragHandle />
            <ItemClickTarget onClick={() => setExpanded(true)}>
              <GroupLabel>{label || template.label}</GroupLabel>
            </ItemClickTarget>
            <DeleteButton onClick={removeItem}>
              <TrashIcon />
            </DeleteButton>
          </ItemHeader>
          <FormPortal>
            <Panel
              isExpanded={isExpanded}
              setExpanded={setExpanded}
              field={field}
              item={block}
              index={index}
              tinaForm={tinaForm}
              label={label || template.label}
              template={template}
            />
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
        <ItemHeader
          ref={provider.innerRef}
          isDragging={snapshot.isDragging}
          {...provider.draggableProps}
          {...provider.dragHandleProps}
        >
          <DragHandle />
          <ItemClickTarget>
            <GroupLabel error>Invalid Block</GroupLabel>
          </ItemClickTarget>
          <DeleteButton onClick={removeItem}>
            <TrashIcon />
          </DeleteButton>
        </ItemHeader>
      )}
    </Draggable>
  )
}

const EmptyList = styled.div`
  text-align: center;
  border-radius: ${radius('small')};
  background-color: ${color.grey(2)};
  color: ${color.grey(4)};
  line-height: 1.35;
  padding: 12px 0;
  font-size: ${font.size(2)};
  font-weight: 500;
`

const BlockMenu = styled.div<{ open: boolean }>`
  min-width: 192px;
  border-radius: ${radius()};
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 100% 0;
  box-shadow: ${shadow('big')};
  background-color: white;
  overflow: hidden;
  z-index: 100;
  ${props =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 36px, 0) scale3d(1, 1, 1);
    `};
`

const BlockMenuList = styled.div`
  display: flex;
  flex-direction: column;
`

const BlockOption = styled.button`
  position: relative;
  text-align: center;
  font-size: ${font.size(0)};
  padding: ${padding('small')};
  font-weight: 500;
  width: 100%;
  background: none;
  cursor: pointer;
  outline: none;
  border: 0;
  transition: all 85ms ease-out;
  &:hover {
    color: ${color.primary()};
    background-color: #f6f6f9;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }
`

const ItemClickTarget = styled.div`
  flex: 1 1 0;
  min-width: 0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
`

const GroupLabel = styled.span<{ error?: boolean }>`
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

  ${props =>
    props.error &&
    css`
      color: ${color.error()} !important;
    `};
`

const GroupListHeader = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
  ${GroupLabel} {
    font-size: ${font.size(3)};
  }
`

const GroupListPanel = styled.div`
  max-height: initial;
  position: relative;
  height: auto;
  margin-bottom: 24px;
  border-radius: ${radius('small')};
  background-color: ${color.grey(2)};
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
    width: 20px;
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
    border-radius: 4px 4px 0 0;
  }

  &:nth-last-child(2) {
    border-radius: 0 0 4px 4px;
    &:first-child {
      border-radius: ${radius('small')};
    }
  }

  ${p =>
    p.isDragging &&
    css<any>`
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
  padding: 12px 8px;
  margin: 0;
  transition: all 85ms ease-out;
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
  width: 32px;
  position: relative;
  fill: inherit;
  padding: 12px 0;
  transition: all 85ms ease-out;
  &:hover {
    background-color: #f6f6f9;
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
  field: BlocksFieldDefinititon
  item: any
  label: string
  template: BlockTemplate
}

const Panel = function Panel({
  setExpanded,
  isExpanded,
  tinaForm,
  field,
  index,
  label,
  template,
}: PanelProps) {
  const fields: any[] = React.useMemo(() => {
    return template.fields.map((subField: any) => ({
      ...subField,
      name: `${field.name}.${index}.${subField.name}`,
    }))
  }, [field.name, index, template.fields])

  return (
    <GroupPanel isExpanded={isExpanded}>
      <PanelHeader onClick={() => setExpanded(false)}>
        <LeftArrowIcon />
        <GroupLabel>{label}</GroupLabel>
      </PanelHeader>
      <PanelBody>
        {/* RENDER OPTIMIZATION: Only render fields of expanded fields.  */}
        {isExpanded ? <FieldsBuilder form={tinaForm} fields={fields} /> : null}
      </PanelBody>
    </GroupPanel>
  )
}

export default {
  name: 'blocks',
  Component: Blocks,
}
