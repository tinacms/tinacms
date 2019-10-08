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
import { color } from '@tinacms/styles'

export const Button = styled.button`
  text-align: center;
  border: 1px solid #0574e4;
  border-radius: ${p => p.theme.radius.big};
  box-shadow: ${p => p.theme.shadow.small};
  background-color: ${color('primary')};
  color: white;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.75rem;
  transition: all 85ms ease-out;
  &:hover {
    background-color: #2296fe;
  }
  &:active {
    background-color: #0574e4;
  }
  ${p =>
    p.disabled &&
    css`
      opacity: 0.25;
      pointer: not-allowed;
      pointer-events: none;
    `};
`
