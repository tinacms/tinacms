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
import { ExitIcon } from '@einsteinindustries/tinacms-icons'
import { useState, FC } from 'react'
import { Dismissible } from 'react-dismissible'
import { Form } from '@einsteinindustries/tinacms-forms'
import { ActionButton } from '@einsteinindustries/tinacms-form-builder'
import { useCMS } from '@einsteinindustries/tinacms-react-core'

export interface FormActionMenuProps {
  form: Form | null
}

export const FormActionMenu: FC<FormActionMenuProps> = ({ form }) => {
  const [actionMenuVisibility, setActionMenuVisibility] = useState(false)

  return (
    <>
      <MoreActionsButton
        open={actionMenuVisibility}
        onClick={() => setActionMenuVisibility(p => !p)}
      />
      <ActionsOverlay open={actionMenuVisibility}>
        <Dismissible
          click
          escape
          disabled={!actionMenuVisibility}
          allowClickPropagation
          onDismiss={() => {
            setActionMenuVisibility(p => !p)
          }}
        >
          {form?.actions &&
            form.actions.map((Action: any, i: number) => (
              // TODO: `i` will suppress warnings but this indicates that maybe
              //        Actions should just be components
              <Action form={form} key={i} />
            ))}
          <ExitAction />
        </Dismissible>
      </ActionsOverlay>
    </>
  )
}

const UserAccountIcon = () => (
  <svg
    version="1.1"
    id="Layer_1"
    x="0px"
    y="0px"
    viewBox="0 0 512 512"
    width="25px"
  >
    <g>
      <g>
        <path
          d="M256,0c-74.439,0-135,60.561-135,135s60.561,135,135,135s135-60.561,135-135S330.439,0,256,0z M256,240
			c-57.897,0-105-47.103-105-105c0-57.897,47.103-105,105-105c57.897,0,105,47.103,105,105C361,192.897,313.897,240,256,240z"
        />
      </g>
    </g>
    <g>
      <g>
        <path
          d="M423.966,358.195C387.006,320.667,338.009,300,286,300h-60c-52.008,0-101.006,20.667-137.966,58.195
			C51.255,395.539,31,444.833,31,497c0,8.284,6.716,15,15,15h420c8.284,0,15-6.716,15-15
			C481,444.833,460.745,395.539,423.966,358.195z M61.66,482c7.515-85.086,78.351-152,164.34-152h60
			c85.989,0,156.825,66.914,164.34,152H61.66z"
        />
      </g>
    </g>
  </svg>
)

const MoreActionsButton = styled(p => (
  <button {...p}>
    <UserAccountIcon />
  </button>
))`
  height: var(--tina-toolbar-height);
  width: 50px;
  align-self: stretch;
  background-color: white;
  background-position: center;
  background-size: auto 18px;
  background-repeat: no-repeat;
  border: 0;
  margin: 0 -12px 0 12px;
  outline: none;
  cursor: pointer;
  transition: all 150ms ease-out;
  display: flex;
  justify-content: center;
  align-items: center;
  border-left: 1px solid var(--tina-color-grey-2);
  &:hover {
    background-color: var(--tina-color-grey-1);
    svg {
      fill: var(--tina-color-primary);
    }
  }
  svg {
    transition: all 150ms ease-out;
  }

  ${props =>
    props.open &&
    css`
      background-color: var(--tina-color-grey-1);
      box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.06);
      svg {
        fill: var(--tina-color-primary);
      }
      &:hover {
        svg {
          fill: var(--tina-color-primary);
        }
      }
    `};
`

const ActionsOverlay = styled.div<{ open: boolean }>`
  min-width: 192px;
  border-radius: var(--tina-radius-big);
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  top: 0;
  right: 14px;
  transform: translate3d(0, 23px, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 100% 0;
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;
  z-index: var(--tina-z-index-1);
  ${props =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 55px, 0) scale3d(1, 1, 1);
    `};
`

export const ExitButton = styled(ActionButton)`
  height: 32px;
  background-color: var(--tina-color-grey-1);
  display: flex;
  align-items: center;
  justify-content: center;

  &:not(:first-child) {
    border-top: 2px solid var(--tina-color-grey-2);
  }

  svg {
    fill: currentColor;
    width: 24px;
    margin-right: 2px;
  }
`

export const ExitAction = () => {
  const cms = useCMS()
  return (
    <ExitButton
      onClick={() => {
        cms.disable()
      }}
    >
      <ExitIcon /> Exit Tina
    </ExitButton>
  )
}
