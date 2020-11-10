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

import React from 'react'
import styled, { css } from 'styled-components'
import { MediaList, Plugin } from '@tinacms/core'

export interface MediaPaginatorProps {
  list: MediaList
  setOffset: (offset: number) => void
}

export interface MediaPaginatorPlugin extends Plugin {
  Component: React.ComponentType<MediaPaginatorProps>
}

export const BaseMediaPaginator: MediaPaginatorPlugin = {
  __type: 'media:ui',
  name: 'paginator',
  Component: PageLinks,
}

export function PageLinks({ list, setOffset }: MediaPaginatorProps) {
  const limit = list.limit || 10
  const numPages = Math.ceil(list.totalCount / limit)
  const lastItemIndexOnPage = list.offset + limit
  const currentPageIndex = lastItemIndexOnPage / limit
  let pageLinks = []

  if (numPages <= 1) {
    return null
  }

  for (let i = 1; i <= numPages; i++) {
    const active = i === currentPageIndex
    pageLinks.push(
      <PageNumber active={active} onClick={() => setOffset(i * limit)}>
        {i}
      </PageNumber>
    )
  }

  return <PageLinksWrap>{pageLinks}</PageLinksWrap>
}

const PageLinksWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: var(--tina-padding-small);
`

const PageNumber = styled.button<{ active: boolean }>`
  padding: 0 0.15rem;
  margin: var(--tina-padding-small);
  transition: box-shadow 180ms ease;
  background-color: transparent;
  border: none;

  :hover {
    cursor: pointer;
    box-shadow: 0 1px 0 var(--tina-color-grey-9);
  }

  ${p =>
    !p.active &&
    css`
      color: var(--tina-color-grey-4);
    `}
`
