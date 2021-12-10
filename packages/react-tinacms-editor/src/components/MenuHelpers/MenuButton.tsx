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

interface MenuButtonProps {
  children: React.ReactNode
  title?: string
  active?: boolean
  disabled?: boolean
  ref?: any
}

export const MenuButton = styled.button<{
  title?: string
  active?: boolean
  disabled?: boolean
  ref?: any
}>`
  padding: 8px !important;
  border: none;
  border-right: 1px solid var(--tina-color-grey-2);
  width: auto;
  height: auto;
  border-left: none;
  margin: 0 0 -1px 0;
  flex-grow: 1;
  max-width: 3rem;
  transition: background 150ms ease-out;

  &:hover {
    background-color: rgba(53, 50, 50, 0.09);
  }
  &:active {
    color: var(--tina-color-primary);
    fill: var(--tina-color-primary);
    background-color: rgba(53, 50, 50, 0.05);
  }
  svg {
    width: 20px;
    height: 20px;
  }
  ${(props) =>
    props.active &&
    css`
      color: var(--tina-color-primary);
      fill: var(--tina-color-primary);
      background-color: rgba(53, 50, 50, 0.05);
    `};
  ${(props) =>
    props.disabled &&
    css`
      pointer-events: none;
      color: #d1d1d1;
      fill: #d1d1d1;
    `};
`
