import * as React from 'react'
import { Field, Form } from '@tinacms/core'
import styled, { keyframes, css } from 'styled-components'
import { FieldsBuilder } from '@tinacms/form-builder'
import { padding } from '@tinacms/styles'
import { LeftArrowIcon, RightArrowIcon } from '@tinacms/icons'
import {
  SIDEBAR_HEADER_HEIGHT,
  SIDEBAR_WIDTH,
  FORM_HEADER_HEIGHT,
  FORM_FOOTER_HEIGHT,
} from '../../Globals'

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
        {/* {isExpanded ? <FieldsBuilder form={tinaForm} fields={fields} /> : null} */}
        <FieldsBuilder form={tinaForm} fields={fields} />
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
  background: white;
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
  background: white;
  position: relative;
  display: flex;
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

const GroupPanelKeyframes = keyframes`
  0% {
    transform: translate3d( 100%, 0, 0 );
  }
  100% {
    transform: translate3d( 0, 0, 0 );
  }
`

export const GroupPanel = styled.div<{ isExpanded: boolean }>`
  position: fixed;
  width: ${SIDEBAR_WIDTH}px;
  top: ${SIDEBAR_HEADER_HEIGHT + FORM_HEADER_HEIGHT}rem;
  bottom: ${FORM_FOOTER_HEIGHT}rem;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  z-index: 50;
  pointer-events: ${p => (p.isExpanded ? 'all' : 'none')};

  > * {
    ${p =>
      p.isExpanded &&
      css`
        animation-name: ${GroupPanelKeyframes};
        animation-duration: 150ms;
        animation-delay: 0;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
        animation-fill-mode: backwards;
      `};

    ${p =>
      !p.isExpanded &&
      css`
        transition: transform 150ms ease-out;
        transform: translate3d(100%, 0, 0);
      `};
  }
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
