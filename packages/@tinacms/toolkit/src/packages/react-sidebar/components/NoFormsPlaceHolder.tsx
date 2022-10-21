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

import * as React from 'react'
import { LoadingDots } from '../../form-builder'
import { Button } from '../../styles'

export const PendingFormsPlaceholder = () => (
  <div
    className="relative flex flex-col items-center justify-center text-center p-5 pb-16 w-full h-full overflow-y-auto"
    style={{
      animationName: 'fade-in',
      animationDelay: '300ms',
      animationTimingFunction: 'ease-out',
      animationIterationCount: 1,
      animationFillMode: 'both',
      animationDuration: '150ms',
    }}
  >
    <p className="block pb-5">
      Please wait while Tina
      <br />
      loads your forms
    </p>
    <LoadingDots color={'var(--tina-color-primary)'} />
  </div>
)

export const NoFormsPlaceholder = () => (
  <div
    className="relative flex flex-col items-center justify-center text-center p-5 pb-16 w-full h-full overflow-y-auto"
    style={{
      animationName: 'fade-in',
      animationDelay: '300ms',
      animationTimingFunction: 'ease-out',
      animationIterationCount: 1,
      animationFillMode: 'both',
      animationDuration: '150ms',
    }}
  >
    <Emoji className="pb-5">🔎</Emoji>
    <p className="block pb-5">
      Looks like there's <br />
      nothing to edit on <br />
      this page.
    </p>
    <p className="block">
      <Button
        href="https://tina.io/docs/tinacms-context/"
        target="_blank"
        as="a"
      >
        <Emoji className="mr-1.5">📖</Emoji> Contextual Editing
      </Button>
    </p>
  </div>
)

const Emoji = ({ className = '', ...props }) => (
  <span
    className={`text-[24px] leading-none inline-block ${className}`}
    {...props}
  />
)
