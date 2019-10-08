import * as React from 'react'
import styled, { css } from 'styled-components'
import { InputCss, InputProps } from '.'

type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface TextFieldProps extends a {
  error?: boolean
  ref?: any
}

export const TextFieldCss = css<InputProps>`
  ${InputCss};
`

export const TextField = styled.input<TextFieldProps>`
  ${TextFieldCss}
`
