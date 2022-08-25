import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'

import TinaIconSvg from '../../public/svg/tina-icon.svg'

interface TinaIconProps {
  docs?: boolean
  styleProps?: any
}

export const TinaIcon = styled(({ docs, ...styleProps }: TinaIconProps) => {
  const link = docs ? '/docs' : '/'

  return (
    <Link href={link}>
      <a {...styleProps}>
        <h1>
          <TinaIconSvg />
          {docs && <span>Docs</span>}
        </h1>
      </a>
    </Link>
  )
})`
  text-decoration: none;
  fill: var(--color-orange);

  h1 {
    margin: 0;
    display: flex;
    align-items: center;
  }

  span {
    font-size: 1.5rem;
    margin-left: 0.675rem;
    font-family: var(--font-tuner);
    font-weight: bold;
    color: var(--color-orange);
    margin-top: 0.5rem;
  }

  svg {
    height: 40px;
    width: auto;
  }
`
