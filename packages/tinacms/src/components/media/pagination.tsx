/**

Copyright 2021 Forestry.io Holdings, Inc.

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
import styled from 'styled-components'
import { MediaListOffset } from '@einsteinindustries/tinacms-core'
import { Button } from '@einsteinindustries/tinacms-styles'

export interface MediaPaginatorProps {
  currentOffset: MediaListOffset
  navigateNext: () => void
  navigatePrev: () => void
  hasNext: boolean
  hasPrev: boolean
}

export function CursorPaginator({
  navigateNext,
  navigatePrev,
  hasNext,
  hasPrev,
}: MediaPaginatorProps) {
  return (
    <PageLinksWrap>
      <Button small disabled={!hasPrev} onClick={navigatePrev}>
        &laquo; Previous
      </Button>
      <Button small disabled={!hasNext} onClick={navigateNext}>
        Next &raquo;
      </Button>
    </PageLinksWrap>
  )
}

const PageLinksWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: var(--tina-padding-small);
`
