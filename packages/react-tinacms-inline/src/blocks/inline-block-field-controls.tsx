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
  ReorderIcon,
  ReorderRowIcon,
} from '@tinacms/icons'
import { useCMS } from 'tinacms'
import { Draggable } from 'react-beautiful-dnd'

import { useInlineBlocks } from './inline-field-blocks'
import { useInlineForm } from '../inline-form'
import { AddBlockMenu } from './add-block-menu'
import { InlineSettings } from '../inline-settings'
import { InlineFieldContext } from '../inline-field-context'
import { FocusRing } from '../styles'
import {
  FocusRingStyleProps,
  getOffset,
  getOffsetX,
  getOffsetY,
} from '../styles'

export interface BlocksControlsProps {
  children: any
  index: number
  insetControls?: boolean
  focusRing?: false | FocusRingStyleProps
}

export function BlocksControls({
  children,
  index,
  insetControls,
  focusRing = {},
}: BlocksControlsProps) {
  const cms = useCMS()
  const { focussedField, setFocussedField } = useInlineForm()
  const { name, template } = React.useContext(InlineFieldContext)
  const {
    insert,
    move,
    remove,
    blocks,
    count,
    direction,
    min,
    max,
  } = useInlineBlocks()
  const isFirst = index === 0
  const isLast = index === count - 1
  const blockMenuRef = React.useRef<HTMLDivElement>(null)
  const blockMoveUpRef = React.useRef<HTMLButtonElement>(null)
  const blockMoveDownRef = React.useRef<HTMLButtonElement>(null)

  const addBeforePosition = direction === 'horizontal' ? 'left' : 'top'
  const addAfterPosition = direction === 'horizontal' ? 'right' : 'bottom'

  if (cms.disabled) {
    return children
  }

  const removeBlock = (event: any) => {
    event.stopPropagation()
    event.preventDefault()
    remove(index)
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
      blockMenuRef.current?.contains(event.target) ||
      blockMoveUpRef.current?.contains(event.target) ||
      blockMoveDownRef.current?.contains(event.target)
    ) {
      return
    }
    event.stopPropagation()
    event.preventDefault()
    setFocussedField(name!)
  }

  const offset = typeof focusRing === 'object' ? focusRing.offset : undefined

  const parentName = name!
    .split('.')
    .slice(0, -1)
    .join('.')

  function withinLimit(limit: number | undefined) {
    if (!limit) return true

    return !(limit === count || (max === count && min === count))
  }

  return (
    <Draggable type={parentName} draggableId={name!} index={index}>
      {provider => {
        return (
          <FocusRing
            ref={provider.innerRef}
            active={focusRing && isActive}
            onClick={handleSetActiveBlock}
            offset={offset}
            borderRadius={
              typeof focusRing === 'object' ? focusRing.borderRadius : undefined
            }
            disableHover={focusRing === false ? true : childIsActive}
            {...provider.draggableProps}
            disableChildren={!isActive && !childIsActive}
          >
            {withinLimit(max) && (
              <AddBlockMenuWrapper active={isActive}>
                <AddBlockMenu
                  addBlock={block => insert(index, block)}
                  blocks={blocks}
                  index={index}
                  offset={offset}
                  position={addBeforePosition}
                />
                <AddBlockMenu
                  addBlock={block => insert(index + 1, block)}
                  blocks={blocks}
                  index={index}
                  offset={offset}
                  position={addAfterPosition}
                />
              </AddBlockMenuWrapper>
            )}
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
                  {direction === 'vertical' && <ChevronUpIcon />}
                  {direction === 'horizontal' && <ChevronLeftIcon />}
                </BlockAction>
                <BlockAction
                  ref={blockMoveDownRef}
                  onClick={moveBlockDown}
                  disabled={isLast}
                >
                  {direction === 'vertical' && <ChevronDownIcon />}
                  {direction === 'horizontal' && <ChevronRightIcon />}
                </BlockAction>
                <BlockAction {...provider.dragHandleProps}>
                  {direction === 'vertical' && <ReorderIcon />}
                  {direction === 'horizontal' && <ReorderRowIcon />}
                </BlockAction>
                <InlineSettings fields={template.fields} />
                {withinLimit(min) && (
                  <BlockAction onClick={removeBlock}>
                    <TrashIcon />
                  </BlockAction>
                )}
              </BlockMenu>
            </BlockMenuWrapper>
            {children}
          </FocusRing>
        )
      }}
    </Draggable>
  )
}

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
  offset?: number | { x: number; y: number }
}

export const BlockMenuWrapper = styled.div<BlockMenuWrapperProps>(p => {
  const offset = getOffset(p.offset)
  return css`
    position: absolute;
    top: calc(-${getOffsetY(offset)}px - 16px);
    right: calc(-${getOffsetX(offset)}px - 1px);
    opacity: 0;
    transition: all 120ms ease-out;
    z-index: calc(var(--tina-z-index-1) - ${p.index ? p.index : 0});
    pointer-events: none;
    transform: translate3d(0, -100%, 0);

    ${p.inset &&
      css`
        top: calc(14px - ${getOffsetY(offset)}px);
        right: calc(14px - ${getOffsetX(offset)}px);
        transform: translate3d(0, 0, 0);
      `}

    ${p.active &&
      css`
        opacity: 1;
        pointer-events: all;
      `}
  `
})

export const BlockMenu = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  top: 0;
  background-color: white;
  border-radius: var(--tina-radius-small);
  box-shadow: var(--tina-shadow-big);
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
