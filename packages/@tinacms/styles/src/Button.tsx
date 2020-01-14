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
import { padding, color, radius, font, shadow } from './Styles'

export interface ButtonProps {
  primary?: boolean
  small?: boolean
  margin?: boolean
  grow?: boolean
  open?: boolean
  busy?: boolean
}

export const Button = styled.button<ButtonProps>`
  text-align: center;
  border: 0;
  border-radius: ${radius()};
  box-shadow: ${shadow('small')};
  background-color: ${color.grey()};
  border: 1px solid ${color.grey(2)};
  color: ${color.primary()};
  fill: ${color.primary()};
  font-weight: 500;
  cursor: pointer;
  font-size: ${font.size(1)};
  height: 40px;
  padding: 0 ${padding()};
  transition: all 85ms ease-out;

  &:hover {
    background-color: ${color.grey(1)};
  }
  &:active {
    background-color: ${color.grey(2)};
    outline: none;
  }

  ${p =>
    p.disabled &&
    css`
      opacity: 0.3;
      pointer: not-allowed;
      pointer-events: none;
    `};

  ${p =>
    p.primary &&
    css`
      background-color: ${color.primary()};
      color: ${color.grey()};
      fill: ${color.grey()};
      border: none;
      &:hover {
        background-color: ${color.primary('light')};
      }
      &:active {
        background-color: ${color.primary('dark')};
      }
    `};

  ${p =>
    p.small &&
    css`
      height: 32px;
      font-size: ${font.size(0)};
      padding: 0 ${padding()};
    `};

  ${p =>
    p.margin &&
    css`
      &:not(:first-child) {
        margin-left: 8px;
      }
    `};

  ${p =>
    p.grow &&
    css`
      flex-grow: 1;
    `};

  ${p =>
    p.busy &&
    css`
      cursor: wait;
    `};
`

export const IconButton = styled(Button)`
  padding: 0;
  width: 32px;
  height: 32px;
  margin: 0;
  position: relative;
  transform-origin: 50% 50%;
  transition: all 150ms ease-out;
  padding: 0;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;

  svg {
    width: 26px;
    height: 26px;
  }

  ${p =>
    p.small &&
    css`
      width: 28px;
      height: 28px;
      padding: 0;

      svg {
        width: 24px;
        height: 24px;
      }
    `};

  ${props =>
    props.open &&
    css`
      transform: rotate(45deg);
      background-color: ${color.grey()};
      border-color: ${color.grey(2)};
      outline: none;
      fill: ${color.primary()};
      &:hover {
        background-color: ${color.grey(1)};
      }
      &:active {
        background-color: ${color.grey(2)};
      }
    `};
`
