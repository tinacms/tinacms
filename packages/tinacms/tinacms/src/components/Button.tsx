import * as React from 'react'
import styled, { css } from 'styled-components'
import { color } from '@tinacms/styles'

export const Button = styled.button`
  text-align: center;
  border: 0;
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
