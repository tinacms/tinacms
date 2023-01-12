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
import styled, { css } from 'styled-components'
import { BlockTemplate } from '@einsteinindustries/tinacms'
import { IconButton } from '@einsteinindustries/tinacms-styles'
import { AddIcon } from '@einsteinindustries/tinacms-icons'
import { Input } from '@einsteinindustries/tinacms'

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
  const addBlockMenuRef = React.useRef<HTMLDivElement>(null)
  const [openTop, setOpenTop] = React.useState(false)
  const [filterValue, setFilterValue] = React.useState('')

  const getDefaultProps = (defaultItem: any) => {
    return typeof defaultItem === 'function' ? defaultItem() : defaultItem
  }

  const handleOpenBlockMenu = (event: any) => {
    event.stopPropagation()
    event.preventDefault()
    const addBlockButtonElem = addBlockButtonRef.current
    setFilterValue('')

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
        ...getDefaultProps(blocks[blockId].template.defaultItem),
      })
    } else {
      setIsOpen(isOpen => !isOpen)
    }
  }

  React.useEffect(() => {
    const inactivateBlockMenu = (event: any) => {
      if (
        addBlockMenuRef.current &&
        !addBlockMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', inactivateBlockMenu)
    return () => document.removeEventListener('mousedown', inactivateBlockMenu)
  }, [addBlockButtonRef])

  const optionBlocks = Object.keys(blocks).filter(key => {
    const { displayAsOption = true, label } = blocks[key].template
    return (
      displayAsOption && label.toLowerCase().includes(filterValue.toLowerCase())
    )
  })

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
      <BlocksMenu openTop={openTop} isOpen={isOpen} ref={addBlockMenuRef}>
        {Object.keys(blocks).length > 9 && (
          <DropdownHeader>
            <SelectFilter
              placeholder="Filter"
              onChange={event => setFilterValue(event.target.value)}
              onClick={(event: any) => {
                event.preventDefault()
                event.stopPropagation()
              }}
              value={filterValue}
            />
          </DropdownHeader>
        )}
        <BlocksMenuOptions>
          {optionBlocks.length > 0 ? (
            optionBlocks.map((key: string) => {
              const template = blocks[key].template
              if (!template) {
                console.error(`No template for ${key} block exists`)

                return null
              } else {
                return (
                  <BlockOption
                    key={template?.label}
                    onClick={event => {
                      event.stopPropagation()
                      event.preventDefault()
                      addBlock({
                        _template: key,
                        ...getDefaultProps(template?.defaultItem),
                      })
                    }}
                  >
                    {template?.label}
                  </BlockOption>
                )
              }
            })
          ) : (
            <BlockOption disabled>No blocks to display</BlockOption>
          )}
        </BlocksMenuOptions>
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
  z-index: calc(var(--tina-z-index-3) - ${p.index !== undefined ? p.index : 0});


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
      z-index: calc(1 + var(--tina-z-index-3) - ${p.index ? p.index : 0});
    `}
`
})

const BlocksMenu = styled.div<AddMenuProps>`
  min-width: 192px;
  border-radius: var(--tina-radius-small);
  border: 1px solid var(--tina-color-grey-2);
  border-bottom-color: var(--tina-color-grey-3);
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

const BlocksMenuOptions = styled.div<AddMenuProps>`
  min-width: 192px;
  max-height: 25vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  background-color: white;
  overflow: auto;
  background:
		/* Shadow covers */ linear-gradient(
      white 30%,
      rgba(255, 255, 255, 0)
    ),
    linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%,
    /* Shadows */
      linear-gradient(
        to bottom,
        var(--tina-color-grey-2),
        var(--tina-color-grey-1),
        rgba(0, 0, 0, 0)
      ),
    linear-gradient(
        to top,
        var(--tina-color-grey-3),
        var(--tina-color-grey-1),
        rgba(0, 0, 0, 0)
      )
      0 100%;
  background-repeat: no-repeat;
  background-color: white;
  background-size: 100% 84px, 100% 84px, 100% 28px, 100% 28px;
  background-attachment: local, local, scroll, scroll;
`

const BlockOption = styled.button`
  all: unset;
  box-sizing: border-box;
  color: var(--tina-color-grey-8);
  font-family: 'Inter', sans-serif;
  position: relative;
  text-align: center;
  font-size: var(--tina-font-size-1);
  padding: 0 12px;
  height: 34px;
  flex: 0 0 auto;
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
    background-color: rgba(0, 0, 0, 0.03);
  }
  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  ${props =>
    props.disabled &&
    css`
      pointer-events: none;
      color: var(--tina-color-grey-5);
      background: var(--tina-color-grey-1);

      &:hover {
        color: var(--tina-color-grey-8);
        background-color: var(--tina-color-grey-1);
      }
    `};
`

const DropdownHeader = styled.div`
  position: sticky;
  top: 0;
  padding: 10px;
  background-color: var(--tina-color-grey-1);
  border-bottom: 1px solid var(--tina-color-grey-2);
`

const SelectFilter = styled(Input)`
  height: 36px;
  flex: 0 1 auto;

  ::placeholder {
    color: var(--tina-color-grey-4);
  }
`
