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
import { useFormPortal, FormBuilder } from '../../../../../form-builder'
import { LeftArrowIcon, RightArrowIcon } from '../../../../../icons'
import { BiPencil } from 'react-icons/bi'

interface MdxFieldFieldDefinititon extends Field {
  component: 'group'
  fields: Field[]
}

interface MdxFieldProps {
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
        <InlineHeader onClick={() => setExpanded(!isExpanded)}>
          {field.label || field.name}
        </InlineHeader>
      ) : (
        <Header onClick={() => setExpanded(!isExpanded)}>
          {field.label || field.name}
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

const InlineHeader = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="group mx-0.5 px-2 py-0.5 bg-white hover:bg-gray-50 shadow focus:shadow-outline focus:border-blue-500 border border-gray-100 hover:border-gray-200 text-gray-500 hover:text-blue-400 focus:text-blue-500 rounded-md inline-flex justify-between items-center gap-2"
    >
      <span className="text-left font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1">
        {children}
      </span>{' '}
      <BiPencil className="h-5 w-auto transition-opacity duration-150 ease-out opacity-80 group-hover:opacity-90" />
    </button>
  )
}

const Header = ({ onClick, children }) => {
  return (
    <div className="pt-1 mb-5">
      <button
        onClick={onClick}
        className="group px-4 py-3 bg-white hover:bg-gray-50 shadow focus:shadow-outline focus:border-blue-500 w-full border border-gray-100 hover:border-gray-200 text-gray-500 hover:text-blue-400 focus:text-blue-500 rounded-md flex justify-between items-center gap-2"
      >
        <span className="text-left font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1">
          {children}
        </span>{' '}
        <BiPencil className="h-6 w-auto transition-opacity duration-150 ease-out opacity-80 group-hover:opacity-90" />
      </button>
    </div>
  )
}

const PanelHeader = styled.div`
  position: relative;
  width: 100%;
  cursor: pointer;
  background-color: white;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 6px 18px 6px 18px;
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

const MdxFieldPanel = styled.div<{ isExpanded: boolean }>`
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

interface PanelProps {
  setExpanded(next: boolean): void
  isExpanded: boolean
  tinaForm: Form
  field: MdxFieldFieldDefinititon
}
