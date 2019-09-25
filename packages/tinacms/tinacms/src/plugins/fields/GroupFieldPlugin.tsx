import * as React from 'react'
import { Field, Form } from '@tinacms/core'
import styled from 'styled-components'
import { FieldsBuilder } from '@tinacms/form-builder'
import { padding } from '@tinacms/styles'

export interface GroupFieldDefinititon extends Field {
  component: 'group'
  fields: Field[]
}

export interface GroupProps {
  input: any
  meta: any
  field: GroupFieldDefinititon
  form: Form
}

export const Group = styled(function Group({
  form,
  field,
  input,
  meta,
  ...styleProps
}: GroupProps) {
  let [isExpanded, setExpanded] = React.useState<boolean>(false)
  return (
    <div {...styleProps}>
      <Header onClick={() => setExpanded(p => !p)}>
        <label>{field.label || field.name}</label>
      </Header>

      <Panel
        isExpanded={isExpanded}
        setExpanded={setExpanded}
        field={field}
        form={form}
      />
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

interface PanelProps {
  setExpanded(next: boolean): void
  isExpanded: boolean
  form: Form
  field: GroupFieldDefinititon
}

const Panel = styled(function Panel({
  setExpanded,
  isExpanded,
  form,
  field,
  ...styleProps
}: PanelProps) {
  let fields: any[] = React.useMemo(() => {
    return field.fields.map((subField: any) => ({
      ...subField,
      name: `${field.name}.${subField.name}`,
    }))
  }, [field.fields])

  return (
    <div {...styleProps}>
      <button onClick={() => setExpanded(false)}>Back</button>
      {isExpanded ? <FieldsBuilder form={form} fields={fields} /> : null}
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

export interface GroupFieldProps {
  field: Field
}

export function GroupField(props: GroupFieldProps) {
  return <div>Subfield: {props.field.label || props.field.name}</div>
}

export default {
  name: 'group',
  Component: Group,
}
