import React from 'react'
import styled from 'styled-components'

export const ArrowList = styled(({ children, ...styleProps }) => {
  return <ul {...styleProps}>{children}</ul>
})`
  margin: 0;
  list-style: none !important;
  padding-left: 0 !important;
  padding-bottom: 0 !important;
  color: var(--color-secondary-dark, #241748);
  li {
    position: relative;
    margin-bottom: 1rem !important;
    padding-left: 2.5em;
    font-size: 1.125rem;
    &:before {
      content: '↳';
      position: absolute;
      font-weight: bold;
      left: 2px;
      top: -1px;
      font-size: 1.75rem;
      line-height: 1;
      color: var(--color-orange, #ec4815);
    }
  }
`
