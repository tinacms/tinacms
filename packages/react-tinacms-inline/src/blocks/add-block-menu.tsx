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
import { BlockTemplate } from 'tinacms'
import { IconButton } from '@tinacms/styles'
import { AddIcon } from '@tinacms/icons'

import { getOffset, getOffsetX, getOffsetY } from '../styles'

interface AddBlockMenuProps {
  addBlock(data: any): void
  blocks: { [key: string]: { template: BlockTemplate } }
  position?: 'top' | 'bottom' | 'left' | 'right'
  index?: number
  offset?: number | { x: number; y: number }
}

export function AddBlockMenu({
  blocks,
  addBlock,
  position,
  index,
  offset,
}: AddBlockMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const addBlockButtonRef = React.useRef<HTMLButtonElement>(null)
  const [openTop, setOpenTop] = React.useState(false)

  const handleOpenBlockMenu = (event: any) => {
    event.stopPropagation()
    event.preventDefault()
    const addBlockButtonElem = addBlockButtonRef.current

    if (addBlockButtonElem !== null) {
      const menuBounding = addBlockButtonElem.getBoundingClientRect()
      const halfWindowHeight =
        (window.innerHeight || document.documentElement.clientHeight) / 2
      const offsetTop = menuBounding.top

      if (offsetTop < halfWindowHeight) {
        setOpenTop(false)
      } else {
        setOpenTop(true)
      }
    }

    if (Object.keys(blocks).length == 1) {
      const blockId = Object.keys(blocks)[0]
      addBlock({
        _template: blockId,
        ...blocks[blockId].template.defaultItem,
      })
    } else {
      setIsOpen(isOpen => !isOpen)
    }
  }

  React.useEffect(() => {
    const inactivateBlockMenu = () => setIsOpen(false)
    document.addEventListener('mouseup', inactivateBlockMenu, false)
    return () => document.removeEventListener('mouseup', inactivateBlockMenu)
  }, [])

  return (
    <AddBlockWrapper
      index={index}
      offset={offset}
      position={position}
      isOpen={isOpen}
    >
      <AddBlockButton
        ref={addBlockButtonRef}
        onClick={handleOpenBlockMenu}
        isOpen={isOpen}
        primary
        small
      >
        <AddIcon />
      </AddBlockButton>
      <BlocksMenu openTop={openTop} isOpen={isOpen}>
        {Object.keys(blocks).map((key: string) => {
          const template = blocks[key].template
          return (
            <BlockOption
              key={template.label}
              onClick={event => {
                event.stopPropagation()
                event.preventDefault()
                addBlock({
                  _template: key,
                  ...template.defaultItem,
                })
              }}
            >
              {template.label}
            </BlockOption>
          )
        })}
      </BlocksMenu>
    </AddBlockWrapper>
  )
}

interface AddMenuProps {
  isOpen?: boolean
  active?: boolean
  openTop?: boolean
}

const AddBlockButton = styled(IconButton)<AddMenuProps>`
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;

  &:focus {
    outline: none !important;
  }

  svg {
    transition: all 150ms ease-out;
  }

  ${props =>
    props.isOpen &&
    css`
      pointer-events: none;

      svg {
        transform: rotate(45deg);
      }
    `};
`

interface AddBlockWrapperProps {
  index?: number
  offset?: number | { x: number; y: number }
  position?: 'top' | 'bottom' | 'left' | 'right'
  isOpen: boolean
}

const AddBlockWrapper = styled.div<AddBlockWrapperProps>(p => {
  const offset = getOffset(p.offset)

  return css`
  position: absolute;
  z-index: calc(var(--tina-z-index-2) - ${p.index !== undefined ? p.index : 0});


  ${p.position === 'top' &&
    css`
      top: calc(-1 * ${getOffsetY(offset)}px);
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
    `}

  ${p.position === 'left' &&
    css`
      top: 50%;
      left: calc(-1 * ${getOffsetX(offset)}px);
      transform: translate3d(-50%, -50%, 0);
    `}

  ${p.position === 'bottom' &&
    css`
      bottom: calc(-1 * ${getOffsetY(offset)}px);
      left: 50%;
      transform: translate3d(-50%, 50%, 0);
    `}

  ${p.position === 'right' &&
    css`
      top: 50%;
      right: calc(-1 * ${getOffsetX(offset)}px);
      transform: translate3d(50%, -50%, 0);
    `}

  ${p.position === undefined &&
    css`
      position: relative;
    `}

  ${p.isOpen &&
    css`
      z-index: calc(1 + var(--tina-z-index-2) - ${p.index ? p.index : 0});
    `}
`
})

const BlocksMenu = styled.div<AddMenuProps>`
  min-width: 192px;
  border-radius: var(--tina-radius-big);
  border: 1px solid var(--tina-color-grey-2);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  position: absolute;
  z-index: var(--tina-z-index-2);
  top: 20px;
  left: 50%;
  transform: translate3d(-50%, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 50% 0;
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;

  ${props =>
    props.isOpen &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(-50%, 16px, 0) scale3d(1, 1, 1);
    `};

  ${props =>
    props.openTop &&
    css`
      top: auto;
      bottom: 20px;
      transform-origin: 50% 100%;

      ${props.isOpen &&
        css`
          transform: translate3d(-50%, -16px, 0) scale3d(1, 1, 1);
        `};
    `};
`

const BlockOption = styled.button`
  font-family: 'Inter', sans-serif;
  position: relative;
  text-align: center;
  font-size: var(--tina-font-size-1);
  padding: 0 12px;
  height: 34px;
  font-weight: var(--tina-font-weight-regular);
  width: 100%;
  background: none;
  cursor: pointer;
  outline: none;
  border: 0;
  transition: all 85ms ease-out;
  user-select: none;

  &:hover {
    color: var(--tina-color-primary);
    background-color: #f6f6f9;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }
`
