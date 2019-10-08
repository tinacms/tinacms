import * as React from 'react'
import styled, { css } from 'styled-components'
import { padding, color, radius, font } from '@tinacms/styles'

export interface InputProps {
  error?: boolean
  small?: boolean
  placeholder?: string
}

export const InputCss = css<InputProps>`
  padding: ${padding('small')};
  border-radius: ${radius('small')};
  background: ${color.grey(0)};
  font-size: ${font.size(2)};
  line-height: 1.35;
  position: relative;
  background-color: ${color.grey()};
  transition: all 85ms ease-out;
  border: 1px solid ${color.grey(2)};
  width: 100%;
  margin: 0;
  outline: none;
  box-shadow: 0 0 0 2px ${p => (p.error ? color.error() : 'transparent')};

  &:hover {
    box-shadow: 0 0 0 2px ${color.grey(3)};
  }

  &:focus {
    box-shadow: 0 0 0 2px ${p => (p.error ? color.error() : color.primary())};
  }

  &::placeholder {
    font-size: ${font.size(2)};
    color: ${color.grey(3)};
  }

  ${p =>
    p.small &&
    css`
      font-size: ${font.size(1)};
      padding: 0.5rem ${padding('small')};
    `};
`

export const Input = styled.input<InputProps>`
  ${InputCss}
`
