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
import { Dismissible } from 'react-dismissible'

interface AddBlockMenuProps {
  addBlock(data: any): void
  templates: BlockTemplate[]
}

export function AddBlockMenu({ templates, addBlock }: AddBlockMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const addBlockButtonRef = React.useRef<HTMLButtonElement>(null)
  const [openTop, setOpenTop] = React.useState(false)

  const handleOpenBlockMenu = () => {
    const addBlockButtonElem = addBlockButtonRef.current

    if (addBlockButtonElem !== null) {
      const menuBounding = addBlockButtonElem.getBoundingClientRect()
      const halfWindowHeight =
        (window.innerHeight || document.documentElement.clientHeight) / 2
      const offsetTop = menuBounding.top - window.scrollY

      if (offsetTop < halfWindowHeight) {
        setOpenTop(false)
      } else {
        setOpenTop(true)
      }
    }

    templates.length == 1
      ? addBlock({
          _template: templates[0].type,
          ...templates[0].defaultItem,
        })
      : setIsOpen(isOpen => !isOpen)
  }

  React.useEffect(() => {
    const inactivateBlockMenu = () => setIsOpen(false)
    document.addEventListener('mouseup', inactivateBlockMenu, false)
    return () => document.removeEventListener('mouseup', inactivateBlockMenu)
  }, [])

  templates = templates || []

  return (
    <AddBlockWrapper>
      <AddBlockButton
        ref={addBlockButtonRef}
        onClick={handleOpenBlockMenu}
        isOpen={isOpen}
        primary
      >
        <AddIcon />
      </AddBlockButton>
      <BlocksMenu openTop={openTop} isOpen={isOpen}>
        <Dismissible
          click
          escape
          onDismiss={() => setIsOpen(false)}
          disabled={!isOpen}
        >
          {templates.map((template: BlockTemplate) => (
            <BlockOption
              key={template.label}
              onClick={() => {
                addBlock({
                  _template: template.type,
                  ...template.defaultItem,
                })
              }}
            >
              {template.label}
            </BlockOption>
          ))}
        </Dismissible>
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
      svg {
        transform: rotate(45deg);
      }
    `};
`

const AddBlockWrapper = styled.div`
  position: relative;
`

const BlocksMenu = styled.div<AddMenuProps>`
  min-width: 192px;
  border-radius: var(--tina-radius-big);
  border: 1px solid var(--tina-color-grey-2);
  display: block;
  position: absolute;
  z-index: var(--tina-z-index-2);
  top: 5px;
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
      transform: translate3d(-50%, 41px, 0) scale3d(1, 1, 1);
    `};

  ${props =>
    props.openTop &&
    css`
      top: auto;
      bottom: 5px;
      transform-origin: 50% 100%;

      ${props.isOpen &&
        css`
          transform: translate3d(-50%, -41px, 0) scale3d(1, 1, 1);
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
  &:hover {
    color: var(--tina-color-primary);
    background-color: #f6f6f9;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }
`
