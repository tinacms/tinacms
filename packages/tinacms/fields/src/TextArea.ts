import * as React from 'react'
import styled, { css } from 'styled-components'
import { InputCss } from '.'

type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface TextAreaProps extends a {
  error?: boolean
  ref?: any
}

export const TextArea = styled.textarea<{ error?: boolean }>`
  ${InputCss};
  resize: vertical;
  height: 10rem;
`
