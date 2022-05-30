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
import { Button } from '../../packages/styles'
import { BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi'

export interface MediaPaginatorProps {
  navigateNext: () => void
  navigatePrev: () => void
  hasNext: boolean
  hasPrev: boolean
  variant?: 'primary' | 'secondary' | 'white' | 'ghost'
}

export function CursorPaginator({
  navigateNext,
  navigatePrev,
  hasNext,
  hasPrev,
  variant = 'secondary',
}: MediaPaginatorProps) {
  return (
    <div className="w-full flex flex-shrink-0 justify-end gap-2 items-center">
      <Button variant={variant} disabled={!hasPrev} onClick={navigatePrev}>
        <BiLeftArrowAlt className="w-6 h-full mr-2 opacity-70" /> Previous
      </Button>
      <Button variant={variant} disabled={!hasNext} onClick={navigateNext}>
        Next <BiRightArrowAlt className="w-6 h-full ml-2 opacity-70" />
      </Button>
    </div>
  )
}
