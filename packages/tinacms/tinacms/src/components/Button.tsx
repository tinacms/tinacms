import * as React from 'react'
import styled, { css } from 'styled-components'

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
  transition: opacity ${p => p.theme.timing.short} ease-out;
  &:hover {
    opacity: 0.6;
  }
  ${p =>
    p.disabled &&
    css`
      opacity: 0.25;
      pointer: not-allowed;
      pointer-events: none;
    `};
`
