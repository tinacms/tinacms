import * as React from 'react'
import { Field, Form } from '@tinacms/core'
import styled from 'styled-components'
import { FieldsBuilder } from '@tinacms/form-builder'
import { padding } from '@tinacms/styles'
import { LeftArrowIcon, RightArrowIcon } from '@tinacms/icons'

export interface GroupFieldDefinititon extends Field {
  component: 'group'
  fields: Field[]
}

export interface GroupProps {
  input: any
  meta: any
  field: GroupFieldDefinititon
  form: any
  tinaForm: Form
}

export const Group = function Group({
  tinaForm,
  form,
  field,
  input,
  meta,
}: GroupProps) {
  let [isExpanded, setExpanded] = React.useState<boolean>(false)
  return (
    <>
      <Header onClick={() => setExpanded(p => !p)}>
        {Label(field)}
        <RightArrowIcon />
      </Header>
      <Panel
        isExpanded={isExpanded}
        setExpanded={setExpanded}
        field={field}
        tinaForm={tinaForm}
      />
    </>
  )
}

interface PanelProps {
  setExpanded(next: boolean): void
  isExpanded: boolean
  tinaForm: Form
  field: GroupFieldDefinititon
  children?: any
}
const Panel = function Panel({
  setExpanded,
  isExpanded,
  tinaForm,
  field,
  children,
}: PanelProps) {
  let fields: any[] = React.useMemo(() => {
    return field.fields.map((subField: any) => ({
      ...subField,
      name: `${field.name}.${subField.name}`,
    }))
  }, [field.fields])

  return (
    <GroupPanel isExpanded={isExpanded}>
      <PanelHeader onClick={() => setExpanded(false)}>
        <LeftArrowIcon /> {Label(field)}
      </PanelHeader>
      <PanelBody>
        {isExpanded ? <FieldsBuilder form={tinaForm} fields={fields} /> : null}
      </PanelBody>
    </GroupPanel>
  )
}

const Label = function(field: GroupFieldDefinititon) {
  return <GroupLabel>{field.label || field.name}</GroupLabel>
}

const Header = styled.div`
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e1e1e1;
  border-radius: 0.25rem;
  margin: 0 0 1.5rem 0;
  overflow: visible;
  line-height: 1.35;
  padding: 0.75rem;
  color: #282828;

  svg {
    width: 1.25rem;
    height: auto;
    fill: #b4b4b4;
    transition: all 85ms ease-out;
  }

  &:hover {
    color: #0084ff;
  }
`

export const PanelHeader = styled(Header)`
  flex: 0 0 auto;
  justify-content: flex-start;
  border: none;
  border-bottom: 1px solid #efefef;
  margin: 0;
  padding: 0.75rem 1.25rem;

  svg {
    transform: translate3d(-4px, 0, 0);
  }

  &:hover {
    svg {
      transform: translate3d(-7px, 0, 0);
    }
  }
`

export const PanelBody = styled.div`
  position: relative;
  display: block;
  flex: 1 1 auto;
  overflow-y: auto;
`

const GroupLabel = styled.span`
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: inherit;
  transition: all 85ms ease-out;
`

export const GroupPanel = styled.div<{ isExpanded: boolean }>`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform: translate3d(${p => (p.isExpanded ? '0' : '100%')}, 0, 0);
  overflow-y: hidden;
  overflow-x: hidden;
  background: white;
  z-index: 50;
  transition: transform 250ms ease-out;
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
