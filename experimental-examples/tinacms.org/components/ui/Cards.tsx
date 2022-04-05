import React from 'react'
import styled, { css } from 'styled-components'
import RightArrowSvg from '../../public/svg/right-arrow.svg'
import { DynamicLink } from './DynamicLink'

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: auto;
  grid-gap: 2rem;
  margin-top: 2rem;
`

export const Card = styled.a`
  border-radius: 5px;
  padding: 1rem;
  background-color: #fafafa;
  color: var(--color-secondary);
  border: 1px solid var(--color-light-dark);
  display: block;
  text-decoration: none;
  position: relative;
  padding-right: 3.5rem;

  span {
    font-size: 0.9375rem;
    text-transform: uppercase;
    opacity: 0.5;
  }

  h3,
  h4 {
    font-size: 1.25rem;
    line-height: 1.3;
    margin: 0 !important;
    transition: all 180ms ease-out;
  }

  svg {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translate3d(0, -50%, 0);
    width: 2rem;
    height: auto;
    fill: var(--color-grey);
    transition: all 180ms ease-out;
  }

  &:hover {
    h3,
    h4 {
      color: var(--color-orange);
    }
    svg {
      fill: var(--color-orange);
    }
  }
`
