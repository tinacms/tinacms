/**



*/

import * as React from 'react'
import { LoadingDots } from '@toolkit/form-builder'
import { Button } from '@toolkit/styles'

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
