import * as React from 'react'
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
  background-color: ${p => p.theme.color.light};
  border-width: 1px;
  border-style: solid;
  border-color: ${p => (p.error ? 'red' : '#F2F2F2')};
  border-radius: ${p => p.theme.input.radius};
  height: 10rem;
  width: 100%;
  font-size: ${p => p.theme.input.fontSize};
  padding: ${p => p.theme.input.padding};
  margin: 0;
  outline: none;
  resize: vertical;
  line-height: ${p => p.theme.input.lineHeight};
  transition: all ${p => p.theme.timing.short} ease-out;

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
