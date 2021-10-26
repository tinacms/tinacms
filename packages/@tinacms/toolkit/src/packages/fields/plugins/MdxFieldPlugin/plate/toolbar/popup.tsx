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
import { Dismissible } from '../../../../../react-dismissible'
import { Button } from '../../../../../styles'
import { ArrowDownIcon } from './icons'

const Embed = styled.div<{ open: boolean }>`
  display: flex;
  align-items: center;

  svg {
    transform: rotate(-90deg);
    transition: transform 150ms ease-out;
    margin-right: -4px;
    margin-left: 2px;
  }

  ${(p) =>
    p.open &&
    css`
      svg {
        transform: rotate(0deg);
      }
    `};
`

/**
 * Displays a drop-down for possible MDX elements to choose from
 */
export const PopupAdder = ({ showButton, onAdd, templates }) => {
  const [visible, setVisible] = React.useState(false)
  return (
    <span style={{ position: 'relative' }}>
      {!showButton ? (
        <span />
      ) : (
        <Button
          onClick={(event: any) => {
            event.stopPropagation()
            event.preventDefault()
            setVisible((visible) => !visible)
          }}
          primary
          small
        >
          <Embed open={visible}>
            Embed <ArrowDownIcon />
          </Embed>
        </Button>
      )}
      <PopupMenu open={visible}>
        <Dismissible
          click
          escape
          onDismiss={() => setVisible(false)}
          disabled={!visible}
        >
          <PopupMenuList>
            {templates.length > 0 ? (
              templates.map((template) => (
                <PopupOption
                  key={template.name}
                  onClick={() => {
                    onAdd(template)
                    setVisible(false)
                  }}
                >
                  {template.label}
                </PopupOption>
              ))
            ) : (
              <PopupOption>No templates provided </PopupOption>
            )}
          </PopupMenuList>
        </Dismissible>
      </PopupMenu>
    </span>
  )
}

const PopupMenu = styled.div<{ open: boolean }>`
  min-width: 192px;
  border-radius: var(--tina-radius-big);
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 100% 0;
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;
  z-index: var(--tina-z-index-1);
  ${(props) =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 36px, 0) scale3d(1, 1, 1);
    `};
`

const PopupMenuList = styled.div`
  display: flex;
  flex-direction: column;
`

const PopupOption = styled.button`
  position: relative;
  text-align: center;
  font-size: var(--tina-font-size-0);
  padding: var(--tina-padding-small);
  font-weight: var(--tina-font-weight-regular);
  width: 100%;
  background: none;
  cursor: pointer;
  outline: none;
  border: 0;
  transition: all 85ms ease-out;
  &:hover {
    color: var(--tina-color-primary);
    background-color: var(--tina-color-grey-1);
  }
  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }
`
