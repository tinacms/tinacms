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
import { MediaListOffset } from '../../packages/core'
import { Button } from '../../packages/styles'

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
    <div className="w-full flex flex-shrink-0 justify-end gap-2 items-center bg-white border-t border-gray-100 py-3 px-5 shadow-sm z-10">
      <Button size="small" disabled={!hasPrev} onClick={navigatePrev}>
        &laquo; Previous
      </Button>
      <Button size="small" disabled={!hasNext} onClick={navigateNext}>
        Next &raquo;
      </Button>
    </div>
  )
}
