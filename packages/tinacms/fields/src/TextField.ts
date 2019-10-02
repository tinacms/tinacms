import * as React from 'react'
import { color } from '@tinacms/styles'
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
