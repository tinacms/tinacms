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
import { Button } from '@tinacms/styles'
import { AddIcon } from '@tinacms/icons'

interface AddBlockMenuProps {
  addBlock(data: any): void
  templates: BlockTemplate[]
}

export function AddBlockMenu({ templates, addBlock }: AddBlockMenuProps) {
  const [isOpen, setOpen] = React.useState(false)

  const handleOpenMenu = (event: React.MouseEvent) => {
    event.stopPropagation()
    setOpen(isOpen => !isOpen)
  }

  React.useEffect(() => {
    const setInactive = () => setOpen(false)
    document.addEventListener('mouseup', setInactive, false)
    return () => document.removeEventListener('mouseup', setInactive)
  }, [])

  templates = templates || []

  return (
    <AddBlockWrapper>
      <AddBlockButton onClick={handleOpenMenu} isOpen={isOpen} primary>
        <AddIcon /> Add Block
      </AddBlockButton>
      <BlocksMenu isOpen={isOpen}>
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
      </BlocksMenu>
    </AddBlockWrapper>
  )
}

interface AddMenuProps {
  isOpen?: boolean
  active?: boolean
}

const AddBlockButton = styled(Button)<AddMenuProps>`
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;

  &:focus {
    outline: none !important;
  }

  svg {
    height: 70%;
    width: auto;
    margin-right: 0.5em;
    transition: all 150ms ease-out;
  }

  ${props =>
    props.open &&
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
  top: 0;
  left: 0;
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 50% 0;
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;
  /* z-index: 2000; */

  ${props =>
    props.isOpen &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 41px, 0) scale3d(1, 1, 1);
    `};
`

const BlockOption = styled.button`
  font-family: 'Inter', sans-serif;
  position: relative;
  text-align: center;
  font-size: var(--tina-font-size-1);
  padding: 0 12px;
  height: 34px;
  font-weight: 500;
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
