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
import styled, { css, StyledComponent } from 'styled-components'
import { EllipsisVerticalIcon } from '@tinacms/icons'
import { padding, color, radius, font, shadow } from '@tinacms/styles'
import { useState, FC } from 'react'
import { Dismissible } from 'react-dismissible'
import { Form } from '@tinacms/forms'

export interface FormActionMenuProps {
  form: Form
  actions: any[]
}

export const FormActionMenu: FC<FormActionMenuProps> = ({ actions, form }) => {
  const [actionMenuVisibility, setActionMenuVisibility] = useState(false)
  return (
    <>
      <MoreActionsButton onClick={() => setActionMenuVisibility(p => !p)} />
      <ActionsOverlay open={actionMenuVisibility}>
        <Dismissible
          click
          escape
          disabled={!actionMenuVisibility}
          onDismiss={() => {
            setActionMenuVisibility(p => !p)
          }}
        >
          {actions.map((Action, i) => (
            // TODO: `i` will suppress warnings but this indicates that maybe
            //        Actions should just be componets
            <Action form={form} key={i} />
          ))}
        </Dismissible>
      </ActionsOverlay>
    </>
  )
}

const MoreActionsButton = styled(p => (
  <button {...p}>
    <EllipsisVerticalIcon />
  </button>
))`
  height: 100%;
  width: 40px;
  background-color: transparent;
  background-position: center;
  background-size: auto 18px;
  background-repeat: no-repeat;
  border: 0;
  margin: 0 -16px 0 8px;
  outline: none;
  cursor: pointer;
  transition: opacity 85ms ease-out;
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    background-color: #f6f6f9;
    fill: ${color.grey(8)};
  }
`

const ActionsOverlay = styled.div<{ open: boolean }>`
  min-width: 192px;
  border-radius: ${radius()};
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  bottom: ${padding()};
  right: ${padding()};
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 85ms ease-out;
  transform-origin: 100% 100%;
  box-shadow: ${shadow('big')};
  background-color: white;
  overflow: hidden;
  z-index: 100;
  ${props =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, -28px, 0) scale3d(1, 1, 1);
    `};
`

export const ActionButton: StyledComponent<'button', {}, {}> = styled.button`
  position: relative;
  text-align: center;
  font-size: ${font.size(0)};
  padding: 0 12px;
  height: 40px;
  font-weight: 500;
  width: 100%;
  background: none;
  cursor: pointer;
  outline: none;
  border: 0;
  transition: all 85ms ease-out;
  &:hover {
    color: ${color.primary()};
    background-color: #f6f6f9;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }
`
