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
import styled, { keyframes, css, StyledComponent } from 'styled-components'
import { useFormPortal, FormBuilder } from '../../.././form-builder'
import { LeftArrowIcon, RightArrowIcon } from '../../../icons'
import { Dismissible } from 'react-dismissible'

export interface MdxFieldFieldDefinititon extends Field {
  component: 'group'
  fields: Field[]
}

export interface MdxFieldProps {
  field: MdxFieldFieldDefinititon
  tinaForm: Form
  inline?: boolean
}

export const MdxField = ({ inline, tinaForm, field }: MdxFieldProps) => {
  const [isExpanded, setExpanded] = React.useState<boolean>(false)
  if (!field) {
    return null
  }
  return (
    <>
      {inline ? (
        <SpanHeader onClick={() => setExpanded(!isExpanded)}>
          {field.label || field.name}
        </SpanHeader>
      ) : (
        <Header onClick={() => setExpanded(!isExpanded)}>
          {field.label || field.name}
          <RightArrowIcon />
        </Header>
      )}
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
  field: MdxFieldFieldDefinititon
  children?: any
}
const Panel = function Panel({
  setExpanded,
  isExpanded,
  tinaForm,
  field,
}: PanelProps) {
  const FormPortal = useFormPortal()
  return (
    <FormPortal>
      {({ zIndexShift }) => (
        <MdxFieldPanel
          isExpanded={isExpanded}
          style={{ zIndex: zIndexShift + 1000 }}
        >
          <PanelHeader onClick={() => setExpanded(false)}>
            <LeftArrowIcon /> <span>{field.label || field.name}</span>
          </PanelHeader>
          <PanelBody>
            {isExpanded ? (
              <FormBuilder form={tinaForm} hideFooter={true} />
            ) : null}
          </PanelBody>
        </MdxFieldPanel>
      )}
    </FormPortal>
  )
}

const SpanHeader: StyledComponent<'span', {}, {}> = styled.span`
  position: relative;
  cursor: pointer;
  border: 1px solid var(--tina-color-grey-3);
  border-left: 3px solid var(--tina-color-primary);
  border-radius: var(--tina-radius-small);
  overflow: visible;
  line-height: 1.35;
  padding: 2px 8px;
  color: var(--tina-color-grey-10);
  background-color: white;

  svg {
    width: 24px;
    height: auto;
    fill: var(--tina-color-grey-3);
    transition: all var(--tina-timing-short) ease-out;
  }

  &:hover {
    svg {
      fill: var(--tina-color-grey-8);
    }
    color: #0084ff;
  }
`

const Header: StyledComponent<'div', {}, {}> = styled.div`
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--tina-color-grey-2);
  border-left: 3px solid var(--tina-color-primary);
  border-radius: var(--tina-radius-small);
  overflow: visible;
  line-height: 1.35;
  padding: 12px;
  margin: 8px 0;
  color: var(--tina-color-grey-10);
  background-color: white;

  svg {
    width: 24px;
    height: auto;
    fill: var(--tina-color-grey-3);
    transition: all var(--tina-timing-short) ease-out;
  }

  &:hover {
    svg {
      fill: var(--tina-color-grey-8);
    }
    color: #0084ff;
  }
`

const PanelHeader = styled.div`
  position: relative;
  width: 100%;
  cursor: pointer;
  background-color: white;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 6px 18px 6px 18px;
  color: inherit;
  font-size: var(--tina-font-size-3);
  transition: color var(--tina-timing-medium) ease-out;
  user-select: none;
  border-bottom: 1px solid var(--tina-color-grey-2);
  margin: 0;
  span {
    flex: 1 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  svg {
    flex: 0 0 auto;
    width: 24px;
    fill: var(--tina-color-grey-3);
    height: auto;
    transform: translate3d(-4px, 0, 0);
    transition: transform var(--tina-timing-medium) ease-out;
  }
  :hover {
    color: var(--tina-color-primary);
    svg {
      fill: var(--tina-color-grey-8);
      transform: translate3d(-7px, 0, 0);
      transition: transform var(--tina-timing-medium) ease-out;
    }
  }
`

const PanelBody = styled.div`
  background: var(--tina-color-grey-1);
  position: relative;
  flex-direction: column;
  display: flex;
  flex: 1 1 auto;
  overflow-y: auto;
`

const MdxFieldPanelKeyframes = keyframes`
  0% {
    transform: translate3d( 100%, 0, 0 );
  }
  100% {
    transform: translate3d( 0, 0, 0 );
  }
`

export const MdxFieldPanel = styled.div<{ isExpanded: boolean }>`
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  z-index: var(--tina-z-index-1);
  pointer-events: ${(p) => (p.isExpanded ? 'all' : 'none')};

  > * {
    ${(p) =>
      p.isExpanded &&
      css`
        animation-name: ${MdxFieldPanelKeyframes};
        animation-duration: 150ms;
        animation-delay: 0;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
        animation-fill-mode: backwards;
      `};

    ${(p) =>
      !p.isExpanded &&
      css`
        transition: transform 150ms ease-out;
        transform: translate3d(100%, 0, 0);
      `};
  }
`

export interface MdxFieldFieldProps {
  field: Field
}

export function MdxFieldField(props: MdxFieldFieldProps) {
  return <div>Subfield: {props.field.label || props.field.name}</div>
}

export const MdxFieldPlugin = {
  name: 'mdx-field',
  Component: MdxField,
}

export const HeaderPopup = ({ children, icon }) => {
  const [visible, setVisible] = React.useState(false)
  return (
    <span
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '28px',
        height: '24px',
      }}
    >
      {false ? (
        <span />
      ) : (
        <Button
          onClick={(event: any) => {
            event.stopPropagation()
            event.preventDefault()
            setVisible(true)
          }}
        >
          {icon}
        </Button>
      )}
      <BlockMenu open={visible}>
        <Dismissible
          click
          escape
          onDismiss={() => setVisible(false)}
          disabled={!visible}
        >
          <BlockMenuList>{children}</BlockMenuList>
        </Dismissible>
      </BlockMenu>
    </span>
  )
}

const Button = styled.button`
  svg {
    width: 20px;
    height: 20px;
  }
`

const BlockMenu = styled.div<{ open: boolean }>`
  width: 50px;
  /* border-radius: var(--tina-radius-big); */
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 0 0;
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;
  z-index: var(--tina-z-index-1);
  padding: 8px;
  ${(props) =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 36px, 0) scale3d(1, 1, 1);
    `};
`

const BlockMenuList = styled.div`
  /* display: flex;
  flex-direction: column; */
`

interface PanelProps {
  setExpanded(next: boolean): void
  isExpanded: boolean
  tinaForm: Form
  field: MdxFieldFieldDefinititon
}
