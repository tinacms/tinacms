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

import styled, { css } from 'styled-components'

interface BlockActionProps {
  active?: boolean
  disabled?: boolean
  onClick?: any
  ref?: any
}

export const BlockAction = styled.div<BlockActionProps>`
  background-color: ${(p) =>
    p.active ? 'rgba(53, 50, 50, 0.05)' : 'transparent'};
  color: ${(p) =>
    p.active ? 'var(--tina-color-primary)' : 'var(--tina-color-grey-8)'};
  fill: ${(p) =>
    p.active ? 'var(--tina-color-primary)' : 'var(--tina-color-grey-8)'};
  outline: none;
  border: none;
  padding: 4px 6px;
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
  &:not(:last-child) {
    border-right: 1px solid var(--tina-color-grey-2);
  }
  svg {
    width: 26px;
    height: auto;
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
