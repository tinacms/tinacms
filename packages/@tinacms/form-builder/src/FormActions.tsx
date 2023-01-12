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
import styled, { css, StyledComponent } from 'styled-components'
import { EllipsisVerticalIcon } from '@einsteinindustries/tinacms-icons'
import { useState, FC } from 'react'
import { Dismissible } from 'react-dismissible'
import { Form } from '@einsteinindustries/tinacms-forms'

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
  height: 64px;
  width: 40px;
  align-self: stretch;
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
    background-color: var(--tina-color-grey-1);
    fill: var(--tina-color-grey-8);
  }
`

const ActionsOverlay = styled.div<{ open: boolean }>`
  min-width: 192px;
  border-radius: var(--tina-radius-big);
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  bottom: var(--tina-padding-big);
  right: var(--tina-padding-big);
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 85ms ease-out;
  transform-origin: 100% 100%;
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;
  z-index: var(--tina-z-index-1);
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
  font-size: var(--tina-font-size-1);
  padding: 0 12px;
  height: 40px;
  font-weight: var(--tina-font-weight-regular);
  width: 100%;
  background: none;
  cursor: pointer;
  outline: none;
  border: 0;
  transition: all var(--tina-timing-medium) ease-out;
  &:hover {
    color: var(--tina-color-primary);
    background-color: var(--tina-color-grey-1);
  }
  &:not(:last-child) {
    border-bottom: 1px solid var(--tina-color-grey-2);
  }
`
