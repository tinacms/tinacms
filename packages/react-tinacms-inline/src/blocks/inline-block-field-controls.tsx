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
import { Button, IconButton } from '@tinacms/styles'
import { ChevronUpIcon, ChevronDownIcon, TrashIcon } from '@tinacms/icons'

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
}

export function BlocksControls({
  children,
  index,
  offset,
  borderRadius,
}: BlocksControlsProps) {
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
  const { template } = React.useContext(InlineFieldContext)
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
    <FocusRing
      ref={blockRef}
      active={activeBlock === index}
      onClick={handleSetActiveBlock}
      offset={offset}
      borderRadius={borderRadius}
    >
      <BlockMenu
        ref={blockMenuRef}
        index={index}
        active={activeBlock === index}
      >
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
          <InlineSettings fields={template.fields} />
          <IconButton primary onClick={removeBlock}>
            <TrashIcon />
          </IconButton>
        </BlockMenuRight>
      </BlockMenu>
      {children}
    </FocusRing>
  )
}

interface BlockMenuProps {
  index: number
  active: boolean
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
  ${p =>
    p.active &&
    css`
      transform: translate3d(0, -100%, 0);
      opacity: 1;
      pointer-events: all;
    `}
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
