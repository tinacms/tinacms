/**

Copyright 2019 Forestry.io Inc

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
import styled, { css } from 'styled-components'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
} from '@tinacms/icons'

import { useInlineBlocks } from './inline-field-blocks'
import { useInlineForm } from '../inline-form'
import { AddBlockMenu } from './add-block-menu'
import { InlineSettings } from '../inline-settings'
import { InlineFieldContext } from '../inline-field-context'
import { FocusRing } from '../styles'

export interface BlocksControlsProps {
  children: any
  index: number
  offset?: number
  borderRadius?: number
  insetControls?: boolean
  focusRing?: boolean
}

export function BlocksControls({
  children,
  index,
  offset,
  borderRadius,
  insetControls,
  focusRing = true,
}: BlocksControlsProps) {
  const { status, focussedField, setFocussedField } = useInlineForm()
  const { name, template } = React.useContext(InlineFieldContext)
  const { insert, move, remove, blocks, count, direction } = useInlineBlocks()
  const isFirst = index === 0
  const isLast = index === count - 1
  const blockRef = React.useRef<HTMLDivElement>(null)
  const blockMenuRef = React.useRef<HTMLDivElement>(null)
  const blockMoveUpRef = React.useRef<HTMLButtonElement>(null)
  const blockMoveDownRef = React.useRef<HTMLButtonElement>(null)

  const addBeforePosition =
    direction === 'column' ? 'top' : direction === 'row' ? 'left' : 'top'
  const addAfterPosition =
    direction === 'column' ? 'bottom' : direction === 'row' ? 'right' : 'bottom'

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [blockRef.current, blockMenuRef.current])

  if (status === 'inactive') {
    return children
  }

  const removeBlock = (event: any) => {
    event.stopPropagation()
    event.preventDefault()
    remove(index)
  }

  const handleClickOutside = (event: any) => {
    if (
      blockRef.current?.contains(event.target) ||
      blockMenuRef.current?.contains(event.target)
    ) {
      return
    }
  }

  const moveBlockUp = (event: any) => {
    move(index, index - 1)
    event.stopPropagation()
    event.preventDefault()
  }

  const moveBlockDown = (event: any) => {
    move(index, index + 1)
    event.stopPropagation()
    event.preventDefault()
  }

  const isActive = name === focussedField
  const childIsActive = focussedField.startsWith(name!)

  const handleSetActiveBlock = (event: any) => {
    if (
      blockMoveUpRef.current?.contains(event.target) ||
      blockMoveDownRef.current?.contains(event.target)
    ) {
      return
    }
    event.stopPropagation()
    event.preventDefault()
    setFocussedField(name!)
  }

  return (
    <FocusRing
      ref={blockRef}
      active={focusRing && isActive}
      onClick={handleSetActiveBlock}
      offset={offset}
      borderRadius={borderRadius}
      disableHover={!focusRing ? true : childIsActive}
    >
      <AddBlockMenuWrapper active={isActive}>
        <AddBlockMenu
          addBlock={block => insert(index, block)}
          templates={Object.entries(blocks).map(([, block]) => block.template)}
          index={index}
          offset={offset}
          position={addBeforePosition}
        />
        <AddBlockMenu
          addBlock={block => insert(index + 1, block)}
          templates={Object.entries(blocks).map(([, block]) => block.template)}
          index={index}
          offset={offset}
          position={addAfterPosition}
        />
      </AddBlockMenuWrapper>
      <BlockMenuWrapper
        offset={offset}
        ref={blockMenuRef}
        index={index}
        active={isActive}
        inset={insetControls}
      >
        <BlockMenu>
          <BlockAction
            ref={blockMoveUpRef}
            onClick={moveBlockUp}
            disabled={isFirst}
          >
            {direction === 'column' && <ChevronUpIcon />}
            {direction === 'row' && <ChevronLeftIcon />}
          </BlockAction>
          <BlockAction
            ref={blockMoveDownRef}
            onClick={moveBlockDown}
            disabled={isLast}
          >
            {direction === 'column' && <ChevronDownIcon />}
            {direction === 'row' && <ChevronRightIcon />}
          </BlockAction>
          <InlineSettings fields={template.fields} />
          <BlockAction onClick={removeBlock}>
            <TrashIcon />
          </BlockAction>
        </BlockMenu>
      </BlockMenuWrapper>
      <BlockChildren disableClick={!isActive && !childIsActive}>
        {children}
      </BlockChildren>
    </FocusRing>
  )
}

const BlockChildren = styled.div<{ disableClick: boolean }>(
  ({ disableClick }) => css`
    ${disableClick && `pointer-events: none;`};
  `
)

interface AddBlockMenuWrapperProps {
  active: boolean
}

const AddBlockMenuWrapper = styled.div<AddBlockMenuWrapperProps>(
  p => css`
    opacity: 0;
    transition: all 120ms ease-out;
    pointer-events: none;

    ${p.active &&
      css`
        opacity: 1;
        pointer-events: all;
      `}
  `
)

interface BlockMenuWrapperProps {
  index?: number
  active: boolean
  inset?: boolean
  offset?: number
}

export const BlockMenuWrapper = styled.div<BlockMenuWrapperProps>(
  p => css`
    position: absolute;
    top: calc(-${p.offset !== undefined ? p.offset : `16`}px - 16px);
    right: calc(-${p.offset !== undefined ? p.offset : `16`}px - 1px);
    opacity: 0;
    transition: all 120ms ease-out;
    z-index: calc(var(--tina-z-index-1) - ${p.index ? p.index : 0});
    pointer-events: none;
    transform: translate3d(0, -100%, 0);

    ${p.inset &&
      css`
        top: calc(14px - ${p.offset !== undefined ? p.offset : `16`}px);
        right: calc(14px - ${p.offset !== undefined ? p.offset : `16`}px);
        transform: translate3d(0, 0, 0);
      `}

    ${p.active &&
      css`
        opacity: 1;
        pointer-events: all;
      `}
  `
)

export const BlockMenu = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  top: 0;
  background-color: white;
  border-radius: var(--tina-radius-small);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--tina-color-grey-2);
  overflow: hidden;
`

interface BlockActionProps {
  active?: boolean
  disabled?: boolean
  onClick?: any
  ref?: any
}

export const BlockAction = styled.div<BlockActionProps>`
  background-color: ${p =>
    p.active ? 'rgba(53, 50, 50, 0.05)' : 'transparent'};
  color: ${p =>
    p.active ? 'var(--tina-color-primary)' : 'var(--tina-color-grey-8)'};
  fill: ${p =>
    p.active ? 'var(--tina-color-primary)' : 'var(--tina-color-grey-8)'};
  outline: none;
  border: none;
  padding: 4px 6px;
  transition: all 85ms ease-out;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: 600;

  &:hover {
    background-color: rgba(53, 50, 50, 0.09);
  }
  &:active {
    color: var(--tina-color-primary);
    fill: var(--tina-color-primary);
    background-color: rgba(53, 50, 50, 0.05);
  }
  &:not(:last-child) {
    border-right: 1px solid var(--tina-color-grey-2);
  }
  svg {
    width: 26px;
    height: auto;
  }

  ${props =>
    props.active &&
    css`
      color: var(--tina-color-primary);
      fill: var(--tina-color-primary);
      background-color: rgba(53, 50, 50, 0.05);
    `};

  ${props =>
    props.disabled &&
    css`
      pointer-events: none;
      color: #d1d1d1;
      fill: #d1d1d1;
    `};
`
