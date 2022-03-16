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
import { Form } from '../../../../../forms'
import styled, { keyframes, css, StyledComponent } from 'styled-components'
import { useFormPortal, FormBuilder } from '../../../../../form-builder'
import { LeftArrowIcon } from '../../../../../icons'

export const ImageField = ({ tinaForm, children }) => {
  const [isExpanded, setExpanded] = React.useState<boolean>(false)

  return (
    <>
      <ImageHeader onClick={() => setExpanded(!isExpanded)}>
        {children}
      </ImageHeader>
      <ImagePanel
        isExpanded={isExpanded}
        setExpanded={setExpanded}
        field={{
          label: 'Image',
          name: 'Image',
        }}
        tinaForm={tinaForm}
      />
    </>
  )
}

interface ImagePanelProps {
  setExpanded(next: boolean): void
  isExpanded: boolean
  tinaForm: Form
  field: { label: string; name: string }
}

const ImagePanel = function Panel({
  setExpanded,
  isExpanded,
  tinaForm,
  field,
}: ImagePanelProps) {
  const FormPortal = useFormPortal()
  return (
    <FormPortal>
      {({ zIndexShift }) => (
        <ImageFieldPanel
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
        </ImageFieldPanel>
      )}
    </FormPortal>
  )
}

const ImageHeader: StyledComponent<'span', {}, {}> = styled.span`
  position: relative;
  cursor: pointer;
  display: block;
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

const PanelHeader = styled.span`
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

const PanelBody = styled.span`
  background: var(--tina-color-grey-1);
  position: relative;
  flex-direction: column;
  display: flex;
  flex: 1 1 auto;
  overflow-y: auto;
`

const ImageFieldPanelKeyframes = keyframes`
  0% {
    transform: translate3d( 100%, 0, 0 );
  }
  100% {
    transform: translate3d( 0, 0, 0 );
  }
`

export const ImageFieldPanel = styled.span<{ isExpanded: boolean }>`
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
        animation-name: ${ImageFieldPanelKeyframes};
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
