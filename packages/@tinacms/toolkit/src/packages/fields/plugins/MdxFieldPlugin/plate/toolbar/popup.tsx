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
          variant="primary"
          size="small"
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
              <div className="px-5 py-2 text-sm opacity-70">
                No templates provided{' '}
              </div>
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

const PopupOption = ({ children, ...props }) => {
  return (
    <button
      className="relative text-center text-sm p-2 w-full border-b border-gray-50 outline-none transition-all ease-out duration-150 hover:text-blue-500 hover:bg-gray-50"
      {...props}
    >
      {children}
    </button>
  )
}
