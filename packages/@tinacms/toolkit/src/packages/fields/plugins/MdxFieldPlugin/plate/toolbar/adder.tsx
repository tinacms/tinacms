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
import { Field, Form } from '../../../../../forms'
import styled, { keyframes, css, StyledComponent } from 'styled-components'
import { Dismissible } from '../../../../../react-dismissible'

export interface MdxFieldFieldDefinititon extends Field {
  component: 'group'
  fields: Field[]
}

export interface MdxFieldProps {
  field: MdxFieldFieldDefinititon
  tinaForm: Form
  inline?: boolean
}

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

export const PopupAdder = ({ icon, showButton, onAdd, templates }) => {
  const [visible, setVisible] = React.useState(false)
  return (
    <span style={{ position: 'relative' }}>
      {!showButton ? (
        <span />
      ) : (
        <button
          onClick={(event: any) => {
            event.stopPropagation()
            event.preventDefault()
            setVisible(true)
          }}
        >
          {icon}
        </button>
      )}
      <BlockMenu open={visible}>
        <Dismissible
          click
          escape
          onDismiss={() => setVisible(false)}
          disabled={!visible}
        >
          <BlockMenuList>
            {templates.length > 0 ? (
              templates.map((template) => (
                <BlockOption
                  key={template.name}
                  onClick={() => {
                    onAdd(template)
                    setVisible(false)
                  }}
                >
                  {template.label}
                </BlockOption>
              ))
            ) : (
              <BlockOption>No templates provided </BlockOption>
            )}
          </BlockMenuList>
        </Dismissible>
      </BlockMenu>
    </span>
  )
}

const BlockMenu = styled.div<{ open: boolean }>`
  min-width: 192px;
  border-radius: var(--tina-radius-big);
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
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;
  z-index: var(--tina-z-index-1);
  ${(props) =>
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
  font-size: var(--tina-font-size-0);
  padding: var(--tina-padding-small);
  font-weight: var(--tina-font-weight-regular);
  width: 100%;
  background: none;
  cursor: pointer;
  outline: none;
  border: 0;
  transition: all 85ms ease-out;
  &:hover {
    color: var(--tina-color-primary);
    background-color: var(--tina-color-grey-1);
  }
  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }
`
interface PanelProps {
  setExpanded(next: boolean): void
  isExpanded: boolean
  tinaForm: Form
  field: MdxFieldFieldDefinititon
}
