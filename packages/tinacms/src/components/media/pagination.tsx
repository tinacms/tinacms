/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import React, { ChangeEvent } from 'react'
import styled, { css } from 'styled-components'
import { MediaList } from '@tinacms/core'

interface PageLinksProps {
  list: MediaList
  setOffset: (offset: number) => void
}

export function PageLinks({ list, setOffset }: PageLinksProps) {
  const limit = list.limit || 10
  const numPages = Math.ceil(list.totalCount / limit)
  const lastItemIndexOnPage = list.offset + limit
  const currentPageIndex = Math.ceil(lastItemIndexOnPage / limit)
  const shouldUseAdvanced = numPages + 1 > 10

  if (numPages <= 1) {
    return null
  }

  if (shouldUseAdvanced) {
    return (
      <PageLinksWrap>
        <AdvancedPageLinks
          list={list}
          setOffset={setOffset}
          numPages={numPages}
          limit={limit}
          currentPageIndex={currentPageIndex}
        />
      </PageLinksWrap>
    )
  }

  return (
    <PageLinksWrap>
      <SimplePageLinks
        list={list}
        setOffset={setOffset}
        numPages={numPages}
        limit={limit}
        currentPageIndex={currentPageIndex}
      />
    </PageLinksWrap>
  )
}

export interface PaginationProps {
  list: MediaList
  setOffset: Function
  numPages: number
  limit: number
  currentPageIndex: number
}

const SimplePageLinks = ({
  setOffset,
  numPages,
  limit,
  currentPageIndex,
}: PaginationProps) => {
  let pageLinks = []

  for (let i = 1; i <= numPages; i++) {
    const active = i === currentPageIndex
    pageLinks.push(
      <PageButton active={active} onClick={() => setOffset(i * limit)}>
        {i}
      </PageButton>
    )
  }

  return <>{pageLinks}</>
}

const AdvancedPageLinks = ({
  list,
  setOffset,
  limit,
  numPages,
  currentPageIndex,
}: PaginationProps) => {
  const shouldAllowFirst = currentPageIndex > 1
  const shouldAllowPrev = list.offset - limit >= 0
  const shouldAllowNext = list?.nextOffset
    ? list.nextOffset <= list.totalCount
    : false
  const shouldAllowLast = list?.nextOffset
    ? list.nextOffset < list.totalCount
    : false
  const previousOffset = shouldAllowPrev ? list.offset - limit : list.offset
  const nextOffset = shouldAllowNext ? list.nextOffset : list.offset
  const lastOffset = list.totalCount - list.limit
  let pages = []

  if (pages.length !== numPages) {
    let i = 0
    while (pages.length <= numPages) {
      pages.push(i++)
    }
  }

  return (
    <>
      <PageButton onClick={() => setOffset(0)} disabled={!shouldAllowFirst}>
        First
      </PageButton>
      <PageButton
        onClick={() => setOffset(previousOffset)}
        disabled={!shouldAllowPrev}
      >
        Prev
      </PageButton>
      <PageLinksText>
        Showing page
        <PageSelector
          onChange={(event: ChangeEvent<any>) =>
            event?.target?.value ? setOffset(event.target.value * limit) : null
          }
        >
          {pages.map(page => (
            <option
              value={page}
              selected={page + 1 === currentPageIndex}
              key={page}
            >
              {page + 1}
            </option>
          ))}
        </PageSelector>
        of {numPages + 1}
      </PageLinksText>
      <PageButton
        onClick={() => setOffset(nextOffset)}
        disabled={!shouldAllowNext}
      >
        Next
      </PageButton>
      <PageButton
        onClick={() => setOffset(lastOffset)}
        disabled={!shouldAllowLast}
      >
        Last
      </PageButton>
    </>
  )
}

const PageLinksWrap = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const PageButton = styled.button<{ active?: boolean }>`
  padding: 0 0.15rem;
  margin: var(--tina-padding-small);
  transition: border 180ms ease;
  border-radius: var(--tina-radius-small);
  box-shadow: var(--tina-shadow-small);
  background-color: var(--tina-color-grey-0);
  border: 1px solid var(--tina-color-grey-2);
  color: var(--tina-color-primary);
  fill: var(--tina-color-primary);
  font-weight: var(--tina-font-weight-regular);
  cursor: pointer;
  font-size: var(--tina-font-size-1);
  transition: all 85ms ease-out;

  &:hover {
    background-color: var(--tina-color-grey-1);
  }

  &:active, &:disabled {
    background-color: var(--tina-color-grey-2);
    outline: none;
  }

  &:disabled {
    color: var(--tina-color-grey-5);
    cursor: initial;
  }

  ${p =>
    p.active &&
    css`
      background-color: var(--tina-color-primary);
      color: var(--tina-color-grey-0);
      fill: var(--tina-color-grey-0);
      border: none;
      &:hover {
        background-color: var(--tina-color-primary-light);
      }
      &:active {
        background-color: var(--tina-color-primary-dark);
      }
    `}
  }
`

const PageSelector = styled.select`
  border: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  -ms-appearance: none;
  padding: 0 0.15rem;
  margin: var(--tina-padding-small);
  transition: border 180ms ease;
  border-radius: var(--tina-radius-small);
  box-shadow: var(--tina-shadow-small);
  background-color: var(--tina-color-grey-0);
  border: 1px solid var(--tina-color-grey-2);
  color: var(--tina-color-primary);
  fill: var(--tina-color-primary);
  font-weight: var(--tina-font-weight-regular);
  cursor: pointer;
  font-size: var(--tina-font-size-1);
  transition: all 85ms ease-out;

  &:hover {
    background-color: var(--tina-color-grey-1);
  }

  &:active {
    background-color: var(--tina-color-grey-2);
    outline: none;
  }
`

const PageLinksText = styled.p`
  font-size: var(--tina-font-size-1);
  color: var(--tina-color-grey-5);
`
