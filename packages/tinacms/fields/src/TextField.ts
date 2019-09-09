import * as React from 'react'
import styled, { css } from 'styled-components'

type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface InputProps extends a {
  error?: boolean
  ref?: any
}

export const TextField = styled.input<{ error?: boolean }>`
  background-color: ${p => p.theme.color.light};
  border-color: ${p => (p.error ? 'red' : '#F2F2F2')};
  border-radius: ${p => p.theme.input.radius};
  font-size: ${p => p.theme.input.fontSize};
  line-height: ${p => p.theme.input.lineHeight};
  transition: all ${p => p.theme.timing.short} ease-out;
  padding: ${p => p.theme.input.padding};
  border-width: 1px;
  border-style: solid;
  border-color: ${p => (p.error ? 'red' : '#F2F2F2')};
  width: 100%;
  margin: 0;
  outline: none;

  &:hover {
    background-color: #f2f2f2;
  }

  &:focus {
    border-color: #333333;
    background-color: #f8f8f8;
  }

  &::placeholder {
    font-size: 0.9rem;
    color: #cfd3d7;
  }
  ${props =>
    props.error &&
    css`
      border-color: red;
      &:focus {
        border-color: red;
      }
    `};
`
