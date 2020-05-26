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

import styled, { css } from 'styled-components'

const MenuItem = css`
  flex: 1 1 32px;
`

export const MenuButton = styled.button<{
  active?: boolean
  disabled?: boolean
  ref?: any
}>`
  ${MenuItem}
  background-color: ${p =>
    p.active ? 'rgba(53, 50, 50, 0.05)' : 'transparent'};
  color: ${p =>
    p.active ? 'var(--tina-color-primary)' : 'var(--tina-color-grey-8)'};
  fill: ${p =>
    p.active ? 'var(--tina-color-primary)' : 'var(--tina-color-grey-8)'};
  border: 1px solid var(--tina-color-grey-2);
  margin: -1px;
  outline: none;
  padding: 6px 4px;
  transition: all 85ms ease-out;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
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
  ${props =>
    props.active &&
    css`
      color: var(--tina-color-primary);
      fill: var(--tina-color-primary);
      background-color: rgba(53, 50, 50, 0.05);
    `};
  ${props =>
    props.disabled &&
    css`
      pointer-events: none;
      color: #d1d1d1;
      fill: #d1d1d1;
    `};
`
