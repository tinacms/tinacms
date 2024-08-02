'use client'

import React from 'react'

import { cn, withRef } from '@udecode/cn'
import { useCodeBlockElementState } from '@udecode/plate-code-block'
import { PlateElement } from '@udecode/plate-common'
import { CodeBlock } from '../../plugins/ui/code-block'

export const CodeBlockElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { element } = props
    const state = useCodeBlockElementState({ element })

    return (
      <PlateElement
        className={cn('relative py-1', state.className, className)}
        ref={ref}
        {...props}
      >
        <CodeBlock {...props} />
      </PlateElement>
    )
  }
)
