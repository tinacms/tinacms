import * as React from 'react'
import { Field, Form } from '@tinacms/core'
import styled from 'styled-components'
import { FieldsBuilder } from '@tinacms/form-builder'
import { padding } from '@tinacms/styles'
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
  let addItem = React.useCallback(() => {
    let obj = field.defaultItem || {}
    form.mutators.insert(field.name, 0, obj)
  }, [form, field])

  let items = input.value || []

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
            {provider => (
              <ul ref={provider.innerRef} className="edit-page--list-parent">
                {items.map((item: any, index: any) => (
                  <Item
                    key={item[field.key]}
                    tinaForm={tinaForm}
                    field={field}
                    item={item}
                    index={index}
                  />
                ))}
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
  field: GroupFieldDefinititon
  index: number
  item: any
}

const Item = ({ tinaForm, field, index, item, ...p }: ItemProps) => {
  let [isExpanded, setExpanded] = React.useState<boolean>(false)
  let removeItem = React.useCallback(() => {
    tinaForm.finalForm.mutators.remove(field.name, 0)
  }, [tinaForm, field])
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
              <GroupLabel>
                {item.alt || field.label || field.name}
                {item.alt ? '' : ' Item'}
              </GroupLabel>
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
            itemTitle={
              item.alt ? item.alt : (field.label || field.name) + ' Item'
            }
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
  let fields: any[] = React.useMemo(() => {
    return field.fields.map((subField: any) => ({
      ...subField,
      name: `${field.name}.${index}.${subField.name}`,
    }))
  }, [field.fields])

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

interface GroupFieldProps {
  field: Field
}

export default {
  name: 'group-list',
  Component: Group,
}
