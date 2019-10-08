import * as React from 'react'
import styled, { css } from 'styled-components'
import { padding, color, radius, font } from '@tinacms/styles'

export interface ButtonProps {
  primary?: boolean
  small?: boolean
  margin?: boolean
  grow?: boolean
  open?: boolean
}

export const Button = styled.button<ButtonProps>`
  text-align: center;
  border: 0;
  border-radius: ${radius()};
  box-shadow: ${p => p.theme.shadow.small};
  background-color: ${color.grey()};
  border: 1px solid ${color.grey(2)};
  color: ${color.primary()};
  fill: ${color.primary()};
  font-weight: 500;
  cursor: pointer;
  font-size: ${font.size(1)};
  height: 2.5rem;
  padding: 0 ${padding()};
  transition: all 85ms ease-out;
  &:hover {
    background-color: ${color.grey(1)};
  }
  &:active {
    background-color: ${color.grey(2)};
  }

  ${p =>
    p.disabled &&
    css`
      opacity: 0.3;
      pointer: not-allowed;
      pointer-events: none;
    `};

  ${p =>
    p.primary &&
    css`
      background-color: ${color.primary()};
      color: ${color.grey()};
      fill: ${color.grey()};
      border: none;
      &:hover {
        background-color: ${color.primary('light')};
      }
      &:active {
        background-color: ${color.primary('dark')};
      }
    `};

  ${p =>
    p.small &&
    css`
      height: 2rem;
      font-size: ${font.size(0)};
      padding: 0 ${padding()};
    `};

  ${p =>
    p.margin &&
    css`
      &:not(:first-child) {
        margin-left: 0.5rem;
      }
    `};

  ${p =>
    p.grow &&
    css`
      flex-grow: 1;
    `};
`

export const IconButton = styled(Button)`
  padding: 0;
  width: 2.125rem;
  height: 2.125rem;
  margin: 0;
  position: relative;
  border: 1px solid ${color.primary()};
  transform-origin: 50% 50%;
  transition: all 150ms ease-out;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 1.625rem;
    height: 1.625rem;
  }

  ${p =>
    p.small &&
    css`
      width: 1.75rem;
      height: 1.75rem;
      padding: 0;

      svg {
        width: 1.5rem;
        height: 1.5rem;
      }
    `};

  ${props =>
    props.open &&
    css`
      transform: rotate(45deg);
      background-color: ${color.grey()};
      border-color: ${color.grey(2)};
      outline: none;
      fill: ${color.primary()};
      &:hover {
        background-color: ${color.grey(1)};
      }
      &:active {
        background-color: ${color.grey(2)};
      }
    `};
`
