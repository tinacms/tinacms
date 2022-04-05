import React from 'react'
import styled from 'styled-components'
import TinaWordmarkSvg from '../../public/svg/tina-wordmark.svg'

export const TinaWordmark = styled(({ ...styleProps }) => {
  return (
    <a href="/" {...styleProps}>
      <h1>
        <TinaWordmarkSvg />
      </h1>
    </a>
  )
})`
  text-decoration: none;

  h1 {
    margin: 0;
    font-size: 1rem;
  }

  svg {
    height: 35px;
    width: auto;
    fill: inherit;
  }
`
