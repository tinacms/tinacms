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

export const MenuOption = styled.div<{ disabled: boolean; active: boolean }>`
  display: block;
  padding: 8px 16px;
  transition: all 85ms ease-out;
  cursor: pointer;
  &:first-child {
    padding-top: var(--tina-padding-small);
  }
  &:last-child {
    padding-bottom: var(--tina-padding-small);
  }
  &:hover {
    background-color: var(--tina-color-grey-1);
    color: var(--tina-color-primary);
  }
  &:active {
    color: var(--tina-color-primary);
    fill: var(--tina-color-primary);
    background-color: rgba(53, 50, 50, 0.05);
  }
  ${props =>
    props.active &&
    css`
      color: var(--tina-color-primary);
      fill: var(--tina-color-primary);
      background-color: rgba(53, 50, 50, 0.05);
    `};
`
