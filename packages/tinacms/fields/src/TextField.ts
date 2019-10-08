import * as React from 'react'
import styled, { css } from 'styled-components'
import { InputCss } from './Input'

type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface TextFieldProps extends a {
  error?: boolean
  ref?: any
}

export const TextField = styled.input<TextFieldProps>`
  ${InputCss}
`
