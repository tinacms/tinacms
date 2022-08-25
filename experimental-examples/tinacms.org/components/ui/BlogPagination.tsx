import React, { useState } from 'react'
import styled from 'styled-components'
import Router from 'next/router'

import { DynamicLink } from './DynamicLink'

export const BlogPagination = styled(
  ({ currentPage, numPages, ...styleProps }) => {
    const isFirst = currentPage === 1
    const isLast = currentPage === numPages
    const prevPage = `/blog/page/${currentPage - 1}`
    const nextPage = `/blog/page/${currentPage + 1}`
    const [selectValue, setSelectValue] = useState(currentPage)

    function handleSelectChange(e) {
      e.preventDefault()
      const pageNumber = e.target.value
      setSelectValue(pageNumber)
      return Router.push(`/blog/page/${pageNumber}`)
    }

    return (
      <div {...styleProps}>
        <PaginationLinks>
          {!isFirst && (
            <DynamicLink href={prevPage} passHref>
              <a onClick={() => setSelectValue(selectValue - 1)}>← Newer</a>
            </DynamicLink>
          )}
          {!isLast && (
            <DynamicLink href={nextPage} passHref>
              <a onClick={() => setSelectValue(selectValue + 1)}>Older →</a>
            </DynamicLink>
          )}
        </PaginationLinks>
        <div>
          Page{' '}
          <SelectWrapper>
            <select
              aria-label="Pagination Dropdown"
              value={selectValue}
              onChange={handleSelectChange}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <option
                  arial-label={`Go to Page ${i + 1}`}
                  aria-current={i + 1 === currentPage ? true : false}
                  value={i + 1}
                  key={`page-${i}`}
                >
                  {i + 1}
                </option>
              ))}
            </select>
          </SelectWrapper>{' '}
          of {numPages}
        </div>
      </div>
    )
  }
)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.125rem;
  margin-bottom: 2rem;

  p {
    color: var(--color-secondary);
  }

  select {
    display: inline-block;
    padding: 0.1rem 1.25rem 0.1rem 0.5rem;
    border-radius: 0.3em;
    background-color: var(--color-light);
    border: 1px solid var(--color-light-dark);
    border-radius: 0.3rem;
    color: var(--color-orange);
    outline: none;
    cursor: pointer;

    -moz-appearance: none;
    -webkit-appearance: none;

    &:-moz-focusring {
      color: transparent;
      text-shadow: 0 0 0 #000;
    }

    &::-ms-expand {
      display: none;
    }
  }

  a {
    text-decoration: none;
    color: var(--color-orange);
    position: relative;
    overflow: visible;
    padding: 0.5rem;
    margin: -0.5rem 1rem -0.5rem -0.5rem;
  }
`

const SelectWrapper = styled.div`
  display: inline-block;
  position: relative;

  &:after {
    content: '▼';
    display: block;
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translate3d(0, -50%, 0);
    color: var(--color-orange);
    font-size: 0.5rem;
  }
`

const PaginationLinks = styled.div``
