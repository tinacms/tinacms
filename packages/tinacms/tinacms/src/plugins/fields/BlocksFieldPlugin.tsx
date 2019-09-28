import * as React from 'react'
import { Field, Form } from '@tinacms/core'
import styled from 'styled-components'
import { FieldsBuilder } from '@tinacms/form-builder'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { Button } from '../../components/Button'
import {
  AddIcon,
  DragIcon,
  ReorderIcon,
  TrashIcon,
  LeftArrowIcon,
} from '@tinacms/icons'
import { GroupPanel, PanelHeader, PanelBody } from './GroupFieldPlugin'
import { Dismissible } from 'react-dismissible'

interface BlocksFieldDefinititon extends Field {
  component: 'blocks'
  defaultItem: object
  templates: {
    [key: string]: BlockTemplate
  }
}

interface BlockTemplate {
  label: string
  defaultItem: object
  key: string
  fields: Field[]
}

interface BlockFieldProps {
  input: any
  meta: any
  field: BlocksFieldDefinititon
  form: any
  tinaForm: Form
}

const Blocks = function Group({
  tinaForm,
  form,
  field,
  input,
}: BlockFieldProps) {
  let addItem = React.useCallback(
    (name, template) => {
      let obj = template.defaultItem || {}
      obj._template = name
      form.mutators.insert(field.name, 0, obj)
    },
    [form]
  )

  let items = input.value || []

  let [visible, setVisible] = React.useState(false)
  return (
    <>
      <GroupListHeader>
        <GroupLabel>{field.label || field.name}</GroupLabel>
        <GroupHeaderButton onClick={() => setVisible(true)}>
          <AddIcon />
        </GroupHeaderButton>
      </GroupListHeader>
      {visible && (
        <Dismissible click escape onDismiss={() => setVisible(false)}>
          <ul>
            {Object.entries(field.templates).map(([name, template]) => (
              <li
                onClick={() => {
                  addItem(name, template)
                  setVisible(false)
                }}
              >
                {template.label}
              </li>
            ))}
          </ul>
        </Dismissible>
      )}
      <GroupListPanel>
        <ItemList>
          <Droppable droppableId={field.name} type={field.name}>
            {provider => (
              <ul ref={provider.innerRef} className="edit-page--list-parent">
                {items.map((block: any, index: any) => {
                  let template = field.templates[block._template]
                  if (!template) {
                    // TODO: if no template return invalid entry
                  }

                  return (
                    <BlockListItem
                      // TODO: Find beter solution for `key`. Using a value from the
                      // block will cause the panel to close if the key property is changed.
                      key={index}
                      block={block}
                      template={template}
                      index={index}
                      field={field}
                      tinaForm={tinaForm}
                    />
                  )
                })}
                {provider.placeholder}
              </ul>
            )}
          </Droppable>
        </ItemList>
      </GroupListPanel>
    </>
  )
}

interface ItemProps {
  tinaForm: Form
  field: BlocksFieldDefinititon
  index: number
  block: any
  template: BlockTemplate
}

const BlockListItem = ({
  tinaForm,
  field,
  index,
  template,
  block,
  ...p
}: ItemProps) => {
  let [isExpanded, setExpanded] = React.useState<boolean>(false)

  let removeItem = React.useCallback(() => {
    tinaForm.finalForm.mutators.remove(field.name, index)
  }, [tinaForm, field, index])

  let label = block[template.key] || template.label

  return (
    <Draggable
      key={index}
      type={field.name}
      draggableId={`${field.name}.${index}`}
      index={index}
    >
      {provider => (
        <>
          <ItemHeader
            ref={provider.innerRef}
            {...provider.draggableProps}
            {...provider.dragHandleProps}
            {...p}
          >
            <DragHandle />
            <ItemClickTarget onClick={() => setExpanded(true)}>
              <GroupLabel>{label}</GroupLabel>
            </ItemClickTarget>
            <DeleteButton onClick={removeItem}>
              <TrashIcon />
            </DeleteButton>
          </ItemHeader>
          <Panel
            isExpanded={isExpanded}
            setExpanded={setExpanded}
            field={field}
            item={block}
            index={index}
            tinaForm={tinaForm}
            itemTitle={label}
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
  flex: 1 0 auto;
  color: inherit;
  transition: all 85ms ease-out;
  text-align: left;
  max-width: calc(100% - 2.25rem);
  overflow: hidden;
  text-overflow: ellipsis;
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
  border-radius: 0.25rem;
  background-color: #f2f2f2;
`

const GroupHeaderButton = styled(Button)`
  border-radius: 10rem;
  padding: 0;
  width: 2rem;
  height: 2rem;
  margin: -0.125rem 0;
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

const ItemList = styled.div``

const ItemHeader = styled.div`
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  background-color: white;
  border: 1px solid #e1e1e1;
  margin: 0 0 -1px 0;
  overflow: visible;
  line-height: 1.35;
  padding: 0;
  color: #282828;
  fill: #b4b4b4;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 85ms ease-out;

  ${GroupLabel} {
    align-self: center;
    max-width: 100%;
  }

  svg {
    fill: inherit;
    width: 1.25rem;
    height: auto;
    transition: fill 85ms ease-out;
  }

  &:hover {
    color: #0084ff;
    fill: #353232;
    ${GroupLabel} {
      color: inherit;
    }
  }

  &:first-child {
    border-radius: 0.25rem 0.25rem 0 0;
  }

  &:nth-last-child(2) {
    border-radius: 0 0 0.25rem 0.25rem;
    &:first-child {
      border-radius: 0.25rem;
    }
  }
`

const DeleteButton = styled.button`
  text-align: center;
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0.75rem 0.5rem;
  transition: all 85ms ease-out;
  &:hover {
    background-color: #f2f2f2;
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
    background-color: #f2f2f2;
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
  field: BlocksFieldDefinititon
  item: any
  itemTitle: string
}

const Panel = function Panel({
  setExpanded,
  isExpanded,
  tinaForm,
  field,
  index,
  item,
  itemTitle,
}: PanelProps) {
  let fields: any[] = React.useMemo(() => {
    let template = field.templates[item._template]
    if (!template) return []
    return template.fields.map((subField: any) => ({
      ...subField,
      name: `${field.name}.${index}.${subField.name}`,
    }))
  }, [field.templates, item._template])

  return (
    <GroupPanel isExpanded={isExpanded}>
      <PanelHeader onClick={() => setExpanded(false)}>
        <LeftArrowIcon />
        <GroupLabel>{itemTitle || field.label || field.name}</GroupLabel>
      </PanelHeader>
      <PanelBody>
        {isExpanded ? <FieldsBuilder form={tinaForm} fields={fields} /> : null}
      </PanelBody>
    </GroupPanel>
  )
}

export default {
  name: 'blocks',
  Component: Blocks,
}
