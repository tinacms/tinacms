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
import { color } from '@tinacms/styles'
import styled, { css } from 'styled-components'

type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface TextAreaProps extends a {
  error?: boolean
  ref?: any
}

export const TextArea = styled.textarea<{ error?: boolean }>`
  position: relative;
  background-color: white;
  border-radius: 0.3rem;
  font-size: ${p => p.theme.input.fontSize};
  line-height: ${p => p.theme.input.lineHeight};
  transition: all 85ms ease-out;
  padding: ${p => p.theme.input.padding};
  border: 1px solid #edecf3;
  width: 100%;
  margin: 0;
  outline: none;
  resize: vertical;
  height: 10rem;
  box-shadow: 0 0 0 2px ${p => (p.error ? color('error') : 'transparent')};

  &:hover {
    box-shadow: 0 0 0 2px #e1ddec;
  }

  &:focus {
    box-shadow: 0 0 0 2px ${p => (p.error ? color('error') : color('primary'))};
  }

  &::placeholder {
    font-size: 0.9rem;
    color: #cfd3d7;
  }
`
