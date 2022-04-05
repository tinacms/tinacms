import React from 'react'
import styled, { css } from 'styled-components'

export const NavToggle = styled(({ open, ...styleProps }) => {
  return (
    <button {...styleProps}>
      <span></span>
      <span></span>
      <span></span>
    </button>
  )
})`
  background: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0.5rem;
  user-select: none;

  span {
    width: 20px;
    height: 2px;
    margin-top: -1px;
    border-radius: 3px;
    display: block;
    position: absolute;
    background-color: var(--color-orange);
    top: 50%;
    left: 50%;
    transition: all 180ms ease-out;
    transform: translate3d(-50%, -6px, 0);

    &:nth-child(2) {
      transform: translate3d(-50%, 0, 0);
    }

    &:last-child {
      transform: translate3d(-50%, 6px, 0);
    }
  }

  ${(props) =>
    props.open &&
    css`
      span {
        transform: translate3d(-50%, 0, 0) rotate(45deg);

        &:nth-child(2) {
          opacity: 0;
          transform: translate3d(-50%, 0, 0) scale3d(0, 1, 1);
        }

        &:last-child {
          transform: translate3d(-50%, 0, 0) rotate(-45deg);
        }
      }
    `};
`
