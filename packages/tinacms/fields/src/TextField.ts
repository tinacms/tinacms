import * as React from 'react'
import { color, padding, font } from '@tinacms/styles'
import styled, { css } from 'styled-components'

type a = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>
export interface InputProps extends a {
  error?: boolean
  ref?: any
}

export const TextFieldCss = css<{ error?: boolean }>`
  position: relative;
  background-color: white;
  border-radius: 0.3rem;
  font-size: ${font.size(2)};
  line-height: 1.32;
  transition: all 85ms ease-out;
  padding: ${padding('small')};
  border: 1px solid #edecf3;
  width: 100%;
  margin: 0;
  outline: none;
  box-shadow: 0 0 0 2px ${p => (p.error ? color.error() : 'transparent')};

  &:hover {
    box-shadow: 0 0 0 2px #e1ddec;
  }

  &:focus {
    box-shadow: 0 0 0 2px ${p => (p.error ? color.error() : color.primary())};
  }

  &::placeholder {
    font-size: 0.9rem;
    color: #cfd3d7;
  }
`

export const TextField = styled.input<{ error?: boolean }>`
  ${TextFieldCss}
`
