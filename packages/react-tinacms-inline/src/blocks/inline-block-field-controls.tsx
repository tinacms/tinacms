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
import { useInlineBlocks } from './inline-field-blocks'
import { useInlineForm } from '../inline-form'
import { AddBlockMenu } from './add-block-menu'
import { BlockSettings } from './block-settings'
import { Button, IconButton } from '@tinacms/styles'
import { ChevronUpIcon, ChevronDownIcon, TrashIcon } from '@tinacms/icons'
import { InlineFieldContext } from '../inline-field-context'
import { useContext } from 'react'

export interface BlocksControlsProps {
  children: any
  index: number
}

export function BlocksControls({ children, index }: BlocksControlsProps) {
  const { status } = useInlineForm()
  const {
    insert,
    move,
    remove,
    blocks,
    count,
    activeBlock,
    setActiveBlock,
  } = useInlineBlocks()
  const { template } = useContext(InlineFieldContext)
  const isFirst = index === 0
  const isLast = index === count - 1
  const blockRef = React.useRef<HTMLDivElement>(null)
  const blockMenuRef = React.useRef<HTMLDivElement>(null)
  const blockMoveUpRef = React.useRef<HTMLButtonElement>(null)
  const blockMoveDownRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [blockRef.current, blockMenuRef.current])

  if (status === 'inactive') {
    return children
  }

  const removeBlock = () => remove(index)

  const handleClickOutside = (event: any) => {
    if (
      blockRef.current?.contains(event.target) ||
      blockMenuRef.current?.contains(event.target)
    ) {
      return
    }
    setActiveBlock(-1)
  }

  const moveBlockUp = () => {
    move(index, index - 1)
    setActiveBlock(index - 1)
  }

  const moveBlockDown = () => {
    move(index, index + 1)
    setActiveBlock(index + 1)
  }

  const handleSetActiveBlock = (event: any) => {
    if (
      blockMoveUpRef.current?.contains(event.target) ||
      blockMoveDownRef.current?.contains(event.target) ||
      activeBlock === index
    ) {
      return
    }
    setActiveBlock(index)
  }

  return (
    <BlockWrapper
      ref={blockRef}
      active={activeBlock === index}
      onClick={handleSetActiveBlock}
    >
      <BlockMenu ref={blockMenuRef} index={index}>
        <BlockMenuLeft>
          <AddBlockMenu
            addBlock={block => insert(index + 1, block)}
            templates={Object.entries(blocks).map(
              ([, block]) => block.template
            )}
          />
        </BlockMenuLeft>
        <BlockMenuRight>
          <IconButton
            ref={blockMoveUpRef}
            primary
            onClick={moveBlockUp}
            disabled={isFirst}
          >
            <ChevronUpIcon />
          </IconButton>
          <IconButton
            ref={blockMoveDownRef}
            primary
            onClick={moveBlockDown}
            disabled={isLast}
          >
            <ChevronDownIcon />
          </IconButton>
          <BlockSettings template={template} />
          <IconButton primary onClick={removeBlock}>
            <TrashIcon />
          </IconButton>
        </BlockMenuRight>
      </BlockMenu>
      {children}
    </BlockWrapper>
  )
}

interface BlockMenuProps {
  index: number
}

const BlockMenu = styled.div<BlockMenuProps>`
  position: absolute;
  top: -1.5rem;
  right: -4px;
  left: -4px;
  display: grid;
  align-items: center;
  grid-template-areas: 'left right';
  grid-template-columns: auto auto;
  opacity: 0;
  transform: translate3d(0, 0, 0);
  transition: all 120ms ease-out;
  z-index: calc(1000 - ${props => props.index});
  pointer-events: none;

  ${Button} {
    height: 34px;
    margin: 0 4px;
  }

  ${IconButton} {
    width: 34px;
    height: 34px;
    margin: 0 4px;
  }
`

const BlockMenuLeft = styled.div`
  grid-area: left;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`

const BlockMenuRight = styled.div`
  grid-area: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

export interface BlockWrapperProps {
  active: boolean
}

const BlockWrapper = styled.div<BlockWrapperProps>`
  position: relative;

  &:hover {
    &:after {
      opacity: 0.3;
    }
  }

  &:after {
    content: '';
    display: block;
    position: absolute;
    left: -16px;
    top: -16px;
    width: calc(100% + 2rem);
    height: calc(100% + 2rem);
    border: 3px solid var(--tina-color-primary);
    border-radius: var(--tina-radius-big);
    opacity: 0;
    pointer-events: none;
    transition: all var(--tina-timing-medium) ease-out;
  }

  ${p =>
    p.active &&
    css`
      ${BlockMenu} {
        transform: translate3d(0, -100%, 0);
        opacity: 1;
        pointer-events: all;
      }

      &:after {
        opacity: 1 !important;
      }
    `};
`
