import * as React from 'react'
import { Field, Form } from '@tinacms/core'
import styled from 'styled-components'
import { FieldsBuilder } from '@tinacms/form-builder'
import { padding } from '@tinacms/styles'
import { Droppable, DropResult, Draggable } from 'react-beautiful-dnd'
import { Button } from '../../components/Button'

interface GroupFieldDefinititon extends Field {
  component: 'group'
  fields: Field[]
}

interface GroupProps {
  input: any
  meta: any
  field: GroupFieldDefinititon
  form: any
  tinaForm: Form
}

const Group = styled(function Group({
  tinaForm,
  form,
  field,
  input,
  meta,
  ...styleProps
}: GroupProps) {
  let addItem = React.useCallback(() => {
    alert('TODO')
  }, [])

  let items = input.value
  return (
    <div {...styleProps}>
      <Header>
        <label>{field.label || field.name}</label>
      </Header>
      <GroupListPanel>
        <div>
          <GroupHeaderButton onClick={addItem}>Add</GroupHeaderButton>
        </div>
        <ItemList>
          <Droppable droppableId={field.name} type={field.name}>
            {provider => (
              <ul ref={provider.innerRef} className="edit-page--list-parent">
                {items.map((item: any, index: any) => (
                  <Item
                    tinaForm={tinaForm}
                    field={field}
                    item={items[index]}
                    index={index}
                  />
                ))}
              </ul>
            )}
          </Droppable>
        </ItemList>
      </GroupListPanel>
    </div>
  )
})`
  border: 1px solid pink;
  border-radius: 0.3rem;
  margin: 1.5rem 0;
  transition: background 0.15s ease;
  overflow: visible;
`

const Header = styled.div`
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  > label {
    flex: 1;
    margin: 0;
    cursor: pointer;
    text-transform: none;
    font-size: 0.85rem;
    font-weight: 500;
    color: #282828;
    padding: 1.5rem;
    overflow-x: hidden;

    > div {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow-x: hidden;
    }

    &.multiLine {
      padding: calc(1.5rem - 10px) 0 calc(1.5rem - 9px) 1.5rem;
    }

    .move-icon + label {
      padding: 1.5rem 0;
    }
  }

  .move-icon {
    cursor: move;
    line-height: 0;
    padding: 1.5rem;
  }

  .delete {
    margin-left: auto;
    opacity: 0.6;
    line-height: 0;
    padding: 1.5rem;

    &:hover {
      opacity: 1;
      color: $error;
    }
  }
`

const GroupListPanel = styled.div`
  max-height: initial;
  position: relative;
  border-left: 0px;

  position: initial;
  height: auto;

  top: 4rem;
`

const GroupHeaderButton = styled(Button)`
  align-self: center !important;
  margin: 0 1.5rem;
`

const ItemList = styled.div`
overflow: auto;
padding: 1rem 1.5rem 1.5rem 1.5rem;
height: auto;

> ul > ${Group} {
  background-color: white;
  margin: 1rem 0;
  width: 100%;
  border: 1px solid #f3f3f3;
  border-radius: 0.15rem;
}
}`

const Item = styled(({ tinaForm, field, index, item, ...p }) => {
  let [isExpanded, setExpanded] = React.useState<boolean>(false)
  return (
    <Draggable
      key={index}
      type={field.name}
      draggableId={`${field.name}.${index}`}
      index={index}
    >
      {provider => (
        <>
          <Header
            ref={provider.innerRef}
            {...provider.draggableProps}
            {...provider.dragHandleProps}
            {...p}
          >
            <div>Drag Handle</div>
            <label onClick={() => setExpanded(true)}>
              {/* This is hardcoded because I know it's in the blog-post.js template */}
              {item.alt}
            </label>
            <button>Delette</button>
          </Header>
          <Panel
            isExpanded={isExpanded}
            setExpanded={setExpanded}
            field={field}
            index={index}
            tinaForm={tinaForm}
          />
        </>
      )}
    </Draggable>
  )
})`
  border: 1px solid pink;
`

interface PanelProps {
  setExpanded(next: boolean): void
  isExpanded: boolean
  tinaForm: Form
  index: number
  field: GroupFieldDefinititon
}

const Panel = styled(function Panel({
  setExpanded,
  isExpanded,
  tinaForm,
  index,
  field,
  ...styleProps
}: PanelProps) {
  let fields: any[] = React.useMemo(() => {
    return field.fields.map((subField: any) => ({
      ...subField,
      name: `${field.name}.${index}.${subField.name}`,
    }))
  }, [field.fields])

  return (
    <div {...styleProps}>
      <button onClick={() => setExpanded(false)}>Back</button>
      {isExpanded ? <FieldsBuilder form={tinaForm} fields={fields} /> : null}
    </div>
  )
})`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 4rem;
  left: ${p => (p.isExpanded ? '0' : 'calc(100% - 0px)')};
  overflow-y: auto;
  background: white;
  padding: ${padding()}rem;
  z-index: 500;
  transition: left 0.35s ease, max-height 0.5s ease;
`

interface GroupFieldProps {
  field: Field
}

export default {
  name: 'group-list',
  Component: Group,
  defaultValue: [],
}
