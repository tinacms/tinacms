import React from 'react'
import { withRef } from '@udecode/cn'
import { PlateElement } from '@udecode/plate-common'
import { useMermaidElement } from '../../hooks/use-mermaid-element'

export const MermaidElement = withRef<typeof PlateElement>(
  ({ nodeProps, ...props }, ref) => {
    const { children } = props
    const { mermaidRef } = useMermaidElement()

    return (
      <PlateElement ref={ref} {...props}>
        <div contentEditable={false}>
          <div ref={mermaidRef}>
            <code className="mermaid">
              {`stateDiagram
                [*] --> First
                state First {
                    [*] --> second
                    second --> [*]
                }`}
            </code>
          </div>
        </div>
        {children}
      </PlateElement>
    )
  }
)
